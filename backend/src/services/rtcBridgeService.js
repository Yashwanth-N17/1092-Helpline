/**
 * WebRTC Signaling & Audio Bridge
 *
 * Connection types (identified by WebSocket URL):
 *   /citizen/{callId}  — public SOS page (no auth)
 *   /agent/{callId}    — agent dashboard (authenticated)
 *
 * Message types:
 *   citizen -> server:  { type: "audio_chunk", data: base64 }
 *   server -> citizen:  { type: "ai_audio", data: base64 }   (AI TTS)
 *   server -> agent:    { type: "transcript_update", data: {...} }
 *   server -> agent:    { type: "emotion_update", data: {...} }
 *   server -> agent:    { type: "confidence_update", data: {...} }
 *   agent -> server:    { type: "agent_audio_chunk", data: base64 }
 *   server -> citizen:  { type: "agent_audio", data: base64 }  (after escalation)
 *   server -> agent:    { type: "escalation_required", data: {} } (auto-escalation)
 */

const AIBridgeService = require("./aiBridgeService");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class RTCBridgeService {
  constructor() {
    // callId -> { citizen: ws, agent: ws | null, escalated: bool, buffer: [] }
    this.rooms = new Map();
  }

  /**
   * Register a citizen WebSocket connection for a call
   */
  registerCitizen(callId, ws) {
    if (!this.rooms.has(callId)) {
      this.rooms.set(callId, { citizen: null, agent: null, escalated: false, buffer: [] });
    }
    const room = this.rooms.get(callId);
    room.citizen = ws;

    console.log(`[RTCBridge] Citizen connected for call ${callId}`);

    ws.on("message", async (rawMsg) => {
      try {
        const msg = JSON.parse(rawMsg.toString());

        if (msg.type === "audio_chunk") {
          // Forward raw audio to AI for analysis
          const audioBuffer = Buffer.from(msg.data, "base64");
          this._processAudio(callId, audioBuffer, ws);
        } else if (msg.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
        }
      } catch (e) {
        // handle binary directly if not JSON
      }
    });

    ws.on("close", () => {
      console.log(`[RTCBridge] Citizen disconnected for call ${callId}`);
      const r = this.rooms.get(callId);
      if (r) r.citizen = null;
    });
  }

  /**
   * Register an agent WebSocket connection for a call
   */
  registerAgent(callId, ws) {
    if (!this.rooms.has(callId)) {
      this.rooms.set(callId, { citizen: null, agent: null, escalated: false, buffer: [] });
    }
    const room = this.rooms.get(callId);
    room.agent = ws;

    console.log(`[RTCBridge] Agent connected for call ${callId}`);

    ws.on("message", async (rawMsg) => {
      try {
        const msg = JSON.parse(rawMsg.toString());

        // Agent speaks — send their audio to citizen
        if (msg.type === "agent_audio_chunk" && room.escalated) {
          this._sendToCitizen(callId, { type: "agent_audio", data: msg.data });
        } else if (msg.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
        }
      } catch (e) {}
    });

    ws.on("close", () => {
      console.log(`[RTCBridge] Agent disconnected for call ${callId}`);
      const r = this.rooms.get(callId);
      if (r) r.agent = null;
    });
  }

  /**
   * Process incoming audio from citizen — send to AI, get back analysis
   */
  async _processAudio(callId, audioBuffer, citizenWs) {
    const room = this.rooms.get(callId);
    if (!room) return;

    // If already escalated, forward raw audio to agent (no AI)
    if (room.escalated && room.agent && room.agent.readyState === 1) {
      room.agent.send(JSON.stringify({
        type: "citizen_audio",
        data: audioBuffer.toString("base64"),
      }));
      return;
    }

    // Otherwise send to AI service for STT + analysis
    const result = await AIBridgeService.processAudioChunk(callId, audioBuffer);
    if (!result) return;

    const { transcript, emotion, urgency, confidence, intent, location, issue,
            suggested_actions, prank_score, tts_audio } = result;

    // Push transcript to DB
    if (transcript) {
      try {
        const call = await prisma.call.findUnique({ where: { callId } });
        if (call) {
          const existing = Array.isArray(call.transcript) ? call.transcript : [];
          await prisma.call.update({
            where: { callId },
            data: {
              transcript: [...existing, {
                id: Date.now().toString(),
                speaker: "citizen",
                text: transcript,
                timestamp: new Date().toISOString(),
              }],
              emotion: emotion || call.emotion,
              urgency: urgency || call.urgency,
              confidence: confidence ?? call.confidence,
              intent: intent || call.intent,
              location: location || call.location,
              issue: issue || call.issue,
              suggestedActions: suggested_actions || call.suggestedActions,
            },
          });
        }
      } catch (e) {
        console.error("[RTCBridge] DB update error:", e.message);
      }

      // Notify agent dashboard
      if (room.agent && room.agent.readyState === 1) {
        room.agent.send(JSON.stringify({ type: "transcript_update", data: {
          id: Date.now().toString(), speaker: "citizen", text: transcript,
          timestamp: new Date().toISOString()
        }}));
        room.agent.send(JSON.stringify({ type: "emotion_update", data: { emotion } }));
        room.agent.send(JSON.stringify({ type: "confidence_update", data: { confidence, reason: `Urgency: ${urgency}` } }));
        room.agent.send(JSON.stringify({ type: "ai_insight_update", data: { intent, location, issue, suggestedActions: suggested_actions } }));
      }

      // Auto-escalate if AI determines HIGH urgency or LOW confidence
      if ((urgency === "HIGH" || confidence < 0.4) && !room.escalated) {
        this.escalate(callId, "auto");
      }
    }

    // Send AI TTS audio back to citizen if available
    if (tts_audio) {
      this._sendToCitizen(callId, { type: "ai_audio", data: tts_audio });
    }
  }

  /**
   * Escalate a call — switch from AI mode to agent bridge mode
   */
  async escalate(callId, reason = "manual") {
    const room = this.rooms.get(callId);
    if (!room || room.escalated) return;

    room.escalated = true;
    console.log(`[RTCBridge] Call ${callId} escalated (${reason})`);

    // Update DB
    try {
      await prisma.call.update({
        where: { callId },
        data: { status: "escalated" },
      });
    } catch (e) {}

    // Notify citizen: AI stepping back
    this._sendToCitizen(callId, {
      type: "ai_audio",
      data: null, // frontend will play a hold tone
      message: "Connecting you to a human specialist. Please hold.",
    });

    // Notify agent: escalation required
    if (room.agent && room.agent.readyState === 1) {
      room.agent.send(JSON.stringify({
        type: "escalation_required",
        data: { callId, reason },
      }));
    }
  }

  _sendToCitizen(callId, payload) {
    const room = this.rooms.get(callId);
    if (room?.citizen && room.citizen.readyState === 1) {
      room.citizen.send(JSON.stringify(payload));
    }
  }

  closeRoom(callId) {
    this.rooms.delete(callId);
  }
}

module.exports = new RTCBridgeService(); // Singleton

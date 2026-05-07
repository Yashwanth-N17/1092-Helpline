const AIBridgeService = require("./aiBridgeService");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class RTCBridgeService {
  constructor() {
    // callId -> { citizen: ws, agent: ws | null, escalated: bool, audioBuffer: Buffer, lastProcessTime: number }
    this.rooms = new Map();
  }

  /**
   * Register a citizen WebSocket connection for a call
   */
  async registerCitizen(callId, ws) {
    if (!this.rooms.has(callId)) {
      this.rooms.set(callId, { 
        citizen: null, 
        agent: null, 
        escalated: false, 
        audioBuffer: Buffer.alloc(0),
        lastProcessTime: Date.now()
      });
    }
    const room = this.rooms.get(callId);
    room.citizen = ws;

    console.log(`[RTCBridge] Citizen connected for call ${callId}`);

    // Create call record in DB if it doesn't exist
    try {
      const existing = await prisma.call.findUnique({ where: { callId } });
      if (!existing) {
        await prisma.call.create({
          data: {
            callId,
            status: "active",
            startTime: new Date(),
          },
        });
        console.log(`[RTCBridge] Created DB record for call ${callId}`);
        const socketService = require("./socketService");
        socketService.broadcastAll("new_call", { callId });

        // Send initial greeting to the citizen
        setTimeout(() => {
          this._sendToCitizen(callId, {
            type: "ai_speech",
            text: "Namaskara! This is the 1092 Helpline. What is your emergency? (ನೀವು ಕನ್ನಡದಲ್ಲೂ ಮಾತನಾಡಬಹುದು)"
          });
        }, 2500);
      }
    } catch (e) {
      console.error("[RTCBridge] Failed to create call record:", e.message);
    }

    ws.on("message", async (rawMsg) => {
      try {
        const msg = JSON.parse(rawMsg.toString());

        if (msg.type === "audio_chunk") {
          const chunk = Buffer.from(msg.data, "base64");
          room.audioBuffer = Buffer.concat([room.audioBuffer, chunk]);

          // Process buffer every 4 seconds if it has data
          const now = Date.now();
          if (now - room.lastProcessTime > 4000 && room.audioBuffer.length > 0) {
            room.lastProcessTime = now;
            this._processAudio(callId);
          }
        } else if (msg.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
        }
      } catch (e) {}
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
      this.rooms.set(callId, { 
        citizen: null, 
        agent: null, 
        escalated: false, 
        audioBuffer: Buffer.alloc(0),
        lastProcessTime: Date.now()
      });
    }
    const room = this.rooms.get(callId);
    room.agent = ws;

    console.log(`[RTCBridge] Agent connected for call ${callId}`);

    ws.on("message", async (rawMsg) => {
      try {
        const msg = JSON.parse(rawMsg.toString());
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
   * Process accumulated audio buffer
   */
  async _processAudio(callId) {
    const room = this.rooms.get(callId);
    if (!room || room.audioBuffer.length === 0) return;

    // If escalated, forward raw audio chunks to agent is handled per-chunk usually,
    // but here we are in AI mode. If they escalated mid-buffer, we stop AI.
    if (room.escalated) return;

    console.log(`[RTCBridge] Processing ${room.audioBuffer.length} bytes for ${callId}`);

    // Send the current FULL buffer to AI for analysis
    const result = await AIBridgeService.processAudioChunk(callId, room.audioBuffer);
    if (!result || !result.transcript) return;

    // Clear buffer so we can start fresh for the next segment
    room.audioBuffer = Buffer.alloc(0);

    const { transcript, emotion, urgency, category, respond_text, tts_audio } = result;

    // Push to DB
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
            urgency: urgency?.toUpperCase() || call.urgency,
            category: category || call.category,
          },
        });
      }
    } catch (e) {}

    // Notify agent dashboard
    if (room.agent && room.agent.readyState === 1) {
      room.agent.send(JSON.stringify({ type: "transcript_update", data: {
        id: Date.now().toString(), speaker: "citizen", text: transcript,
        timestamp: new Date().toISOString()
      }}));
      room.agent.send(JSON.stringify({ type: "emotion_update", data: { emotion } }));
      room.agent.send(JSON.stringify({ type: "confidence_update", data: { confidence: 0.9, reason: `Urgency: ${urgency}` } }));
    }

    // Send AI TTS or text-to-speech instructions back to citizen
    if (respond_text) {
      this._sendToCitizen(callId, { type: "ai_speech", text: respond_text });
    }
    
    if (tts_audio) {
      this._sendToCitizen(callId, { type: "ai_audio", data: tts_audio });
    }
  }

  async escalate(callId, reason = "manual") {
    const room = this.rooms.get(callId);
    if (!room || room.escalated) return;

    room.escalated = true;
    try {
      await prisma.call.update({
        where: { callId },
        data: { status: "escalated" },
      });
    } catch (e) {}

    this._sendToCitizen(callId, {
      type: "ai_audio",
      data: null,
      message: "Connecting you to a human specialist.",
    });

    if (room.agent && room.agent.readyState === 1) {
      room.agent.send(JSON.stringify({ type: "escalation_required", data: { callId, reason } }));
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

module.exports = new RTCBridgeService();

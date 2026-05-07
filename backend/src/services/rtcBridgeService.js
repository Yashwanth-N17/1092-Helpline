const AIBridgeService = require("./aiBridgeService");
const { PrismaClient } = require("@prisma/client");
const EventEmitter = require("events");
const prisma = new PrismaClient();

// Attempt messages for AI dispatcher interview
const ATTEMPT_MESSAGES = {
  1: "Attempt 1: Please tell me your name and what is the emergency?",
  2: "Attempt 2: I'm having trouble understanding. Can you clearly state your location and the nature of the emergency?",
  forwarding: "I was unable to gather enough information. Forwarding your call to a live emergency responder now. Please hold."
};

class RTCBridgeService extends EventEmitter {
  constructor() {
    super();
    this.rooms = new Map();
  }

  async registerCitizen(callId, ws) {
    console.log(`[RTCBridge] REGISTER_CITIZEN: ${callId}`);

    if (!this.rooms.has(callId)) {
      this.rooms.set(callId, {
        citizen: null,
        agent: null,
        escalated: false,
        pendingEscalation: false, // Locks out further AI processing once limit is hit
        audioBuffer: Buffer.alloc(0),
        agentAudioBuffer: Buffer.alloc(0),
        lastProcessTime: Date.now(),
        lastAgentProcessTime: Date.now(),
        aiAttempts: 0,           // Track how many full AI exchanges have occurred
        hasValidInfo: false,     // True once we have both location and category
      });
    }

    const room = this.rooms.get(callId);
    room.citizen = ws;

    // Create call record in DB
    try {
      const existing = await prisma.call.findUnique({ where: { callId } });
      if (!existing) {
        await prisma.call.create({
          data: { callId, status: "active", startTime: new Date() },
        });
        console.log(`[RTCBridge] DB_CREATED: ${callId}`);
        this.emit("new_call", { callId });

        // Initial greeting after 2.5s
        setTimeout(() => {
          if (!room.escalated) {
            this._sendToCitizen(callId, {
              type: "ai_speech",
              text: "Namaskara! This is the 1092 Helpline. What is your emergency? Please tell me your name, location, and what happened. (ನೀವು ಕನ್ನಡದಲ್ಲೂ ಮಾತನಾಡಬಹುದು)"
            });
          }
        }, 2500);
      }
    } catch (e) {
      console.error("[RTCBridge] DB_ERROR:", e.message);
    }

    ws.on("message", async (rawMsg) => {
      try {
        const msg = JSON.parse(rawMsg.toString());

        if (msg.type === "audio_chunk") {
          const chunk = Buffer.from(msg.data, "base64");
          room.audioBuffer = Buffer.concat([room.audioBuffer, chunk]);

          // Forward raw audio to agent if escalated
          if (room.escalated && room.agent && room.agent.readyState === 1) {
            room.agent.send(JSON.stringify({ type: "citizen_audio", data: msg.data }));
          }

          const now = Date.now();
          // HARD GATE: Stop AI processing if already at max attempts or escalation pending
          if (!room.pendingEscalation && !room.escalated &&
              now - room.lastProcessTime > 4000 && room.audioBuffer.length > 0) {
            room.lastProcessTime = now;
            this._processAudio(callId, "citizen");
          }
        } else if (msg.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
        }
      } catch (e) {
        console.error(`[RTCBridge] MSG_ERROR: ${e.message}`);
      }
    });

    ws.on("close", () => {
      console.log(`[RTCBridge] CITIZEN_DISCONNECTED: ${callId}`);
      const r = this.rooms.get(callId);
      if (r) r.citizen = null;
    });
  }

  registerAgent(callId, ws) {
    if (!this.rooms.has(callId)) {
      this.rooms.set(callId, {
        citizen: null, agent: null, escalated: false, pendingEscalation: false,
        audioBuffer: Buffer.alloc(0), agentAudioBuffer: Buffer.alloc(0),
        lastProcessTime: Date.now(), lastAgentProcessTime: Date.now(),
        aiAttempts: 0, hasValidInfo: false,
      });
    }
    const room = this.rooms.get(callId);
    room.agent = ws;

    console.log(`[RTCBridge] AGENT_CONNECTED: ${callId}`);

    ws.on("message", async (rawMsg) => {
      try {
        const msg = JSON.parse(rawMsg.toString());
        if (msg.type === "agent_audio_chunk" && room.escalated) {
          this._sendToCitizen(callId, { type: "agent_audio", data: msg.data });

          const chunk = Buffer.from(msg.data, "base64");
          room.agentAudioBuffer = Buffer.concat([room.agentAudioBuffer, chunk]);

          const now = Date.now();
          if (now - room.lastAgentProcessTime > 4000 && room.agentAudioBuffer.length > 0) {
            room.lastAgentProcessTime = now;
            this._processAudio(callId, "agent");
          }
        } else if (msg.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
        }
      } catch (e) {}
    });

    ws.on("close", () => {
      console.log(`[RTCBridge] AGENT_DISCONNECTED: ${callId}`);
      const r = this.rooms.get(callId);
      if (r) r.agent = null;
    });
  }

  async _processAudio(callId, speakerType = "citizen") {
    const room = this.rooms.get(callId);
    if (!room) return;

    const bufferField = speakerType === "citizen" ? "audioBuffer" : "agentAudioBuffer";
    if (room[bufferField].length === 0) return;

    const currentBuffer = room[bufferField];
    room[bufferField] = Buffer.alloc(0);

    const result = await AIBridgeService.processAudioChunk(callId, currentBuffer);
    if (!result || !result.transcript) return;

    const { transcript, emotion, urgency, category, respond_text } = result;

    // ── ATTEMPT LOGIC (citizen turns only, pre-escalation) ─────────────────
    if (speakerType === "citizen" && !room.escalated) {
      // Check if we now have valid information (transcript is meaningful)
      const hasLocation = transcript && transcript.length > 15;
      const hasCategory = category && category !== "Other";

      if (hasLocation && hasCategory) {
        room.hasValidInfo = true;
      }

      // Increment attempt counter each time citizen sends audio 
      room.aiAttempts += 1;
      console.log(`[RTCBridge] AI_ATTEMPT: ${callId} attempt=${room.aiAttempts} hasInfo=${room.hasValidInfo}`);

      // Notify frontend of current attempt
      this._sendToCitizen(callId, {
        type: "attempt_update",
        attemptNumber: room.aiAttempts,
        total: 2,
        hasValidInfo: room.hasValidInfo,
      });

      // After 2 attempts: if no valid info gathered → auto-escalate (only once)
      if (room.aiAttempts >= 2 && !room.hasValidInfo && !room.pendingEscalation) {
        console.log(`[RTCBridge] AUTO_ESCALATE_NO_INFO: ${callId}`);
        
        // Lock: prevent any further AI attempts
        room.pendingEscalation = true;

        // Speak the forwarding message BEFORE escalating
        this._sendToCitizen(callId, {
          type: "ai_speech",
          text: ATTEMPT_MESSAGES.forwarding,
        });

        // Brief delay so citizen hears the message, then escalate
        setTimeout(() => this.escalate(callId, "no_valid_info_after_2_attempts"), 3000);
        return;
      }

      // Also stop processing if already locked
      if (room.pendingEscalation) return;

      // Otherwise send attempt-specific AI response
      if (room.aiAttempts === 1 && respond_text) {
        // Wrap with "Attempt 1:" prefix for clarity
        this._sendToCitizen(callId, {
          type: "ai_speech",
          text: `Attempt 1: ${respond_text}`,
        });
      } else if (room.aiAttempts === 2 && !room.hasValidInfo) {
        // Second attempt - more urgent question
        this._sendToCitizen(callId, {
          type: "ai_speech",
          text: ATTEMPT_MESSAGES[2],
        });
      } else if (room.hasValidInfo && respond_text) {
        // We have info, proceed normally
        this._sendToCitizen(callId, {
          type: "ai_speech",
          text: respond_text,
        });
      }
    }

    // ── DB PERSISTENCE ──────────────────────────────────────────────────────
    try {
      const call = await prisma.call.findUnique({ where: { callId } });
      if (call) {
        const existing = Array.isArray(call.transcript) ? call.transcript : [];
        await prisma.call.update({
          where: { callId },
          data: {
            transcript: [...existing, {
              id: Date.now().toString(),
              speaker: speakerType,
              text: transcript,
              timestamp: new Date().toISOString(),
            }],
            ...(speakerType === "citizen" ? {
              emotion: emotion || call.emotion,
              urgency: urgency?.toUpperCase() || call.urgency,
              category: category || call.category,
            } : {}),
          },
        });
      }
    } catch (e) {}

    // ── AGENT DASHBOARD PUSH ─────────────────────────────────────────────────
    if (room.agent && room.agent.readyState === 1) {
      room.agent.send(JSON.stringify({
        type: "transcript_update",
        data: {
          id: Date.now().toString(), speaker: speakerType,
          text: transcript, timestamp: new Date().toISOString()
        }
      }));
      if (speakerType === "citizen") {
        room.agent.send(JSON.stringify({ type: "emotion_update", data: { emotion } }));
        room.agent.send(JSON.stringify({ type: "confidence_update", data: { confidence: 0.9, reason: `Urgency: ${urgency}` } }));
      }
    }
  }

  async escalate(callId, reason = "manual") {
    const room = this.rooms.get(callId);
    if (!room || room.escalated) return;

    room.escalated = true;
    console.log(`[RTCBridge] ESCALATED: ${callId} reason=${reason}`);

    try {
      await prisma.call.update({ where: { callId }, data: { status: "escalated" } });
    } catch (e) {}

    // Emit escalation event so dashboard knows
    this.emit("call_escalated", { callId, reason });

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

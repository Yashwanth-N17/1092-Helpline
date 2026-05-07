const AIBridgeService = require("./aiBridgeService");
const { PrismaClient } = require("@prisma/client");
const EventEmitter = require("events");
const prisma = new PrismaClient();

class RTCBridgeService extends EventEmitter {
  constructor() {
    super();
    // callId -> { citizen: ws, agent: ws | null, escalated: bool, audioBuffer: Buffer, agentAudioBuffer: Buffer, lastProcessTime: number, lastAgentProcessTime: number }
    this.rooms = new Map();
  }

  /**
   * Register a citizen WebSocket connection for a call
   */
  async registerCitizen(callId, ws) {
    console.log(`[RTCBridge] REGISTER_CITIZEN: ${callId}`);
    
    if (!this.rooms.has(callId)) {
      this.rooms.set(callId, { 
        citizen: null, 
        agent: null, 
        escalated: false, 
        audioBuffer: Buffer.alloc(0),
        agentAudioBuffer: Buffer.alloc(0),
        lastProcessTime: Date.now(),
        lastAgentProcessTime: Date.now()
      });
    }
    const room = this.rooms.get(callId);
    room.citizen = ws;

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
        console.log(`[RTCBridge] DB_CREATED: ${callId}`);
        this.emit("new_call", { callId });

        // Send initial greeting to the citizen
        setTimeout(() => {
          if (!room.escalated) {
            this._sendToCitizen(callId, {
              type: "ai_speech",
              text: "Namaskara! This is the 1092 Helpline. What is your emergency? (ನೀವು ಕನ್ನಡದಲ್ಲೂ ಮಾತನಾಡಬಹುದು)"
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
          
          if (room.escalated && room.agent && room.agent.readyState === 1) {
             room.agent.send(JSON.stringify({ type: "citizen_audio", data: msg.data }));
          }

          const now = Date.now();
          if (now - room.lastProcessTime > 4000 && room.audioBuffer.length > 0) {
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
        agentAudioBuffer: Buffer.alloc(0),
        lastProcessTime: Date.now(),
        lastAgentProcessTime: Date.now()
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
          
          // Buffer agent voice for transcription to show in dashboard
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

  /**
   * Process audio for transcription (supports both citizen and agent)
   */
  async _processAudio(callId, speakerType = "citizen") {
    const room = this.rooms.get(callId);
    if (!room) return;

    const bufferField = speakerType === "citizen" ? "audioBuffer" : "agentAudioBuffer";
    if (room[bufferField].length === 0) return;

    const currentBuffer = room[bufferField];
    room[bufferField] = Buffer.alloc(0);

    const result = await AIBridgeService.processAudioChunk(callId, currentBuffer);
    if (!result || !result.transcript) return;

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
              speaker: speakerType,
              text: transcript,
              timestamp: new Date().toISOString(),
            }],
            // Only update insights if it's the citizen speaking
            ...(speakerType === "citizen" ? {
               emotion: emotion || call.emotion,
               urgency: urgency?.toUpperCase() || call.urgency,
               category: category || call.category,
            } : {})
          },
        });
      }
    } catch (e) {}

    // Notify agent dashboard
    if (room.agent && room.agent.readyState === 1) {
      room.agent.send(JSON.stringify({ 
        type: "transcript_update", 
        data: {
          id: Date.now().toString(), 
          speaker: speakerType, 
          text: transcript,
          timestamp: new Date().toISOString()
        }
      }));
      
      if (speakerType === "citizen") {
        room.agent.send(JSON.stringify({ type: "emotion_update", data: { emotion } }));
        room.agent.send(JSON.stringify({ type: "confidence_update", data: { confidence: 0.9, reason: `Urgency: ${urgency}` } }));
      }
    }

    // AI only speaks back to citizen if it's NOT escalated and responding to the citizen
    if (!room.escalated && speakerType === "citizen") {
      if (respond_text) {
        this._sendToCitizen(callId, { type: "ai_speech", text: respond_text });
      }
      if (tts_audio) {
        this._sendToCitizen(callId, { type: "ai_audio", data: tts_audio });
      }
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
      type: "ai_speech",
      text: "I am connecting you to a live responder. Please stay on the line.",
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

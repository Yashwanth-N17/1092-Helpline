const { WebSocketServer } = require("ws");
const AIBridgeService = require("./aiBridgeService");

class SocketService {
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.clients = new Map();
    this.init();
  }

  init() {
    this.wss.on("connection", (ws, req) => {
      const url = req.url || "";
      
      // Handle Twilio Media Stream
      if (url.includes("/media-stream")) {
        const TwilioService = require("./twilioService");
        TwilioService.processMediaStream(ws, this);
        return;
      }

      const callIdMatch = url.match(/\/calls\/([\w-]+)/);
      const callId = callIdMatch ? callIdMatch[1] : "unknown";

      if (callId !== "unknown") {
        this.clients.set(callId, ws);
      }

      console.log(`Client connected: ${callId}`);

      ws.on("message", async (message) => {
        try {
          const payload = JSON.parse(message.toString());
          
          if (payload.type === "audio_stream") {
            // Forward to AI Service
          } else if (payload.type === "ping") {
            ws.send(JSON.stringify({ type: "pong" }));
          }
        } catch (e) {
          // ignore
        }
      });

      ws.on("close", () => {
        this.clients.delete(callId);
        console.log(`Client disconnected: ${callId}`);
      });
    });
  }

  broadcastToCall(callId, type, data) {
    const ws = this.clients.get(callId);
    if (ws && ws.readyState === 1) { // 1 = OPEN
      ws.send(JSON.stringify({ type, data }));
    }
  }

  broadcastAll(type, data) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type, data }));
      }
    });
  }
}

module.exports = SocketService;

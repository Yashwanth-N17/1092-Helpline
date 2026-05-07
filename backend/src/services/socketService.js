const { WebSocketServer } = require("ws");
const rtcBridge = require("./rtcBridgeService");

class SocketService {
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.clients = new Map(); // agentCallId -> ws
    this.init();

    // Listen for events from RTCBridge (avoids circular dependency)
    rtcBridge.on("new_call", (data) => {
      this.broadcastAll("new_call", data);
    });
  }

  init() {
    this.wss.on("connection", (ws, req) => {
      const url = req.url || "";

      // --- Citizen WebRTC SOS ---
      // URL: /citizen/{callId}
      const citizenMatch = url.match(/\/citizen\/([\w-]+)/);
      if (citizenMatch) {
        const callId = citizenMatch[1];
        rtcBridge.registerCitizen(callId, ws);
        return;
      }

      // --- Agent Dashboard WebSocket ---
      // URL: /agent/{callId}  (agent monitoring a specific call)
      const agentMatch = url.match(/\/agent\/([\w-]+)/);
      if (agentMatch) {
        const callId = agentMatch[1];
        rtcBridge.registerAgent(callId, ws);
        this.clients.set(callId, ws);
        return;
      }

      // --- Generic dashboard connection for broadcasts ---
      // URL: /dashboard
      if (url.includes("/dashboard")) {
        this.clients.set("dashboard_" + Date.now(), ws);
        ws.on("message", (msg) => {
          try {
            const payload = JSON.parse(msg.toString());
            if (payload.type === "ping") ws.send(JSON.stringify({ type: "pong" }));
          } catch {}
        });
        ws.on("close", () => {
          for (const [k, v] of this.clients.entries()) {
            if (v === ws) { this.clients.delete(k); break; }
          }
        });
        return;
      }

      // --- Legacy /calls/{callId} agent connection ---
      const callIdMatch = url.match(/\/calls\/([\w-]+)/);
      if (callIdMatch) {
        const callId = callIdMatch[1];
        this.clients.set(callId, ws);
        rtcBridge.registerAgent(callId, ws);
        ws.on("close", () => this.clients.delete(callId));
      }
    });
  }

  broadcastToCall(callId, type, data) {
    const ws = this.clients.get(callId);
    if (ws && ws.readyState === 1) {
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

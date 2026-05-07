import { WS_URL } from "@/utils/constants";
import toast from "react-hot-toast";

type EventCallback = (data: any) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Set<EventCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnect = 5;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private url = "";

  // Helper to check connection status from the UI
  get connected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  connect(path: string): void {
    // Ensure we don't have multiple connections
    if (this.ws) this.disconnect();
    
    this.url = `${WS_URL}${path}`;
    this.reconnectAttempts = 0;
    this.createConnection();
  }

  // CRITICAL: Added send method so ActiveCall.tsx can stream audio
  send(type: string, data: any): void {
    if (this.connected) {
      this.ws?.send(JSON.stringify({ type, data }));
    }
  }

  private createConnection(): void {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        console.log("🟢 WebSocket Connected");
      };

      this.ws.onmessage = (event) => {
        try {
          const { type, data } = JSON.parse(event.data);
          const callbacks = this.subscribers.get(type);
          if (callbacks) {
            callbacks.forEach((cb) => cb(data));
          }
        } catch {
          // ignore parse errors
        }
      };

      this.ws.onclose = () => {
        this.stopHeartbeat();
        if (this.reconnectAttempts < this.maxReconnect) {
          this.reconnectAttempts++;
          setTimeout(() => this.createConnection(), 2000 * this.reconnectAttempts);
          toast("Reconnecting to server...", { icon: "🔄" });
        }
      };

      this.ws.onerror = (error) => {
        console.error("🔴 WebSocket Error:", error);
      };
    } catch (error) {
      console.error("🔴 Connection Failed:", error);
    }
  }

  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event)!.add(callback);
    return () => {
      this.subscribers.get(event)?.delete(callback);
    };
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.onclose = null; // Prevent reconnection logic on manual disconnect
      this.ws.close();
    }
    this.ws = null;
    // We don't clear subscribers here so they persist across re-connects 
    // unless you explicitly want to wipe them.
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.connected) {
        this.send("ping", { timestamp: new Date().toISOString() });
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

export const wsManager = new WebSocketManager();
export default WebSocketManager;
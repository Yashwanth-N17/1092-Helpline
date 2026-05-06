import { WS_URL } from "@/utils/constants";
import toast from "react-hot-toast";

type EventCallback = (data: unknown) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Set<EventCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnect = 5;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private url = "";

  connect(path: string): void {
    this.url = `${WS_URL}${path}`;
    this.reconnectAttempts = 0;
    this.createConnection();
  }

  private createConnection(): void {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.startHeartbeat();
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

      this.ws.onerror = () => {
        // ws will fire onclose after onerror
      };
    } catch {
      // connection failed
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
    this.ws?.close();
    this.ws = null;
    this.subscribers.clear();
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
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

type EventCallback = (data: unknown) => void;

class WebSocketManager {
  private subscribers: Map<string, Set<EventCallback>> = new Map();

  connect(path: string): void {
    console.log(`[Mock WS] Connecting to ${path}...`);
    // Simulate connection open
    setTimeout(() => {
      console.log(`[Mock WS] Connected to ${path}`);
    }, 1000);
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

  // Helper to simulate incoming events from the mock "server"
  simulateEvent(type: string, data: unknown): void {
    const callbacks = this.subscribers.get(type);
    if (callbacks) {
      callbacks.forEach((cb) => cb(data));
    }
  }

  disconnect(): void {
    console.log("[Mock WS] Disconnected");
    this.subscribers.clear();
  }
}

export const wsManager = new WebSocketManager();
export default WebSocketManager;


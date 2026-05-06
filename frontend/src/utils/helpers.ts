import { TOKEN_KEY, AGENT_KEY } from "./constants";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(AGENT_KEY);
}

export function getAgent(): { agentId: string; agentName: string; role: string } | null {
  const raw = localStorage.getItem(AGENT_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setAgent(agent: { agentId: string; agentName: string; role: string }): void {
  localStorage.setItem(AGENT_KEY, JSON.stringify(agent));
}

export function confidenceColor(score: number): string {
  if (score >= 75) return "hsl(122, 46%, 33%)";
  if (score >= 40) return "hsl(45, 93%, 47%)";
  return "hsl(0, 72%, 47%)";
}

export function confidenceColorClass(score: number): string {
  if (score >= 75) return "bg-success";
  if (score >= 40) return "bg-warning";
  return "bg-destructive";
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

import { create } from "zustand";

interface AgentState {
  agentId: string;
  agentName: string;
  role: string;
  isAuthenticated: boolean;
  shiftStatus: "online" | "offline" | "break";
  setAgent: (agent: { agentId: string; agentName: string; role: string }) => void;
  setAuthenticated: (v: boolean) => void;
  setShiftStatus: (s: "online" | "offline" | "break") => void;
  logout: () => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  agentId: "",
  agentName: "",
  role: "",
  isAuthenticated: false,
  shiftStatus: "online",
  setAgent: (agent) => set({ ...agent, isAuthenticated: true }),
  setAuthenticated: (v) => set({ isAuthenticated: v }),
  setShiftStatus: (s) => set({ shiftStatus: s }),
  logout: () =>
    set({ agentId: "", agentName: "", role: "", isAuthenticated: false }),
}));

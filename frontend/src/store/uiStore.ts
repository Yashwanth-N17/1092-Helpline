import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  isOnline: boolean;
  showEscalationOverlay: boolean;
  toggleSidebar: () => void;
  setOnline: (v: boolean) => void;
  setEscalationOverlay: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  isOnline: true,
  showEscalationOverlay: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setOnline: (v) => set({ isOnline: v }),
  setEscalationOverlay: (v) => set({ showEscalationOverlay: v }),
}));

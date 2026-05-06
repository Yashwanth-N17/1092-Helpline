import { create } from "zustand";
import type { EmotionType, UrgencyType, LanguageType, CallStatusType } from "@/utils/constants";

export interface TranscriptLine {
  id: string;
  speaker: "citizen" | "ai" | "agent";
  text: string;
  timestamp: string;
}

export interface VerificationAttempt {
  attempt: number;
  sentence: string;
  result: "confirmed" | "incorrect" | "partial" | null;
}

export interface CallData {
  callId: string;
  startTime: string;
  duration: number;
  language: LanguageType;
  dialect?: string;
  emotion: EmotionType;
  urgency: UrgencyType;
  confidence: number;
  confidenceReason: string;
  intent: string;
  location: string;
  issue: string;
  status: CallStatusType;
  handledBy: string;
  transcript: TranscriptLine[];
  verifications: VerificationAttempt[];
  suggestedActions: string[];
  emotionHistory: { emotion: EmotionType; timestamp: string }[];
}

interface CallStore {
  activeCalls: CallData[];
  recentCalls: CallData[];
  currentCall: CallData | null;
  setActiveCalls: (calls: CallData[]) => void;
  setRecentCalls: (calls: CallData[]) => void;
  setCurrentCall: (call: CallData | null) => void;
  addActiveCall: (call: CallData) => void;
  removeActiveCall: (callId: string) => void;
  updateActiveCall: (callId: string, update: Partial<CallData>) => void;
  appendTranscript: (line: TranscriptLine) => void;
  updateCurrentCallField: (update: Partial<CallData>) => void;
}

export const useCallStore = create<CallStore>((set) => ({
  activeCalls: [],
  recentCalls: [],
  currentCall: null,
  setActiveCalls: (calls) => set({ activeCalls: calls }),
  setRecentCalls: (calls) => set({ recentCalls: calls }),
  setCurrentCall: (call) => set({ currentCall: call }),
  addActiveCall: (call) =>
    set((s) => ({ activeCalls: [call, ...s.activeCalls] })),
  removeActiveCall: (callId) =>
    set((s) => ({ activeCalls: s.activeCalls.filter((c) => c.callId !== callId) })),
  updateActiveCall: (callId, update) =>
    set((s) => ({
      activeCalls: s.activeCalls.map((c) =>
        c.callId === callId ? { ...c, ...update } : c
      ),
    })),
  appendTranscript: (line) =>
    set((s) => ({
      currentCall: s.currentCall
        ? { ...s.currentCall, transcript: [...s.currentCall.transcript, line] }
        : null,
    })),
  updateCurrentCallField: (update) =>
    set((s) => ({
      currentCall: s.currentCall ? { ...s.currentCall, ...update } : null,
    })),
}));

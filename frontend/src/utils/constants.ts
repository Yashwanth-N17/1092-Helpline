export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
export const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000";
export const APP_NAME = import.meta.env.VITE_APP_NAME || "1092 AI Helpline";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0";

export const EMOTIONS = {
  PANIC: { label: "Panic", color: "hsl(0, 72%, 47%)", bg: "bg-destructive", pulse: true },
  FEAR: { label: "Fear", color: "hsl(27, 100%, 48%)", bg: "bg-warning", pulse: true },
  ANGER: { label: "Anger", color: "hsl(0, 72%, 47%)", bg: "bg-destructive", pulse: false },
  CONFUSED: { label: "Confused", color: "hsl(45, 93%, 47%)", bg: "bg-warning", pulse: false },
  NEUTRAL: { label: "Neutral", color: "hsl(122, 46%, 33%)", bg: "bg-success", pulse: false },
  SAD: { label: "Sad", color: "hsl(220, 60%, 50%)", bg: "bg-primary", pulse: false },
} as const;

export const LANGUAGES = ["Kannada", "Hindi", "English", "Mixed"] as const;

export const CALL_STATUSES = {
  ACTIVE: "active",
  RESOLVED: "resolved",
  ESCALATED: "escalated",
  MISSED: "missed",
} as const;

export const URGENCY_LEVELS = {
  HIGH: { label: "HIGH", color: "bg-destructive text-destructive-foreground" },
  MEDIUM: { label: "MEDIUM", color: "bg-warning text-warning-foreground" },
  LOW: { label: "LOW", color: "bg-success text-success-foreground" },
} as const;

export const TOKEN_KEY = "helpline_auth_token";
export const AGENT_KEY = "helpline_agent";

export type EmotionType = keyof typeof EMOTIONS;
export type UrgencyType = keyof typeof URGENCY_LEVELS;
export type LanguageType = (typeof LANGUAGES)[number];
export type CallStatusType = (typeof CALL_STATUSES)[keyof typeof CALL_STATUSES];

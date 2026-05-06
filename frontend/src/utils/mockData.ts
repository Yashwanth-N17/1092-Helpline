import { EmotionType, UrgencyType, LanguageType, CallStatusType } from "@/utils/constants";
import type { CallData, TranscriptLine } from "@/store/callStore";

const emotions: EmotionType[] = ["PANIC", "FEAR", "ANGER", "CONFUSED", "NEUTRAL", "SAD"];
const urgencies: UrgencyType[] = ["HIGH", "MEDIUM", "LOW"];
const languages: LanguageType[] = ["Kannada", "Hindi", "English"];
const statuses: CallStatusType[] = ["resolved", "escalated", "missed"];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMockCall(overrides?: Partial<CallData>): CallData {
  const callId = `CALL-${randInt(1000, 9999)}`;
  const emotion = rand(emotions);
  return {
    callId,
    startTime: new Date(Date.now() - randInt(60, 3600) * 1000).toISOString(),
    duration: randInt(30, 600),
    language: rand(languages),
    dialect: "Standard",
    emotion,
    urgency: rand(urgencies),
    confidence: randInt(20, 98),
    confidenceReason: "Based on keyword matching and dialect analysis",
    intent: rand(["Road complaint", "Water supply issue", "Power outage", "Pension inquiry", "Certificate request"]),
    location: rand(["Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belagavi"]),
    issue: rand(["Pothole on main road", "No water supply for 3 days", "Electricity cut since morning", "Pension not received", "Birth certificate delay"]),
    status: "active",
    handledBy: "AI",
    transcript: generateMockTranscript(),
    verifications: [
      { attempt: 1, sentence: "You are reporting a road issue near your area?", result: "partial" },
    ],
    suggestedActions: [
      "Transfer to PWD department",
      "Log complaint in PGRS",
      "Send SMS confirmation to citizen",
    ],
    emotionHistory: Array.from({ length: 5 }, (_, i) => ({
      emotion: rand(emotions),
      timestamp: new Date(Date.now() - (5 - i) * 30000).toISOString(),
    })),
    ...overrides,
  };
}

function generateMockTranscript(): TranscriptLine[] {
  const lines: TranscriptLine[] = [
    { id: "1", speaker: "ai", text: "Namaskara! 1092 helpline ge swagata. Naan AI sahayaka. Nimma samasye enu?", timestamp: new Date(Date.now() - 300000).toISOString() },
    { id: "2", speaker: "citizen", text: "Naavu 3 dina inda neeru baruthilla. Tumba kashta aagide.", timestamp: new Date(Date.now() - 270000).toISOString() },
    { id: "3", speaker: "ai", text: "Naan arthamadikondiddeene. Nimma pradesha yavudu?", timestamp: new Date(Date.now() - 240000).toISOString() },
    { id: "4", speaker: "citizen", text: "Rajajinagar, Bengaluru.", timestamp: new Date(Date.now() - 210000).toISOString() },
    { id: "5", speaker: "ai", text: "Dhanyavadagalu. Nimma complaint BWSSB ge forward maaduthiddeeve.", timestamp: new Date(Date.now() - 180000).toISOString() },
  ];
  return lines;
}

export function generateMockActiveCalls(count = 4): CallData[] {
  return Array.from({ length: count }, () => generateMockCall({ status: "active" }));
}

export function generateMockRecentCalls(count = 10): CallData[] {
  return Array.from({ length: count }, () =>
    generateMockCall({ status: rand(statuses) })
  );
}

export function generateMockHistoryCalls(count = 50): CallData[] {
  return Array.from({ length: count }, (_, i) =>
    generateMockCall({
      status: rand(statuses),
      startTime: new Date(Date.now() - i * 3600000 - randInt(0, 3600000)).toISOString(),
      handledBy: rand(["AI", "Agent Priya", "Agent Ravi", "Agent Meera"]),
    })
  );
}

export const mockDashboardStats = {
  totalCallsToday: 247,
  aiHandledPercent: 72,
  escalatedToHuman: 69,
  avgConfidenceScore: 78,
};

export const mockAnalyticsData = {
  callsOverTime: Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, "0")}:00`,
    aiHandled: randInt(5, 30),
    escalated: randInt(1, 10),
  })),
  emotionDistribution: [
    { name: "Neutral", value: 45, fill: "hsl(122, 46%, 33%)" },
    { name: "Confused", value: 20, fill: "hsl(45, 93%, 47%)" },
    { name: "Anger", value: 15, fill: "hsl(0, 72%, 47%)" },
    { name: "Fear", value: 10, fill: "hsl(27, 100%, 48%)" },
    { name: "Panic", value: 5, fill: "hsl(0, 72%, 40%)" },
    { name: "Sad", value: 5, fill: "hsl(220, 60%, 50%)" },
  ],
  languageDistribution: [
    { language: "Kannada", count: 156 },
    { language: "Hindi", count: 52 },
    { language: "English", count: 31 },
    { language: "Mixed", count: 8 },
  ],
  confidenceDistribution: [
    { range: "0-20", count: 8 },
    { range: "20-40", count: 15 },
    { range: "40-60", count: 35 },
    { range: "60-80", count: 72 },
    { range: "80-100", count: 117 },
  ],
  escalationReasons: [
    { reason: "Low confidence score", count: 28 },
    { reason: "High emotional distress", count: 19 },
    { reason: "Whisper word detected", count: 12 },
    { reason: "Failed verification (3x)", count: 10 },
  ],
};

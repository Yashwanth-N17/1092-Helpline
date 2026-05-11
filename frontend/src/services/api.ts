import { 
  mockDashboardStats, 
  mockAnalyticsData, 
  generateMockActiveCalls, 
  generateMockRecentCalls, 
  generateMockCall,
  generateMockHistoryCalls
} from "@/utils/mockData";
import { TOKEN_KEY, AGENT_KEY } from "@/utils/constants";

/** 
 * Mock API service to remove backend dependency.
 * All calls return Promise.resolve with mock data.
 */

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

/** Auth API */
export const authAPI = {
  login: async (agentId: string, _password: string) => {
    await delay();
    const token = "mock-jwt-token";
    const agent = { id: agentId, name: agentId === "admin" ? "Super Admin" : "Agent " + agentId, role: "agent" };
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(AGENT_KEY, JSON.stringify(agent));
    return { data: { token, agent } };
  },
  logout: async () => {
    await delay();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AGENT_KEY);
    return { data: { success: true } };
  },
};

/** Dashboard API */
export const dashboardAPI = {
  getStats: async () => {
    await delay();
    return { data: mockDashboardStats };
  },
  getActiveCalls: async () => {
    await delay();
    return { data: generateMockActiveCalls() };
  },
  getRecentCalls: async (limit = 10) => {
    await delay();
    return { data: generateMockRecentCalls(limit) };
  },
  endCall: async (callId: string) => {
    await delay();
    return { data: { success: true, callId } };
  },
};

/** Call API */
export const callAPI = {
  getCall: async (callId: string) => {
    await delay();
    return { data: generateMockCall({ callId }) };
  },
  updateInterpretation: async (callId: string, data: Record<string, string>) => {
    await delay();
    return { data: { success: true, callId, updated: data } };
  },
  submitVerification: async (callId: string, result: string) => {
    await delay();
    return { data: { success: true, callId, result } };
  },
  escalateCall: async (callId: string) => {
    await delay();
    return { data: { success: true, callId, status: "escalated" } };
  },
  endCall: async (callId: string) => {
    await delay();
    return { data: { success: true, callId, status: "resolved" } };
  },
  getCallHistory: async (_filters: Record<string, unknown>) => {
    await delay();
    return { data: generateMockHistoryCalls(20) };
  },
  getCallDetail: async (callId: string) => {
    await delay();
    return { data: generateMockCall({ callId }) };
  },
};

/** Analytics API */
export const analyticsAPI = {
  getOverview: async (_from: string, _to: string) => {
    await delay();
    return { data: mockAnalyticsData };
  },
  getEmotions: async (_from: string, _to: string) => {
    await delay();
    return { data: mockAnalyticsData.emotionDistribution };
  },
  getLanguages: async (_from: string, _to: string) => {
    await delay();
    return { data: mockAnalyticsData.languageDistribution };
  },
  getConfidence: async (_from: string, _to: string) => {
    await delay();
    return { data: mockAnalyticsData.confidenceDistribution };
  },
  getEscalations: async (_from: string, _to: string) => {
    await delay();
    return { data: mockAnalyticsData.escalationReasons };
  },
};

/** Agent API */
export const agentAPI = {
  getSettings: async () => {
    await delay();
    return { data: { theme: "dark", language: "English", notifications: true } };
  },
  updateSettings: async (data: Record<string, unknown>) => {
    await delay();
    return { data: { success: true, updated: data } };
  },
};

export default { authAPI, dashboardAPI, callAPI, analyticsAPI, agentAPI };


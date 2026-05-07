import axios from "axios";
import { API_URL, TOKEN_KEY } from "@/utils/constants";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/login";
    } else if (error.response?.status >= 500) {
      toast.error("Server error. Please try again.");
    } else if (!error.response) {
      toast.error("Server unreachable. Check your connection.");
    }
    return Promise.reject(error);
  }
);

/** Auth API */
export const authAPI = {
  login: (agentId: string, password: string) =>
    api.post("/auth/login", { agentId, password }),
  logout: () => api.post("/auth/logout"),
};

/** Dashboard API */
export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
  getActiveCalls: () => api.get("/calls/active"),
  getRecentCalls: (limit = 10) => api.get(`/calls/recent?limit=${limit}`),
  endCall: (callId: string) => api.post(`/calls/${callId}/end`),
};

/** Call API */
export const callAPI = {
  getCall: (callId: string) => api.get(`/calls/${callId}`),
  updateInterpretation: (callId: string, data: Record<string, string>) =>
    api.patch(`/calls/${callId}/interpret`, data),
  submitVerification: (callId: string, result: string) =>
    api.post(`/calls/${callId}/verify`, { result }),
  escalateCall: (callId: string) => api.post(`/calls/${callId}/escalate`),
  endCall: (callId: string) => api.post(`/calls/${callId}/end`),
  getCallHistory: (filters: Record<string, unknown>) =>
    api.get("/calls/history", { params: filters }),
  getCallDetail: (callId: string) => api.get(`/calls/${callId}/detail`),
};

/** Analytics API */
export const analyticsAPI = {
  getOverview: (from: string, to: string) =>
    api.get("/analytics/overview", { params: { from, to } }),
  getEmotions: (from: string, to: string) =>
    api.get("/analytics/emotions", { params: { from, to } }),
  getLanguages: (from: string, to: string) =>
    api.get("/analytics/languages", { params: { from, to } }),
  getConfidence: (from: string, to: string) =>
    api.get("/analytics/confidence", { params: { from, to } }),
  getEscalations: (from: string, to: string) =>
    api.get("/analytics/escalations", { params: { from, to } }),
};

/** Agent API */
export const agentAPI = {
  getSettings: () => api.get("/agent/settings"),
  updateSettings: (data: Record<string, unknown>) =>
    api.patch("/agent/settings", data),
};

export default api;

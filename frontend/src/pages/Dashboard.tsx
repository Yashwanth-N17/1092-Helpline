import { useEffect, useState, useCallback } from "react";
import { API_BASE_URL } from "../apiConfig";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Phone, 
  TrendingUp, 
  Users, 
  Activity, 
  ArrowUpRight, 
  CheckCircle, 
  AlertTriangle, 
  Clock 
} from "lucide-react";

import StatusBadge from "@/components/common/StatusBadge";
import ConfidenceBar from "@/components/common/ConfidenceBar";
import EmotionIndicator from "@/components/common/EmotionIndicator";
import { PremiumButton } from "@/components/common/PremiumButton";
import { formatDuration, formatTime } from "@/utils/formatters";

/**
 * AnimatedCounter: Smoothly animates numbers from 0 to target value
 */
function AnimatedCounter({ value, suffix = "" }: { value: number | string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const numericValue = typeof value === 'string' ? parseInt(value) || 0 : value;

  useEffect(() => {
    let start = 0;
    const end = numericValue;
    if (end === 0) {
      setDisplay(0);
      return;
    }
    const step = Math.ceil(end / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [numericValue]);

  return <span>{display}{suffix}</span>;
}

/**
 * Configuration for Dashboard Metric Cards
 */
const statCards = [
  { label: "Active Emergency", key: "activeCalls", icon: Phone, gradient: "from-blue-500/10 to-cyan-500/10", iconColor: "text-blue-500", iconBg: "bg-blue-500/10" },
  { label: "Cases Resolved Today", key: "resolvedToday", icon: CheckCircle, gradient: "from-green-500/10 to-emerald-500/10", iconColor: "text-green-500", iconBg: "bg-green-500/10" },
  { label: "High Priority", key: "highPriority", icon: AlertTriangle, gradient: "from-red-500/10 to-orange-500/10", iconColor: "text-red-500", iconBg: "bg-red-500/10" },
  { label: "Avg. Response Time", key: "avgResponse", icon: Clock, gradient: "from-purple-500/10 to-pink-500/10", iconColor: "text-purple-500", iconBg: "bg-purple-500/10" },
];

export default function Dashboard() {
  const [activeCalls, setActiveCalls] = useState<any[]>([]);
  const [recentCalls, setRecentCalls] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    activeCalls: 0,
    resolvedToday: 0,
    highPriority: 0,
    avgResponse: "0",
  });
  const navigate = useNavigate();

  /**
   * Data Synchronizer: Fetches live data from the FastAPI endpoints
   */
  const fetchDashboardData = useCallback(async () => {
    try {
      // 1. Fetch Aggregate Analytics
      const statsRes = await fetch(`${API_BASE_URL}/api/dashboard`);
      const statsData = await statsRes.json();
      setStats(statsData.stats);

      // 2. Fetch Live Calls (currently in progress)
      const callsRes = await fetch(`${API_BASE_URL}/api/calls/active`);
      const callsData = await callsRes.json();
      setActiveCalls(callsData);

      // 3. Fetch Historical Data (resolved/past calls)
      const historyRes = await fetch(`${API_BASE_URL}/api/history`);
      const historyData = await historyRes.json();
      setRecentCalls(historyData);
    } catch (error) {
      console.error("Dashboard synchronization failed:", error);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // Poll the backend every 4 seconds for live updates
    const interval = setInterval(fetchDashboardData, 4000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const statusVariant = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case "resolved": return "success";
      case "escalated": return "warning";
      case "missed": return "danger";
      default: return "info";
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Real-time overview of the 1092 Helpline</p>
      </div>

      {/* --- Metric Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`p-5 rounded-2xl border border-border/50 bg-gradient-to-br ${card.gradient}`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{card.label}</span>
              <div className={`w-9 h-9 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-[18px] h-[18px] ${card.iconColor}`} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-foreground">
              <AnimatedCounter 
                value={stats[card.key]} 
                suffix={card.key === 'avgResponse' ? 's' : ''} 
              />
            </p>
          </motion.div>
        ))}
      </div>

      {/* --- Live Call Queue --- */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border/60 flex items-center justify-between bg-muted/20">
          <h3 className="font-bold text-foreground">Active Emergency Queue</h3>
          <StatusBadge label={`${activeCalls.length} Live`} variant="danger" pulse />
        </div>
        <div className="divide-y divide-border/50">
          {activeCalls.map((call, i) => (
            <div key={call.callId} className="p-4 px-5 flex items-center gap-4 hover:bg-accent/50 transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="font-mono text-sm font-semibold text-foreground">{call.callId}</span>
                  <StatusBadge label={call.language} variant="info" />
                </div>
                <p className="text-xs text-muted-foreground truncate">{call.issue}</p>
              </div>
              <EmotionIndicator emotion={call.emotion} size="sm" />
              <div className="w-32 hidden sm:block">
                <ConfidenceBar score={call.confidence} showLabel={false} />
              </div>
              <PremiumButton size="sm" onClick={() => navigate(`/call/${call.callId}`)}>
                Take Call
                <ArrowUpRight className="ml-1 w-3.5 h-3.5" />
              </PremiumButton>
            </div>
          ))}
          {activeCalls.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <Phone className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p>No active emergencies at this time.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- Historical Logs --- */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border/60 bg-muted/20">
          <h3 className="font-bold text-foreground">Recent Activity Logs</h3>
        </div>
        <div className="divide-y divide-border/50">
          {recentCalls.slice(0, 5).map((call) => (
            <div key={call.callId} className="p-3.5 px-5 flex items-center gap-4 text-sm hover:bg-accent/30 transition-colors">
              <span className="font-mono text-muted-foreground w-24 text-xs">{call.callId}</span>
              <span className="text-muted-foreground w-24 text-xs tabular-nums">{formatTime(call.startTime)}</span>
              <EmotionIndicator emotion={call.emotion} size="sm" />
              <div className="flex-1" />
              <StatusBadge label={call.status} variant={statusVariant(call.status) as any} />
              <button 
                onClick={() => navigate(`/call/${call.callId}`)}
                className="text-primary hover:underline text-xs font-medium ml-2"
              >
                Details
              </button>
            </div>
          ))}
          {recentCalls.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-xs italic">
              Historical logs will appear here once calls are processed.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
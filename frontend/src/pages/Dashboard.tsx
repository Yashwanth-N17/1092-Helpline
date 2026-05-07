import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCallStore } from "@/store/callStore";
import { Phone, TrendingUp, Users, Activity, ArrowUpRight } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import ConfidenceBar from "@/components/common/ConfidenceBar";
import EmotionIndicator from "@/components/common/EmotionIndicator";
import { PremiumButton } from "@/components/common/PremiumButton";
import { formatDuration, formatTime } from "@/utils/formatters";
import { dashboardAPI } from "@/services/api";
import { generateMockActiveCalls, generateMockRecentCalls, mockDashboardStats } from "@/utils/mockData";

import { wsManager } from "@/services/websocket";

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}{suffix}</span>;
}

const statCards = [
  { label: "Total Calls Today", key: "totalCallsToday" as const, icon: Phone, gradient: "from-primary/10 to-primary/5", iconBg: "bg-primary/10", iconColor: "text-primary" },
  { label: "AI Handled", key: "aiHandledPercent" as const, icon: TrendingUp, suffix: "%", gradient: "from-success/10 to-success/5", iconBg: "bg-success/10", iconColor: "text-success" },
  { label: "Escalated to Human", key: "escalatedToHuman" as const, icon: Users, gradient: "from-warning/10 to-warning/5", iconBg: "bg-warning/10", iconColor: "text-warning" },
  { label: "Avg Confidence", key: "avgConfidenceScore" as const, icon: Activity, suffix: "%", gradient: "from-secondary/10 to-secondary/5", iconBg: "bg-secondary/10", iconColor: "text-secondary" },
];

export default function Dashboard() {
  const { activeCalls, recentCalls, setActiveCalls, setRecentCalls } = useCallStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(mockDashboardStats);

  const fetchDashboardData = useCallback(() => {
    dashboardAPI.getStats().then(res => setStats(res.data)).catch(() => {});
    dashboardAPI.getActiveCalls().then(res => setActiveCalls(res.data)).catch(() => {});
    dashboardAPI.getRecentCalls(10).then(res => setRecentCalls(res.data)).catch(() => {});
  }, [setActiveCalls, setRecentCalls]);

  useEffect(() => {
    fetchDashboardData();

    // Listen for real-time updates
    wsManager.connect("/dashboard");
    const unsub = wsManager.subscribe("new_call", () => {
      fetchDashboardData();
    });

    return () => {
      unsub();
      wsManager.disconnect();
    };
  }, [fetchDashboardData]);

  const statusVariant = useCallback((status: string) => {
    if (status === "resolved") return "success" as const;
    if (status === "escalated") return "warning" as const;
    if (status === "missed") return "danger" as const;
    return "info" as const;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="p-6 space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-foreground font-display tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Real-time overview of the 1092 Helpline</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className={`premium-card p-5 bg-gradient-to-br ${card.gradient} hover:shadow-premium-lg transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="premium-label">{card.label}</span>
              <div className={`w-9 h-9 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-[18px] h-[18px] ${card.iconColor}`} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-foreground font-display tracking-tight">
              <AnimatedCounter value={stats[card.key]} suffix={card.suffix} />
            </p>
          </motion.div>
        ))}
      </div>

      {/* Active Calls */}
      <div className="premium-card overflow-hidden">
        <div className="p-5 border-b border-border/60 flex items-center justify-between">
          <h3 className="font-bold text-foreground font-display tracking-tight">Active Calls</h3>
          <StatusBadge label={`${activeCalls.length} Live`} variant="danger" pulse />
        </div>
        <div className="divide-y divide-border/50">
          {activeCalls.map((call, i) => (
            <motion.div
              key={call.callId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 px-5 flex items-center gap-4 hover:bg-accent/50 transition-all duration-200 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="font-mono text-sm font-semibold text-foreground">{call.callId}</span>
                  <StatusBadge label={call.language} variant="info" />
                </div>
                <p className="text-xs text-muted-foreground">{call.issue}</p>
              </div>
              <EmotionIndicator emotion={call.emotion} size="sm" />
              <div className="w-32">
                <ConfidenceBar score={call.confidence} showLabel={false} />
              </div>
              <span className="text-sm text-muted-foreground font-mono w-16 text-right tabular-nums">
                {formatDuration(call.duration)}
              </span>
              <PremiumButton
                variant="primary"
                size="sm"
                onClick={() => navigate(`/call/${call.callId}`)}
              >
                Take Call
                <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
              </PremiumButton>
            </motion.div>
          ))}
          {activeCalls.length === 0 && (
            <div className="p-10 text-center text-muted-foreground text-sm">
              No active calls at the moment
            </div>
          )}
        </div>
      </div>

      {/* Recent Calls */}
      <div className="premium-card overflow-hidden">
        <div className="p-5 border-b border-border/60">
          <h3 className="font-bold text-foreground font-display tracking-tight">Recent Calls</h3>
        </div>
        <div className="divide-y divide-border/50">
          {recentCalls.slice(0, 10).map((call, i) => (
            <motion.div
              key={call.callId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.03 }}
              className="p-3.5 px-5 flex items-center gap-4 text-sm hover:bg-accent/50 transition-all duration-200"
            >
              <span className="font-mono text-muted-foreground w-24 text-xs">{call.callId}</span>
              <span className="text-muted-foreground w-20 text-xs tabular-nums">{formatTime(call.startTime)}</span>
              <StatusBadge label={call.language} variant="info" />
              <EmotionIndicator emotion={call.emotion} size="sm" />
              <div className="flex-1" />
              <StatusBadge label={call.status} variant={statusVariant(call.status)} />
              <button
                onClick={() => navigate(`/call/${call.callId}`)}
                className="text-primary text-xs font-semibold hover:underline underline-offset-2 font-display"
              >
                View
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

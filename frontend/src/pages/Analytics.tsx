import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../apiConfig";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import { Target, Clock, TrendingUp, Zap, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const COLORS = ["hsl(152,56%,39%)", "hsl(38,92%,50%)", "hsl(0,72%,51%)", "hsl(217,56%,24%)", "hsl(42,55%,55%)", "hsl(220,60%,50%)"];

const tooltipStyle = {
  borderRadius: "12px",
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  fontSize: "12px",
};

const tickStyle = { fontSize: 10, fill: "hsl(var(--muted-foreground))" };

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/analytics`);
      if (!response.ok) throw new Error("Fetch failed");
      const result = await response.json();
      setData(result);
    } catch (error) {
      toast.error("Failed to sync live analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Gathering Intelligence...</p>
      </div>
    );
  }

  const quickStats = [
    { label: "AI Resolution", value: data.summary.accuracy, icon: Target, gradient: "from-emerald-500/10 to-emerald-500/5", iconColor: "text-emerald-500" },
    { label: "Avg Handle Time", value: data.summary.avgTime, icon: Clock, gradient: "from-blue-500/10 to-blue-500/5", iconColor: "text-blue-500" },
    { label: "Top Intent", value: data.summary.topIntent, icon: TrendingUp, gradient: "from-purple-500/10 to-purple-500/5", iconColor: "text-purple-500" },
    { label: "Active Nodes", value: "Normal", icon: Zap, gradient: "from-amber-500/10 to-amber-500/5", iconColor: "text-amber-500" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Intelligence</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time performance metrics for 1092 Helpline</p>
        </div>
        <div className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-tighter text-primary">Live Feed Active</span>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((s, i) => (
          <motion.div 
            key={s.label} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }}
            className={`p-5 rounded-3xl border border-border/50 bg-gradient-to-br ${s.gradient} backdrop-blur-sm shadow-sm`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{s.label}</span>
              <s.icon className={`w-5 h-5 ${s.iconColor}`} />
            </div>
            <p className="text-2xl font-black tracking-tight">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Line Chart: Traffic Analysis */}
        <section className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Call Volume Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.callsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="hour" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }} />
              <Line type="step" dataKey="aiHandled" stroke="hsl(152,56%,39%)" strokeWidth={3} name="AI Resolved" dot={false} />
              <Line type="step" dataKey="escalated" stroke="hsl(0,72%,51%)" strokeWidth={3} name="Escalated" dot={false} />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold' }} />
            </LineChart>
          </ResponsiveContainer>
        </section>

        {/* Pie Chart: Sentiment Distribution */}
        <section className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold mb-6">Citizen Sentiment Index</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={data.emotionDistribution} 
                cx="50%" cy="50%" 
                innerRadius={70} outerRadius={100} 
                paddingAngle={5} 
                dataKey="value"
                stroke="none"
              >
                {data.emotionDistribution.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} className="hover:opacity-80 transition-opacity" />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend layout="vertical" align="right" verticalAlign="middle" iconType="rect" />
            </PieChart>
          </ResponsiveContainer>
        </section>

        {/* Bar Chart: Language Support */}
        <section className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold mb-6">Language Proficiency Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.languageDistribution}>
              <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="language" tick={tickStyle} axisLine={false} />
              <YAxis tick={tickStyle} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'transparent' }} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Vertical Bar Chart: Escalation Root Causes */}
        <section className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold mb-6">Escalation Drivers</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.escalationReasons} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="reason" type="category" tick={tickStyle} width={100} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="hsl(0,72%,51%)" radius={[0, 8, 8, 0]} barSize={25} />
            </BarChart>
          </ResponsiveContainer>
        </section>

      </div>
    </motion.div>
  );
}
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../apiConfig";
import { formatDateTime, formatDuration } from "@/utils/formatters";
import { EMOTIONS, LANGUAGES } from "@/utils/constants";
import type { CallData } from "@/store/callStore";
import StatusBadge from "@/components/common/StatusBadge";
import EmotionIndicator from "@/components/common/EmotionIndicator";
import ConfidenceBar from "@/components/common/ConfidenceBar";
import { Search, X, SlidersHorizontal, Download, FileText, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function CallHistoryPage() {
  const [calls, setCalls] = useState<CallData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [languageFilter, setLanguageFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedCall, setSelectedCall] = useState<CallData | null>(null);

  // Fetch real history from Python backend
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/history`);
      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();
      setCalls(data);
    } catch (error) {
      toast.error("Could not load call history");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = useMemo(() => {
    return calls.filter((c) => {
      const matchesSearch = search === "" || 
        c.callId.toLowerCase().includes(search.toLowerCase()) || 
        c.issue?.toLowerCase().includes(search.toLowerCase());
      
      const matchesLang = languageFilter === "All" || c.language === languageFilter;
      const matchesStatus = statusFilter === "All" || c.status.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesLang && matchesStatus;
    });
  }, [calls, search, languageFilter, statusFilter]);

  const statusVariant = (s: string) => {
    switch (s.toLowerCase()) {
      case "resolved": return "success";
      case "escalated": return "warning";
      case "missed": return "danger";
      default: return "info";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 space-y-6"
    >
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Call Archives</h2>
          <p className="text-sm text-muted-foreground mt-1">Audit and review historical emergency records</p>
        </div>
        <button 
          onClick={() => toast.success("Exporting CSV...")}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          Export Records
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="bg-card/50 border border-border/50 p-4 rounded-2xl flex items-center gap-4 flex-wrap backdrop-blur-md">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
         <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Call ID, Issue, or Agent..."
            className="w-full bg-background/50 border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-background/50 border border-border/50 px-3 py-1 rounded-xl">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="bg-transparent text-sm py-1.5 outline-none font-medium"
            >
              <option value="All">All Languages</option>
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-background/50 border border-border/50 px-3 py-1 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm py-1.5 outline-none font-medium"
            >
              <option value="All">All Status</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated</option>
              <option value="missed">Missed</option>
            </select>
          </div>
        </div>
        
        <div className="ml-auto text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-2 rounded-lg">
          {filtered.length} Entries Found
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                {["Call ID", "Timestamp", "Duration", "Language", "Sentiment", "Confidence", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-20 text-center text-muted-foreground animate-pulse">Loading archive database...</td>
                </tr>
              ) : filtered.map((call, i) => (
              <motion.tr
                  key={call.callId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.01 }}
                  className="hover:bg-primary/[0.02] transition-colors group"
                >
                  <td className="px-6 py-4 font-mono text-[11px] font-bold text-foreground/70">{call.callId}</td>
                  <td className="px-6 py-4 text-xs text-muted-foreground tabular-nums">
                    {formatDateTime(call.startTime)}
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] tabular-nums">
                    {formatDuration(call.duration || 0)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge label={call.language} variant="info" />
                  </td>
                  <td className="px-6 py-4">
                    <EmotionIndicator emotion={call.emotion} size="sm" />
                  </td>
                  <td className="px-6 py-4 w-32">
                    <ConfidenceBar score={call.confidence} showLabel={false} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge label={call.status} variant={statusVariant(call.status) as any} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedCall(call)} 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-[11px] font-bold hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      <FileText className="w-3 h-3" />
                      RECAP
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Slide-over / Modal */}
      <AnimatePresence>
        {selectedCall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedCall(null)}
          >
          <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-card border border-border/60 rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/20">
                <div>
                  <h3 className="text-lg font-bold">Call Audit Log</h3>
                  <p className="text-xs text-muted-foreground font-mono">{selectedCall.callId}</p>
                </div>
                <button onClick={() => setSelectedCall(null)} className="p-2 hover:bg-accent rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto max-h-[calc(85vh-100px)] space-y-8">
                {/* Meta Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <DetailItem label="Primary Language" value={selectedCall.language} />
                  <DetailItem label="AI Sentiment" value={EMOTIONS[selectedCall.emotion]?.label || "Neutral"} />
                  <DetailItem label="Handled By" value={selectedCall.handledBy || "System Admin"} />
                  <DetailItem label="Status" value={<StatusBadge label={selectedCall.status} variant={statusVariant(selectedCall.status) as any} />} />
                </div>

                {/* Content Section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Full Transcript</h4>
                  <div className="bg-muted/30 rounded-2xl p-6 space-y-4 border border-border/50">
                    {selectedCall.transcript?.length ? selectedCall.transcript.map((line, idx) => (
                      <div key={idx} className={`flex flex-col ${line.speaker === "agent" ? "items-end" : "items-start"}`}>
                        <span className="text-[10px] font-bold uppercase opacity-40 mb-1">{line.speaker}</span>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                          line.speaker === "agent" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-accent/50 text-foreground rounded-tl-none"
                        }`}>
                          {line.text}
                        </div>
                      </div>
                    )) : (
                      <p className="text-center py-4 text-muted-foreground italic text-sm">No transcript available for this record.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DetailItem({ label, value }: { label: string; value: any }) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{label}</span>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCallStore, type TranscriptLine } from "@/store/callStore";
import { useUIStore } from "@/store/uiStore";
import { formatDuration, formatTime } from "@/utils/formatters";
import { EMOTIONS, URGENCY_LEVELS } from "@/utils/constants";
import type { EmotionType } from "@/utils/constants";
import { wsManager } from "@/services/websocket"; // We will create this next
import { callAPI } from "@/services/api";
import ConfidenceBar from "@/components/common/ConfidenceBar";
import EmotionIndicator from "@/components/common/EmotionIndicator";
import StatusBadge from "@/components/common/StatusBadge";
import { PremiumButton } from "@/components/common/PremiumButton";
import {
  PhoneOff, AlertTriangle, Hand, Copy, Clock, FileText, Lightbulb,
  CheckCircle, XCircle, MinusCircle, ChevronRight, Zap,
  Mic, Square, Search, Filter, Edit3, Check, X
} from "lucide-react";
import toast from "react-hot-toast";

export default function ActiveCall() {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const { currentCall, setCurrentCall, appendTranscript, updateCurrentCallField } = useCallStore();
  const { showEscalationOverlay, setEscalationOverlay } = useUIStore();
  
  const [elapsed, setElapsed] = useState(0);
  const [showVerification, setShowVerification] = useState(false);
  const [isManualControl, setIsManualControl] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Audio Streaming State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Search/Filter State
  const [transcriptSearch, setTranscriptSearch] = useState("");
  const [speakerFilter, setSpeakerFilter] = useState<"all" | "citizen" | "ai" | "agent">("all");
  const [showTranscriptFilters, setShowTranscriptFilters] = useState(false);

  // --- 1. LIVE WEB-SOCKET SYNC ---
  useEffect(() => {
    if (!callId) return;

    // Connect to your Python backend (e.g., FastAPI on port 8000)
    wsManager.connect(`/ws/calls/${callId}`);

    // Listen for AI Transcriptions from Python
    const unsubTranscript = wsManager.subscribe("transcript_update", (data) => {
      appendTranscript(data as TranscriptLine);
    });

    // Listen for Live Emotion Analysis
    const unsubEmotion = wsManager.subscribe("emotion_update", (data: any) => {
      updateCurrentCallField({ emotion: data.emotion as EmotionType });
    });

    // Listen for AI Confidence scores
    const unsubConfidence = wsManager.subscribe("confidence_update", (data: any) => {
      updateCurrentCallField({ confidence: data.confidence, confidenceReason: data.reason });
    });

    return () => {
      wsManager.disconnect();
      unsubTranscript();
      unsubEmotion();
      unsubConfidence();
    };
  }, [callId, appendTranscript, updateCurrentCallField]);

  // --- 2. LIVE AUDIO STREAMING (BACKEND INTEGRATION) ---
  const startStreaming = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Opus codec is best for Python libraries like Whisper or Deepgram
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && wsManager.connected) {
          const buffer = await event.data.arrayBuffer();
          // Sending raw chunks to Python for real-time STT
          wsManager.send("audio_data", {
            callId,
            chunk: Array.from(new Uint8Array(buffer))
          });
        }
      };

      // Send a slice every 250ms for smooth real-time transcription
      mediaRecorder.start(250); 
      setIsRecording(true);
      
      recordingTimerRef.current = setInterval(() => setRecordingDuration(d => d + 1), 1000);
      toast.success("AI is listening...");
    } catch (err) {
      toast.error("Microphone access denied");
    }
  }, [callId]);

  const stopStreaming = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
    setIsRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  }, []);

  // --- 3. UI LOGIC ---
  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [currentCall?.transcript]);

  const filteredTranscript = useMemo(() => {
    if (!currentCall) return [];
    return currentCall.transcript.filter((line) => {
      if (speakerFilter !== "all" && line.speaker !== speakerFilter) return false;
      if (transcriptSearch && !line.text.toLowerCase().includes(transcriptSearch.toLowerCase())) return false;
      return true;
    });
  }, [currentCall?.transcript, speakerFilter, transcriptSearch]);

  if (!currentCall) return null;
  const urgencyConfig = URGENCY_LEVELS[currentCall.urgency];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-[calc(100vh-4.25rem)] gap-4 p-4 overflow-hidden">
      
      {/* LEFT PANEL: CALL STATUS */}
      <div className="w-72 flex-shrink-0 space-y-4 overflow-y-auto pr-1">
        <div className="premium-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-display">Call Session</h3>
            <span className="font-mono text-[10px] text-muted-foreground bg-accent px-2 py-0.5 rounded">{currentCall.callId}</span>
          </div>
          
          <div className="flex items-center gap-3 text-2xl font-mono font-bold bg-accent/50 p-3 rounded-2xl border border-primary/10">
            <Clock className="w-5 h-5 text-primary" />
            {formatDuration(elapsed)}
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge label={currentCall.language} variant="info" />
            <StatusBadge label={currentCall.urgency.toUpperCase()} variant={currentCall.urgency === 'high' ? 'danger' : 'warning'} />
          </div>

          {/* AUDIO RECORDING CONTROL */}
          <div className="pt-4 border-t border-border/60">
            {!isRecording ? (
              <PremiumButton variant="primary" className="w-full gap-2" onClick={startStreaming}>
                <Mic className="w-4 h-4" /> Start AI Assist
              </PremiumButton>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-destructive/10 p-2 rounded-xl border border-destructive/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-destructive font-mono">{formatDuration(recordingDuration)}</span>
                  </div>
                  <button onClick={stopStreaming} className="p-1.5 bg-destructive text-white rounded-lg"><Square className="w-3 h-3" /></button>
                </div>
                <p className="text-[10px] text-center text-muted-foreground animate-pulse">Streaming audio to backend...</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <PremiumButton variant="danger" className="w-full" onClick={() => setEscalationOverlay(true)}>
            <AlertTriangle className="w-4 h-4" /> Escalate to Agent
          </PremiumButton>
          <PremiumButton variant="outline" className="w-full" onClick={() => navigate('/dashboard')}>
            <PhoneOff className="w-4 h-4" /> End Call
          </PremiumButton>
        </div>
      </div>

      {/* CENTER PANEL: TRANSCRIPT */}
      <div className="flex-1 premium-card flex flex-col min-w-0 border-primary/10 shadow-lg">
        <div className="p-4 border-b border-border/60 flex justify-between items-center bg-muted/30">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Live Transcription
          </h3>
          <div className="flex gap-2">
            <button onClick={() => setShowTranscriptFilters(!showTranscriptFilters)} className="p-2 hover:bg-accent rounded-lg text-muted-foreground">
              <Filter className="w-4 h-4" />
            </button>
            <button onClick={() => toast.success("Copied")} className="p-2 hover:bg-accent rounded-lg text-muted-foreground">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div ref={transcriptRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin bg-dot-grid">
          <AnimatePresence mode="popLayout">
            {filteredTranscript.map((line) => (
              <motion.div key={line.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${line.speaker === "citizen" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                  line.speaker === "citizen" ? "bg-accent border border-border/50 text-foreground rounded-tl-none" 
                  : "bg-primary text-primary-foreground rounded-tr-none"
                }`}>
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">{line.speaker}</p>
                  <p className="text-sm leading-relaxed">{line.text}</p>
                  <p className="text-[9px] opacity-40 mt-1 text-right">{formatTime(line.timestamp)}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT PANEL: AI INSIGHTS */}
      <div className="w-80 flex-shrink-0 space-y-4 overflow-y-auto">
        <div className="premium-card p-5 space-y-6">
          <section>
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-primary" /> Extraction
            </h3>
            <div className="space-y-4">
              {['intent', 'location', 'issue'].map((key) => (
                <div key={key}>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">{key}</label>
                  <div className="mt-1 p-2.5 bg-accent/50 rounded-xl border border-border/40 text-sm font-medium">
                    {(currentCall as any)[key] || "Analysing..."}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="pt-4 border-t border-border/60">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Live Sentiment</h3>
            <div className="flex items-center gap-4 bg-accent/30 p-3 rounded-2xl">
              <EmotionIndicator emotion={currentCall.emotion} size="lg" />
              <div>
                <p className="font-bold">{EMOTIONS[currentCall.emotion].label}</p>
                <p className="text-xs text-muted-foreground">Confidence: {(currentCall.confidence * 100).toFixed(0)}%</p>
              </div>
            </div>
            <div className="mt-4">
              <ConfidenceBar score={currentCall.confidence} />
            </div>
          </section>

          <section className="pt-4 border-t border-border/60">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Next Best Action</h3>
            <div className="space-y-2">
              {currentCall.suggestedActions.map((action, i) => (
                <button key={i} className="w-full text-left p-3 text-xs bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 rounded-xl font-medium flex justify-between items-center group">
                  {action}
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
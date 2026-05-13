import React, { useState, useRef, useEffect } from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  AlertCircle,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

type CallPhase =
  | "idle"
  | "connecting"
  | "attempt1"
  | "attempt2"
  | "forwarding"
  | "agent_live"
  | "ended";

const SOS = () => {
  const [phase, setPhase] = useState<CallPhase>("idle");
  const [callId, setCallId] = useState("");
  const [lastAiMessage, setLastAiMessage] = useState("");
  const [attemptNum, setAttemptNum] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [aiResult, setAiResult] = useState<any>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Send WebSocket Keep-Alive Pings
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }));
      }
    }, 25000);
    return () => clearInterval(interval);
  }, []);

  const playBase64Audio = async (b64: string) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }
      const audioCtx = audioCtxRef.current;

      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const decoded = await audioCtx.decodeAudioData(bytes.buffer);
      const src = audioCtx.createBufferSource();
      src.buffer = decoded;
      src.connect(audioCtx.destination);
      src.start();
    } catch (err) {
      console.error("[Audio] Failed to play:", err);
    }
  };

  const startCall = async () => {
    if (phase !== "idle" && phase !== "ended") {
      stopCall();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const id = "CALL-" + Math.floor(1000 + Math.random() * 9000);
      setCallId(id);
      setPhase("connecting");
      setAttemptNum(1);
      setLastAiMessage("Connecting to emergency server...");
      setTranscript("");
      setAiResult(null);

      const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
      // Ensure backend URL is correctly targeted
      const backendUrl = window.location.hostname === "localhost" ? "localhost:3000" : window.location.host;
      const WS_URL = `${wsProtocol}://${backendUrl}/citizen/${id}`;
      
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[WS] Connected");
        setPhase("attempt1");
        setLastAiMessage("AI is listening. Please speak clearly about your emergency.");
        toast.success("Connected to Helpline");

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus",
        });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = async (e) => {
          if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            const buf = await e.data.arrayBuffer();
            const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
            ws.send(JSON.stringify({ type: "audio_chunk", data: b64 }));
          }
        };
        mediaRecorder.start(2000); // chunk every 2 seconds
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === "ai_audio" && msg.data) {
          playBase64Audio(msg.data);
          setLastAiMessage("AI is responding...");
          setAttemptNum((prev) => (prev < 2 ? prev + 1 : 2));
        } else if (msg.type === "agent_audio" && msg.data) {
          playBase64Audio(msg.data);
          setPhase("agent_live");
          setLastAiMessage("A live agent has joined your call.");
        } else if (msg.type === "pong") {
          // Keep-alive OK
        }
      };

      ws.onclose = () => {
        console.log("[WS] Closed");
        if (phase !== "ended") {
          stopCall();
        }
      };

      ws.onerror = (error) => {
        console.error("[WS] Error", error);
        toast.error("WebSocket connection error");
        stopCall();
      };
    } catch (error) {
      toast.error("Microphone access denied");
      console.error(error);
    }
  };

  const stopCall = () => {
    setPhase("ended");
    setLastAiMessage("");

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    toast.success("Call ended. Stay safe.");

    setTimeout(() => {
      setPhase("idle");
      setTranscript("");
      setAiResult(null);
    }, 3000);
  };

  const isLive = phase !== "idle" && phase !== "ended";

  const phaseConfig: Record<
    CallPhase,
    { label: string; color: string; subtext: string }
  > = {
    idle: {
      label: "Ready",
      color: "bg-slate-700",
      subtext: "Press SOS to begin",
    },
    connecting: {
      label: "Connecting...",
      color: "bg-amber-500",
      subtext: "Establishing secure connection",
    },
    attempt1: {
      label: "Attempt 1 of 2",
      color: "bg-primary",
      subtext: "AI Dispatcher is listening and analyzing",
    },
    attempt2: {
      label: "Attempt 2 of 2",
      color: "bg-amber-400",
      subtext: "Last attempt — please speak clearly",
    },
    forwarding: {
      label: "Forwarding to Human Responder",
      color: "bg-orange-500",
      subtext: "Connecting you to a live agent, please hold...",
    },
    agent_live: {
      label: "Live Agent Connected",
      color: "bg-green-500",
      subtext: "You are now speaking with an emergency responder",
    },
    ended: {
      label: "Call Ended",
      color: "bg-slate-600",
      subtext: "Thank you. Stay safe.",
    },
  };

  const cfg = phaseConfig[phase];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-primary/20">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            1092 Emergency Helpline
          </div>

          <h1 className="text-4xl font-black tracking-tighter">
            Help is Here.
          </h1>

          <p className="text-slate-400 text-sm mt-2">
            Speak your emergency. Our AI will respond.
          </p>
        </motion.div>

        <AnimatePresence>
          {isLive && phase !== "agent_live" && phase !== "forwarding" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full mb-6"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  AI Attempt Progress
                </span>

                <span className="text-[10px] font-bold text-primary">
                  {attemptNum} / 2
                </span>
              </div>

              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full transition-all duration-700 ${attemptNum >= 2 ? "bg-amber-400" : "bg-primary"
                    }`}
                  animate={{ width: `${(attemptNum / 2) * 100}%` }}
                  initial={{ width: "0%" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase === "forwarding" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full mb-6 bg-orange-500/20 border border-orange-500/30 p-4 rounded-2xl flex items-center gap-3"
            >
              <Loader2
                size={20}
                className="text-orange-400 animate-spin flex-shrink-0"
              />

              <div>
                <p className="text-sm font-bold text-orange-300">
                  Forwarding to Live Responder
                </p>

                <p className="text-xs text-orange-400/70 mt-0.5">
                  Please hold — an agent is joining your call.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase === "agent_live" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full mb-6 bg-green-500/20 border border-green-500/30 p-4 rounded-2xl flex items-center gap-3"
            >
              <Mic
                size={20}
                className="text-green-400 animate-pulse flex-shrink-0"
              />

              <div>
                <p className="text-sm font-bold text-green-300">
                  Live Agent Connected
                </p>

                <p className="text-xs text-green-400/70 mt-0.5">
                  You are now speaking with an emergency responder.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {lastAiMessage && (
            <motion.div
              key={lastAiMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full mb-4 bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-3 items-start"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                <MessageSquare size={14} />
              </div>

              <p className="text-sm text-slate-200 leading-relaxed">
                {lastAiMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {transcript && (
          <div className="w-full mb-4 bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
            <p className="text-xs text-blue-300 mb-1 font-bold uppercase">
              User Spoke
            </p>

            <p className="text-sm text-white">{transcript}</p>
          </div>
        )}

        {aiResult && (
          <div className="w-full mb-6 bg-green-500/10 border border-green-500/20 p-4 rounded-2xl">
            <p className="text-xs text-green-300 mb-2 font-bold uppercase">
              AI Analysis
            </p>

            <p className="text-sm">
              <strong>Category:</strong> {aiResult.top_label}
            </p>

            <p className="text-sm">
              <strong>Intent:</strong> {aiResult.intent}
            </p>

            <p className="text-sm">
              <strong>Confidence:</strong>{" "}
              {Number(aiResult.confidence * 100).toFixed(0)}%
            </p>
          </div>
        )}

        <div className="relative my-6">
          <AnimatePresence>
            {isLive && (
              <>
                <motion.div
                  initial={{ scale: 1, opacity: 0 }}
                  animate={{ scale: 1.6, opacity: 0.15 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeOut",
                  }}
                  className={`absolute inset-0 rounded-full ${phase === "agent_live"
                    ? "bg-green-500"
                    : phase === "forwarding"
                      ? "bg-orange-500"
                      : "bg-primary"
                    }`}
                />

                <motion.div
                  initial={{ scale: 1, opacity: 0 }}
                  animate={{ scale: 1.3, opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeOut",
                    delay: 0.5,
                  }}
                  className={`absolute inset-0 rounded-full ${phase === "agent_live"
                    ? "bg-green-500"
                    : phase === "forwarding"
                      ? "bg-orange-500"
                      : "bg-primary"
                    }`}
                />
              </>
            )}
          </AnimatePresence>

          <button
            onClick={isLive ? stopCall : startCall}
            className={`relative z-10 w-52 h-52 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl ${phase === "agent_live"
              ? "bg-slate-900 border-4 border-green-500 text-green-400 scale-105"
              : phase === "forwarding"
                ? "bg-slate-900 border-4 border-orange-500 text-orange-400 scale-105"
                : isLive
                  ? "bg-slate-900 border-4 border-primary text-primary scale-105"
                  : "bg-primary hover:bg-primary/90 text-white hover:scale-105 active:scale-95"
              }`}
          >
            {isLive ? (
              <>
                <PhoneOff size={60} className="mb-2" />

                <span className="font-black text-[10px] tracking-[0.2em] uppercase">
                  End Call
                </span>
              </>
            ) : (
              <>
                <Phone size={60} className="mb-2" />

                <span className="font-black text-2xl tracking-wider uppercase">
                  SOS
                </span>
              </>
            )}
          </button>
        </div>

        <div className="w-full">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-2.5 h-2.5 rounded-full ${cfg.color} ${isLive ? "animate-pulse" : ""
                  }`}
              />

              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                {cfg.label}
              </span>

              {isLive && (
                <span className="ml-auto text-[10px] font-mono text-slate-600">
                  {callId}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500">{cfg.subtext}</p>

            <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                animate={isLive ? { x: ["-100%", "100%"] } : { x: "-100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  ease: "linear",
                }}
                className={`h-full w-1/3 bg-gradient-to-r from-transparent ${phase === "agent_live"
                  ? "via-green-500"
                  : phase === "forwarding"
                    ? "via-orange-500"
                    : "via-primary"
                  } to-transparent`}
              />
            </div>

            <div className="flex items-center gap-1.5 mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <AlertCircle size={10} />

              <span>All calls are secured and recorded for safety.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOS;
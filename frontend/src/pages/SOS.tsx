import React, { useState, useRef } from "react";
import { Phone, PhoneOff, Mic, AlertCircle, MessageSquare, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

type CallPhase = "idle" | "connecting" | "attempt1" | "attempt2" | "forwarding" | "agent_live" | "ended";

const SOS = () => {
  const [phase, setPhase] = useState<CallPhase>("idle");
  const [callId, setCallId] = useState("");
  const [lastAiMessage, setLastAiMessage] = useState("");
  const [attemptNum, setAttemptNum] = useState(0);

  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = text.match(/[\u0C80-\u0CFF]/) ? "kn-IN" : "en-US";
    utter.rate = 1.0;
    utter.onstart = () => console.log("[TTS] Speaking:", text);
    utter.onerror = (e) => console.error("[TTS] Error:", e);
    window.speechSynthesis.speak(utter);
  };

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const id = "CALL-" + Math.floor(1000 + Math.random() * 9000);
      setCallId(id);
      setPhase("connecting");
      setAttemptNum(0);
      setLastAiMessage("");

      // Unlock audio context for later speech
      const silent = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFRm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=");
      silent.play().catch(() => {});

      console.log(`[SOS] MOCK_START: ${id}`);
      
      // Simulate connection delay
      setTimeout(() => {
        setPhase("attempt1");
        setAttemptNum(1);
        const msg1 = "Namaskara! 1092 Helpline. Nimma samasye enu? (Welcome to 1092. What is your emergency?)";
        setLastAiMessage(msg1);
        speak(msg1);
        toast(msg1, { icon: "🤖", duration: 5000 });

        // Phase 2: Attempt 2
        setTimeout(() => {
          setAttemptNum(2);
          setPhase("attempt2");
          const msg2 = "Nimma pradesha yavudu? (Which area are you calling from?)";
          setLastAiMessage(msg2);
          speak(msg2);
          toast(msg2, { icon: "🤖", duration: 5000 });

          // Phase 3: Forwarding
          setTimeout(() => {
            setPhase("forwarding");
            const msg3 = "Forwarding your call to a live agent. Please hold.";
            setLastAiMessage(msg3);
            speak(msg3);

            // Phase 4: Agent Live
            setTimeout(() => {
              setPhase("agent_live");
              toast("Agent Priya has joined the call.", { icon: "🎧" });
            }, 3000);

          }, 5000);

        }, 6000);

      }, 2000);

    } catch (err) {
      toast.error("Microphone access denied.");
      console.error(err);
    }
  };

  const stopCall = () => {
    setPhase("ended");
    setLastAiMessage("");
    window.speechSynthesis.cancel();
    // socketRef.current?.close(); // No socket in mock
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    toast.success("Call Ended. Stay Safe.");
    setTimeout(() => setPhase("idle"), 3000);
  };


  const isLive = phase !== "idle" && phase !== "ended";

  const phaseConfig: Record<CallPhase, { label: string; color: string; subtext: string }> = {
    idle: { label: "Ready", color: "bg-slate-700", subtext: "Press SOS to begin" },
    connecting: { label: "Connecting...", color: "bg-amber-500", subtext: "Establishing secure connection" },
    attempt1: { label: "Attempt 1 of 2", color: "bg-primary", subtext: "AI Dispatcher is listening and analyzing" },
    attempt2: { label: "Attempt 2 of 2", color: "bg-amber-400", subtext: "Last attempt — please speak clearly" },
    forwarding: { label: "Forwarding to Human Responder", color: "bg-orange-500", subtext: "Connecting you to a live agent, please hold..." },
    agent_live: { label: "Live Agent Connected", color: "bg-green-500", subtext: "You are now speaking with an emergency responder" },
    ended: { label: "Call Ended", color: "bg-slate-600", subtext: "Thank you. Stay safe." },
  };

  const cfg = phaseConfig[phase];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 max-w-md mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-primary/20">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            1092 Emergency Helpline
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Help is Here.</h1>
          <p className="text-slate-400 text-sm mt-2">Speak your emergency. Our AI will respond.</p>
        </motion.div>

        {/* Attempt Progress Bar */}
        <AnimatePresence>
          {isLive && phase !== "agent_live" && phase !== "forwarding" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full mb-6"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Attempt Progress</span>
                <span className="text-[10px] font-bold text-primary">{attemptNum} / 2</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full transition-all duration-700 ${
                    attemptNum >= 2 ? "bg-amber-400" : "bg-primary"
                  }`}
                  animate={{ width: `${(attemptNum / 2) * 100}%` }}
                  initial={{ width: "0%" }}
                />
              </div>
              <div className="flex justify-between mt-1">
                {[1, 2].map(n => (
                  <span key={n} className={`text-[10px] font-bold ${
                    attemptNum >= n ? (n === 2 ? "text-amber-400" : "text-primary") : "text-slate-600"
                  }`}>
                    Attempt {n}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Forwarding Banner */}
        <AnimatePresence>
          {phase === "forwarding" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full mb-6 bg-orange-500/20 border border-orange-500/30 p-4 rounded-2xl flex items-center gap-3"
            >
              <Loader2 size={20} className="text-orange-400 animate-spin flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-orange-300">Forwarding to Live Responder</p>
                <p className="text-xs text-orange-400/70 mt-0.5">Please hold — an agent is joining your call.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Agent Live Banner */}
        <AnimatePresence>
          {phase === "agent_live" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full mb-6 bg-green-500/20 border border-green-500/30 p-4 rounded-2xl flex items-center gap-3"
            >
              <Mic size={20} className="text-green-400 animate-pulse flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-300">Live Agent Connected</p>
                <p className="text-xs text-green-400/70 mt-0.5">You are now speaking with an emergency responder.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Response Box */}
        <AnimatePresence>
          {lastAiMessage && (
            <motion.div
              key={lastAiMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full mb-6 bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-3 items-start"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                <MessageSquare size={14} />
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{lastAiMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SOS Button */}
        <div className="relative my-6">
          <AnimatePresence>
            {isLive && (
              <>
                <motion.div
                  initial={{ scale: 1, opacity: 0 }}
                  animate={{ scale: 1.6, opacity: 0.15 }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                  className={`absolute inset-0 rounded-full ${phase === "agent_live" ? "bg-green-500" : phase === "forwarding" ? "bg-orange-500" : "bg-primary"}`}
                />
                <motion.div
                  initial={{ scale: 1, opacity: 0 }}
                  animate={{ scale: 1.3, opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.5 }}
                  className={`absolute inset-0 rounded-full ${phase === "agent_live" ? "bg-green-500" : phase === "forwarding" ? "bg-orange-500" : "bg-primary"}`}
                />
              </>
            )}
          </AnimatePresence>

          <button
            onClick={isLive ? stopCall : startCall}
            className={`relative z-10 w-52 h-52 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl ${
              phase === "agent_live"
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
                <span className="font-black text-[10px] tracking-[0.2em] uppercase">End Call</span>
              </>
            ) : (
              <>
                <Phone size={60} className="mb-2" />
                <span className="font-black text-2xl tracking-wider uppercase">SOS</span>
              </>
            )}
          </button>
        </div>

        {/* Status Card */}
        <div className="w-full">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-2.5 h-2.5 rounded-full ${cfg.color} ${isLive ? "animate-pulse" : ""}`} />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{cfg.label}</span>
              {isLive && <span className="ml-auto text-[10px] font-mono text-slate-600">{callId}</span>}
            </div>
            <p className="text-xs text-slate-500">{cfg.subtext}</p>

            <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                animate={isLive ? { x: ["-100%", "100%"] } : { x: "-100%" }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                className={`h-full w-1/3 bg-gradient-to-r from-transparent ${
                  phase === "agent_live" ? "via-green-500" : phase === "forwarding" ? "via-orange-500" : "via-primary"
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

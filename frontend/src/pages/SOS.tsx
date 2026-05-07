import React, { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Mic, MicOff, AlertCircle, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const SOS = () => {
  const [isCalling, setIsCalling] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [callId, setCallId] = useState("");
  const [lastAiMessage, setLastAiMessage] = useState("");
  
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const id = "CALL-" + Math.floor(1000 + Math.random() * 9000);
      setCallId(id);
      setIsCalling(true);
      setStatus("Connecting...");
      setLastAiMessage("");

      // Unlock audio context for later speech
      const silent = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFRm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=");
      silent.play().catch(() => {});

      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const host = isLocal ? window.location.hostname + ":3000" : window.location.host;
        
      const socket = new WebSocket(`ws://${host}/citizen/${id}`);
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus("Live - AI is Listening");
        startStreaming(stream);
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.log("[SOS] Received:", msg);

          if (msg.type === "ai_speech" && msg.text) {
            setLastAiMessage(msg.text);
            
            // Speak using browser TTS
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(msg.text);
            if (msg.text.match(/[\u0C80-\u0CFF]/)) {
              utterance.lang = "kn-IN";
            } else {
              utterance.lang = "en-US";
            }
            window.speechSynthesis.speak(utterance);
            
            // Visual feedback
            toast(msg.text, { icon: "🤖", duration: 4000 });
          } else if (msg.type === "ai_audio" && msg.data) {
            const audio = new Audio("data:audio/wav;base64," + msg.data);
            audio.play().catch(e => console.error("Audio playback failed:", e));
          }
        } catch (e) {
          console.error("Socket message error:", e);
        }
      };

      socket.onclose = () => {
        stopCall();
      };

      socket.onerror = (e) => {
        console.error("WebSocket error:", e);
        toast.error("Connection error. Is the backend running on port 3000?");
        stopCall();
      };

    } catch (err) {
      toast.error("Microphone access denied.");
      console.error(err);
    }
  };

  const startStreaming = (stream: MediaStream) => {
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = async (event) => {
      if (event.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(",")[1];
          socketRef.current?.send(JSON.stringify({ type: "audio_chunk", data: base64 }));
        };
        reader.readAsDataURL(event.data);
      }
    };

    recorder.start(1500); 
  };

  const stopCall = () => {
    setIsCalling(false);
    setStatus("Call Ended");
    setLastAiMessage("");
    window.speechSynthesis.cancel();
    socketRef.current?.close();
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    toast.success("Call Ended. Stay Safe.");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-primary/30 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 max-w-lg mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-primary/20">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            Active Emergency Node
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">
            1092 Helpline
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            AI is standing by. Speak your emergency in any language.
          </p>
        </motion.div>

        {/* AI Response Display */}
        <AnimatePresence>
          {lastAiMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full mb-8 bg-primary/10 border border-primary/20 p-4 rounded-2xl flex gap-3 items-start backdrop-blur-md"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white">
                <MessageSquare size={16} />
              </div>
              <p className="text-sm font-medium text-slate-100 leading-relaxed">
                {lastAiMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative group mb-12">
          <AnimatePresence>
            {isCalling && (
              <>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 0.2 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                  className="absolute inset-0 bg-primary rounded-full"
                />
              </>
            )}
          </AnimatePresence>

          <button
            onClick={isCalling ? stopCall : startCall}
            className={`relative z-10 w-52 h-52 rounded-full flex flex-col items-center justify-center transition-all duration-700 shadow-2xl ${
              isCalling 
                ? "bg-slate-900 border-4 border-primary text-primary scale-105 shadow-primary/20" 
                : "bg-primary hover:bg-primary/90 text-white hover:scale-105 active:scale-95 shadow-primary/40"
            }`}
          >
            {isCalling ? (
              <>
                <PhoneOff size={64} className="mb-2" />
                <span className="font-black text-[10px] tracking-[0.3em] uppercase">Stop Call</span>
              </>
            ) : (
              <>
                <Phone size={64} className="mb-2" />
                <span className="font-black text-xl tracking-[0.1em] uppercase">HELP</span>
              </>
            )}
          </button>
        </div>

        <div className="w-full">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-3xl shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${isCalling ? "bg-green-500 animate-pulse" : "bg-slate-700"}`} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{status}</span>
              </div>
              {isCalling && (
                <span className="text-[10px] font-mono text-slate-600">{callId}</span>
              )}
            </div>
            
            <div className="space-y-4">
               <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                     animate={isCalling ? { x: ["-100%", "100%"] } : { x: "-100%" }}
                     transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                     className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent"
                  />
               </div>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">
                  Live Analysis Enabled
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOS;

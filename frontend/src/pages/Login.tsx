import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAgentStore } from "@/store/agentStore";
import { setToken, setAgent } from "@/utils/helpers";
import { Lock, User, ShieldCheck, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../apiConfig"; // Ensure this path is correct
import toast from "react-hot-toast";

export default function Login() {
  const [agentId, setAgentId] = useState(""); // Used as 'email' or 'username' for backend
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const setAgentState = useAgentStore((s) => s.setAgent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: agentId, // Mapping agentId to the email field expected by backend
          password: password 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 1. Update Utilities (LocalStorage)
        setToken(data.token);
        setAgent(data.agent);

        // 2. Update Global Store (Zustand)
        setAgentState(data.agent);

        toast.success(`Access Granted: Welcome ${data.agent.name || agentId}`);
        navigate("/dashboard");
      } else {
        setError(true);
        toast.error(data.detail || "Invalid credentials");
      }
    } catch (err) {
      setError(true);
      toast.error("Server connection failed. Is the Python backend running?");
      console.error("Login Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding & Identity */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex w-1/2 flex-col items-center justify-center p-16 text-primary-foreground relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, hsl(217 56% 22%) 0%, hsl(217 56% 14%) 60%, hsl(220 50% 10%) 100%)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-16 w-72 h-72 border border-white/5 rounded-full" />
          <div className="absolute bottom-16 right-12 w-96 h-96 border border-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center space-y-8 max-w-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-28 h-28 mx-auto rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center shadow-2xl"
          >
            <Sparkles className="w-12 h-12 text-secondary-foreground" />
          </motion.div>
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold font-display tracking-tight text-white">1092 Helpline</h1>
            <p className="text-white/60 text-lg font-medium">AI-Powered Citizen Support</p>
          </div>
          <div className="w-12 h-0.5 bg-secondary/60 mx-auto rounded-full" />
          <div className="space-y-1.5">
            <p className="text-sm text-white/50 font-medium">Government of Karnataka</p>
            <p className="text-xs text-white/30 italic">
              Department of Personnel & Administrative Reforms
            </p>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl italic text-secondary/90 font-semibold font-display mt-10"
          >
            "Understand First. Act Right."
          </motion.p>
        </div>
      </motion.div>

      {/* Right Panel - Form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex-1 flex items-center justify-center p-8 bg-background"
      >
        <div className="w-full max-w-[380px] space-y-10">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-2xl font-bold text-foreground font-display tracking-tight">Agent Login</h2>
            <p className="text-muted-foreground text-sm">Sign in to the emergency dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground font-display" htmlFor="agentId">
                Agent Identity
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  id="agentId"
                  type="text"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm ${
                    error ? "border-destructive animate-pulse" : "border-border"
                  }`}
                  placeholder="agent.id@gov.in"
                  aria-label="Agent ID"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground font-display" htmlFor="password">
                Security Key
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm ${
                    error ? "border-destructive animate-pulse" : "border-border"
                  }`}
                  placeholder="Enter your password"
                  aria-label="Password"
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-lg hover:brightness-110 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Secure Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-medium">Authorized Government Terminal</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
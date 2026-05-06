import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAgentStore } from "@/store/agentStore";
import { setToken, setAgent } from "@/utils/helpers";
import { Lock, User, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
  const [agentId, setAgentId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const setAgentState = useAgentStore((s) => s.setAgent);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    await new Promise((r) => setTimeout(r, 800));

    if (agentId && password) {
      const mockAgent = { agentId, agentName: "Agent " + agentId, role: "Operator" };
      setToken("mock-jwt-token-" + agentId);
      setAgent(mockAgent);
      setAgentState(mockAgent);
      toast.success("Welcome, Agent " + agentId);
      navigate("/dashboard");
    } else {
      setError(true);
      toast.error("Invalid credentials");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <motion.div
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex w-1/2 flex-col items-center justify-center p-16 text-primary-foreground relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, hsl(217 56% 22%) 0%, hsl(217 56% 14%) 60%, hsl(220 50% 10%) 100%)",
        }}
      >
        {/* Decorative elements */}
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
            <h1 className="text-4xl font-extrabold font-display tracking-tight">1092 Helpline</h1>
            <p className="text-white/60 text-lg font-medium">AI-Powered Citizen Support</p>
          </div>
          <div className="w-12 h-0.5 bg-secondary/60 mx-auto rounded-full" />
          <div className="space-y-1.5">
            <p className="text-sm text-white/50 font-medium">Government of Karnataka</p>
            <p className="text-xs text-white/30">
              Department of Personnel &amp; Administrative Reforms
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

      {/* Right Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex-1 flex items-center justify-center p-8 bg-background"
      >
        <div className="w-full max-w-[380px] space-y-10">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-2xl font-bold text-foreground font-display tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground text-sm">Sign in to the helpline dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground font-display" htmlFor="agentId">
                Agent ID
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  id="agentId"
                  type="text"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-premium-sm ${
                    error ? "border-destructive animate-[shake_0.3s_ease]" : "border-border"
                  }`}
                  placeholder="Enter your Agent ID"
                  aria-label="Agent ID"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground font-display" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-premium-sm ${
                    error ? "border-destructive animate-[shake_0.3s_ease]" : "border-border"
                  }`}
                  placeholder="Enter your password"
                  aria-label="Password"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 premium-gradient text-primary-foreground rounded-xl font-semibold text-sm shadow-premium hover:shadow-premium-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                "Authenticating..."
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </motion.button>
          </form>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-medium">Secured Government Portal</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

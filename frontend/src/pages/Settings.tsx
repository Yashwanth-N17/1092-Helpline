import { useState } from "react";
import { motion } from "framer-motion";
import { useAgentStore } from "@/store/agentStore";
import { User, Bell, SlidersHorizontal, Monitor, Save } from "lucide-react";
import { PremiumButton } from "@/components/common/PremiumButton";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { agentId, agentName, role } = useAgentStore();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [escalationAlert, setEscalationAlert] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(40);
  const [fontSize, setFontSize] = useState("medium");

  const handleSave = () => {
    toast.success("Settings saved");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="p-6 space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-foreground font-display tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your preferences and configurations</p>
      </div>

      {/* Profile */}
      <div className="premium-card p-6 space-y-5">
        <h3 className="text-sm font-bold text-foreground font-display flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          Agent Profile
        </h3>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="premium-label">Agent ID</label>
            <input value={agentId || "AGT-001"} disabled className="premium-input w-full mt-1.5" />
          </div>
          <div>
            <label className="premium-label">Name</label>
            <input defaultValue={agentName || "Agent"} className="premium-input w-full mt-1.5" />
          </div>
          <div>
            <label className="premium-label">Role</label>
            <input value={role || "Operator"} disabled className="premium-input w-full mt-1.5" />
          </div>
          <div>
            <label className="premium-label">Language Preference</label>
            <select className="premium-select w-full mt-1.5" defaultValue="Kannada">
              <option>Kannada</option>
              <option>Hindi</option>
              <option>English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="premium-card p-6 space-y-5">
        <h3 className="text-sm font-bold text-foreground font-display flex items-center gap-2.5">
          <div className="w-8 h-8 bg-warning/10 rounded-xl flex items-center justify-center">
            <Bell className="w-4 h-4 text-warning" />
          </div>
          Notifications
        </h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer">
            <div>
              <span className="text-sm font-medium text-foreground">Sound on new call</span>
              <p className="text-xs text-muted-foreground mt-0.5">Play audio alert when a new call arrives</p>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-11 h-6 rounded-full transition-all duration-300 ${soundEnabled ? "bg-success" : "bg-border"}`}
              role="switch"
              aria-checked={soundEnabled}
            >
              <span className={`block w-5 h-5 bg-card rounded-full shadow-sm transition-transform duration-300 ${soundEnabled ? "translate-x-[22px]" : "translate-x-0.5"}`} />
            </button>
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer">
            <div>
              <span className="text-sm font-medium text-foreground">Escalation alert</span>
              <p className="text-xs text-muted-foreground mt-0.5">Notify when a call requires human intervention</p>
            </div>
            <button
              onClick={() => setEscalationAlert(!escalationAlert)}
              className={`w-11 h-6 rounded-full transition-all duration-300 ${escalationAlert ? "bg-success" : "bg-border"}`}
              role="switch"
              aria-checked={escalationAlert}
            >
              <span className={`block w-5 h-5 bg-card rounded-full shadow-sm transition-transform duration-300 ${escalationAlert ? "translate-x-[22px]" : "translate-x-0.5"}`} />
            </button>
          </label>
        </div>
      </div>

      {/* Thresholds */}
      <div className="premium-card p-6 space-y-5">
        <h3 className="text-sm font-bold text-foreground font-display flex items-center gap-2.5">
          <div className="w-8 h-8 bg-secondary/10 rounded-xl flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4 text-secondary" />
          </div>
          Confidence Thresholds
        </h3>
        <div className="p-3 rounded-xl bg-accent/50">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-muted-foreground font-medium">Escalation threshold</span>
            <span className="font-bold text-foreground font-display">{confidenceThreshold}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={90}
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
            className="w-full accent-primary h-2 rounded-full"
            aria-label="Confidence threshold"
          />
          <p className="text-xs text-muted-foreground mt-2">Calls below this score will be auto-escalated</p>
        </div>
      </div>

      {/* Display */}
      <div className="premium-card p-6 space-y-5">
        <h3 className="text-sm font-bold text-foreground font-display flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
            <Monitor className="w-4 h-4 text-primary" />
          </div>
          Display Settings
        </h3>
        <div>
          <label className="premium-label">Font Size</label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="premium-select w-full mt-1.5"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>

      <PremiumButton variant="primary" onClick={handleSave}>
        <Save className="w-4 h-4" />
        Save Settings
      </PremiumButton>
    </motion.div>
  );
}

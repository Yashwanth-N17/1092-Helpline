import { useAgentStore } from "@/store/agentStore";
import { Bell, LogOut, Phone, Sparkles } from "lucide-react";
import { useCallStore } from "@/store/callStore";
import { APP_NAME } from "@/utils/constants";
import { clearAuth } from "@/utils/helpers";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { agentName, role, shiftStatus, logout } = useAgentStore();
  const activeCalls = useCallStore((s) => s.activeCalls);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    logout();
    navigate("/login");
  };

  return (
    <header className="h-[68px] bg-card/90 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-6 shadow-premium-sm sticky top-0 z-30">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl premium-gradient flex items-center justify-center shadow-premium">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground font-display leading-tight tracking-tight">
            {APP_NAME}
          </h1>
          <p className="text-[11px] text-muted-foreground font-medium">
            Government of Karnataka
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {activeCalls.length > 0 && (
          <div className="flex items-center gap-2 text-xs bg-destructive/8 text-destructive px-3.5 py-2 rounded-xl border border-destructive/15">
            <Phone className="w-3.5 h-3.5 animate-pulse" />
            <span className="font-semibold font-display">{activeCalls.length} Active</span>
          </div>
        )}

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent">
          <div
            className={`w-2 h-2 rounded-full ring-2 ring-offset-1 ring-offset-accent ${
              shiftStatus === "online"
                ? "bg-success ring-success/30"
                : shiftStatus === "break"
                ? "bg-warning ring-warning/30"
                : "bg-muted-foreground ring-muted-foreground/30"
            }`}
          />
          <span className="text-xs text-muted-foreground font-medium capitalize">
            {shiftStatus}
          </span>
        </div>

        <button
          onClick={() => navigate("/notifications")}
          className="relative p-2.5 hover:bg-accent rounded-xl transition-all duration-200"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px] text-muted-foreground" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full ring-2 ring-card" />
        </button>

        <div className="h-8 w-px bg-border/60" />

        <div className="text-right pl-1">
          <p className="text-sm font-semibold text-foreground font-display">
            {agentName || "Agent"}
          </p>
          <p className="text-[11px] text-muted-foreground">{role || "Operator"}</p>
        </div>

        <button
          onClick={handleLogout}
          className="p-2.5 hover:bg-destructive/8 rounded-xl transition-all duration-200 group"
          aria-label="Logout"
        >
          <LogOut className="w-[18px] h-[18px] text-muted-foreground group-hover:text-destructive transition-colors" />
        </button>
      </div>
    </header>
  );
}

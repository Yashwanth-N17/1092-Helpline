import { cn } from "@/lib/utils";

type StatusVariant = "success" | "danger" | "warning" | "info" | "default";

const variants: Record<StatusVariant, string> = {
  success: "bg-success/8 text-success border-success/15",
  danger: "bg-destructive/8 text-destructive border-destructive/15",
  warning: "bg-warning/8 text-warning border-warning/15",
  info: "bg-primary/8 text-primary border-primary/15",
  default: "bg-accent text-muted-foreground border-border/60",
};

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  className?: string;
  pulse?: boolean;
}

export default function StatusBadge({ label, variant = "default", className, pulse }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border tracking-wide",
        variants[variant],
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      {label}
    </span>
  );
}

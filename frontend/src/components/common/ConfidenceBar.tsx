import { motion } from "framer-motion";
import { confidenceColor } from "@/utils/helpers";

interface ConfidenceBarProps {
  score: number;
  reason?: string;
  showLabel?: boolean;
}

export default function ConfidenceBar({ score, reason, showLabel = true }: ConfidenceBarProps) {
  const color = confidenceColor(score);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Confidence</span>
          <motion.span
            key={score}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-sm font-bold font-display tabular-nums"
            style={{ color }}
          >
            {score}%
          </motion.span>
        </div>
      )}
      <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      {reason && <p className="text-xs text-muted-foreground mt-1.5">{reason}</p>}
    </div>
  );
}

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const premiumButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold font-display tracking-tight transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "premium-gradient text-primary-foreground shadow-premium-sm hover:shadow-premium",
        secondary:
          "bg-secondary text-secondary-foreground shadow-premium-sm hover:shadow-premium hover:brightness-110",
        success:
          "bg-success text-success-foreground shadow-premium-sm hover:shadow-premium hover:brightness-110",
        warning:
          "bg-warning text-warning-foreground shadow-premium-sm hover:shadow-premium hover:brightness-110",
        danger:
          "bg-destructive text-destructive-foreground shadow-premium-sm hover:shadow-premium hover:brightness-110",
        outline:
          "border border-border bg-card text-foreground hover:bg-accent hover:border-primary/30",
        ghost:
          "text-muted-foreground hover:bg-accent hover:text-foreground",
      },
      size: {
        sm: "h-9 px-3.5 text-xs",
        default: "h-10 px-5 py-2.5",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface PremiumButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref">,
    VariantProps<typeof premiumButtonVariants> {}

const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(premiumButtonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
PremiumButton.displayName = "PremiumButton";

export { PremiumButton, premiumButtonVariants };

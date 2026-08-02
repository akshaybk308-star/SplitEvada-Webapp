import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Glow = "violet" | "cyan" | "lime" | "pink" | "none";
const GLOW: Record<Glow, string> = {
  violet: "shadow-glow-violet",
  cyan:   "shadow-glow-cyan",
  lime:   "shadow-glow-lime",
  pink:   "shadow-glow-pink",
  none:   "",
};

interface Props {
  children: ReactNode; className?: string;
  onClick?: () => void; glow?: Glow;
  animate?: boolean;
}

export default function GlassCard({ children, className = "", onClick, glow = "none", animate = true }: Props) {
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 16 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.35, ease: [0.16,1,0.3,1] }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`glass rounded-3xl ${GLOW[glow]} ${onClick ? "cursor-pointer glass-hover" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}

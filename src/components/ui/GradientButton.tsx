import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type Variant = "violet" | "cyan" | "lime" | "glass";
const V: Record<Variant, string> = {
  violet: "gradient-violet shadow-glow-violet hover:opacity-90",
  cyan:   "gradient-cyan   shadow-glow-cyan   hover:opacity-90",
  lime:   "gradient-lime   shadow-glow-lime   hover:opacity-90",
  glass:  "pill-btn-glass",
};

interface Props {
  children: ReactNode; variant?: Variant; className?: string;
  onClick?: () => void; disabled?: boolean; type?: "button"|"submit";
  showArrows?: boolean; icon?: ReactNode;
}

export default function GradientButton({
  children, variant = "violet", className = "",
  onClick, disabled, type = "button", showArrows, icon,
}: Props) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}
      onClick={onClick} disabled={disabled}
      className={`pill-btn ${V[variant]} ${className} disabled:opacity-50 disabled:pointer-events-none`}
    >
      <span className="arrow-circle">{icon ?? <ChevronRight size={16} />}</span>
      <span className="flex-1 text-center">{children}</span>
      {showArrows && <span className="text-white/50 text-xs tracking-widest font-normal">&gt;&gt;&gt;</span>}
    </motion.button>
  );
}

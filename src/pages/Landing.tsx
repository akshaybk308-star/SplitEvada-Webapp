import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import StarField from "../components/ui/StarField";
import RisingLines from "../components/originkit/ui/risinglines";
import GradientButton from "../components/ui/GradientButton";
import BlobTextReveal from "../components/ui/BlobTextReveal";
import { Sparkles, Zap, Shield } from "lucide-react";

export default function Landing() {
  const nav = useNavigate();
  return (
    <div className="space-bg min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <RisingLines color="#a855f7" horizonColor="#7c3aed" opacity={100} particles={600} scale={6} />
      </div>
      <div className="relative z-10 flex flex-col min-h-screen max-w-sm mx-auto w-full px-6">

        {/* Header */}
        <header className="pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 gradient-violet rounded-xl flex items-center justify-center shadow-glow-violet">
              <span className="text-lg">✂️</span>
            </div>
            <span className="font-bold text-xl text-white">SplitEvada</span>
          </div>
          <button onClick={() => nav("/auth")} className="text-sm text-white/60 hover:text-white transition-colors">
            Sign In
          </button>
        </header>

        {/* Hero */}
        <main className="flex-1 flex flex-col justify-center pt-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}>
            <div className="mb-4 h-16 flex items-center justify-start">
              <BlobTextReveal
                texts={["SPLITI", "EVADA", "SMART"]}
                font={{
                  fontSize: "36px",
                  fontWeight: 900,
                  fontFamily: "Inter, sans-serif",
                  letterSpacing: "-0.03em",
                }}
                wipeColor="#a855f7"
                revealColor="#14b8a6"
                color="#ffffff"
                blobSize={10}
              />
            </div>
            <h1 className="text-3xl font-black leading-tight text-white mb-4">
              Everything got<br />
              <span className="gradient-text-violet">way simpler</span> ✦
            </h1>
            <p className="text-white/50 text-base leading-relaxed mb-8">
              Split bills, track expenses, and settle debts with friends — all in one beautiful app.
            </p>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16,1,0.3,1] }}
            className="grid grid-cols-3 gap-3 mb-10"
          >
            {[
              { icon: Zap, label: "Instant Split", gradient: "gradient-violet", glow: "shadow-glow-violet" },
              { icon: Shield, label: "Secure", gradient: "gradient-cyan", glow: "shadow-glow-cyan" },
              { icon: Sparkles, label: "Analytics", gradient: "gradient-lime", glow: "shadow-glow-lime" },
            ].map(({ icon: Icon, label, gradient, glow }) => (
              <div key={label} className="glass rounded-2xl p-4 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 ${gradient} rounded-xl flex items-center justify-center ${glow}`}>
                  <Icon size={18} className="text-white" />
                </div>
                <span className="text-xs text-white/60 text-center font-medium">{label}</span>
              </div>
            ))}
          </motion.div>

          {/* Preview card (floating) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16,1,0.3,1] }}
            className="glass rounded-3xl p-5 mb-10 shadow-glow-violet animate-float"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60 text-sm">Total this month</span>
              <span className="text-xs bg-violet-500/20 text-violet-300 rounded-full px-2.5 py-1 font-medium">August</span>
            </div>
            <p className="amount-display gradient-text-violet mb-4">₹0</p>
            <div className="flex gap-2">
              <div className="flex-1 glass rounded-2xl p-3">
                <p className="text-xs text-white/50 mb-1">You owe</p>
                <p className="font-bold text-pink-400">₹0</p>
              </div>
              <div className="flex-1 glass rounded-2xl p-3">
                <p className="text-xs text-white/50 mb-1">Owed to you</p>
                <p className="font-bold text-lime-400">₹0</p>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="space-y-3 pb-12"
          >
            <GradientButton className="w-full justify-center text-lg py-4" showArrows onClick={() => nav("/auth?mode=signup")}>
              Join Now
            </GradientButton>
            
          </motion.div>
        </main>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, Lock, ShieldCheck } from "lucide-react";
import StarField from "../components/ui/StarField";
import GradientButton from "../components/ui/GradientButton";
import { useAppStore } from "../store/useAppStore";

export default function Auth() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const loginMember = useAppStore(s => s.loginMember);
  const nav = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!mobile.trim()) return setError("Mobile number is required");
    if (!password.trim()) return setError("Password is required");

    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    
    const result = loginMember(mobile, password);
    setLoading(false);

    if (result.success) {
      nav("/app");
    } else {
      setError(result.message || "Invalid credentials");
    }
  }

  return (
    <div className="space-bg min-h-screen flex items-center justify-center px-6">
      <StarField count={60} />
      <div className="relative z-10 w-full max-w-sm">
        <button onClick={() => nav("/")} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8">
          <ArrowLeft size={18} /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 gradient-violet rounded-2xl flex items-center justify-center shadow-glow-violet">
              <span className="text-2xl">✂️</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">SplitEvada</h1>
              <p className="text-white/50 text-sm">Members Only Portal</p>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-2 bg-violet-500/15 border border-violet-500/30 rounded-2xl p-3 mb-5 text-violet-300 text-xs">
              <ShieldCheck size={18} className="flex-shrink-0" />
              <span>Restricted access for pre-authorized team members only.</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-white/70 text-sm font-medium block mb-2">Registered Mobile Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="tel"
                    className="input-glass pl-11 font-mono tracking-wider text-base"
                    placeholder="e.g. 7902385215"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="text-white/70 text-sm font-medium block mb-1">Password</label>
                <p className="text-white/40 text-[11px] mb-2">Your Name in CAPITAL LETTERS (e.g. ATHULDAS)</p>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="password"
                    className="input-glass pl-11 tracking-widest font-bold uppercase text-base"
                    placeholder="NAME IN CAPS"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-3 text-pink-400 text-xs font-medium">
                  {error}
                </div>
              )}

              <GradientButton type="submit" className="w-full justify-center py-4 mt-2" disabled={loading}>
                {loading ? "Verifying..." : "Sign In to SplitEvada"}
              </GradientButton>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

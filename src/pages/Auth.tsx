import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, Lock, User } from "lucide-react";
import StarField from "../components/ui/StarField";
import GradientButton from "../components/ui/GradientButton";
import { useAppStore } from "../store/useAppStore";

export default function Auth() {
  const [params] = useSearchParams();
  const [isSignup, setIsSignup] = useState(params.get("mode") === "signup");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const login = useAppStore(s => s.login);
  const nav = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email) return setError("Email is required");
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    login(email, isSignup ? name || undefined : undefined);
    setLoading(false);
    nav("/app");
  }

  return (
    <div className="space-bg min-h-screen flex items-center justify-center px-6">
      <StarField count={60} />
      <div className="relative z-10 w-full max-w-sm">
        <button onClick={() => nav("/")} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8">
          <ArrowLeft size={18} /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 gradient-violet rounded-2xl flex items-center justify-center shadow-glow-violet">
              <span className="text-2xl">✂️</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">SplitEvada</h1>
              <p className="text-white/50 text-sm">{isSignup ? "Create your account" : "Welcome back"}</p>
            </div>
          </div>

          <div className="glass rounded-3xl p-6">
            <AnimatePresence mode="wait">
              <motion.form
                key={isSignup ? "signup" : "login"}
                initial={{ opacity: 0, x: isSignup ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {isSignup && (
                  <div>
                    <label className="text-white/70 text-sm font-medium block mb-2">Your Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        className="input-glass pl-11"
                        placeholder="Akshay"
                        value={name}
                        onChange={e => setName(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="email" className="input-glass pl-11"
                      placeholder="you@example.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-2">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="password" className="input-glass pl-11"
                      placeholder="••••••••"
                      value={pass} onChange={e => setPass(e.target.value)}
                    />
                  </div>
                </div>

                {error && <p className="text-pink-400 text-sm">{error}</p>}

                <GradientButton type="submit" className="w-full justify-center py-4 mt-2" disabled={loading}>
                  {loading ? "Loading..." : isSignup ? "Create Account" : "Sign In"}
                </GradientButton>
              </motion.form>
            </AnimatePresence>

            <div className="mt-5 text-center">
              <button onClick={() => setIsSignup(s => !s)} className="text-violet-400 text-sm hover:text-violet-300 transition-colors">
                {isSignup ? "Already have an account? Sign in" : "New here? Create account"}
              </button>
            </div>
          </div>

          
        </motion.div>
      </div>
    </div>
  );
}

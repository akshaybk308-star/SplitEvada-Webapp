import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Edit2, Check } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import BottomNav from "../components/ui/BottomNav";
import Avatar from "../components/ui/Avatar";
import StarField from "../components/ui/StarField";

export default function Profile() {
  const nav = useNavigate();
  const { user, logout, updateUserName, groups, expenses } = useAppStore();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? "");

  function saveName() {
    if (nameInput.trim()) updateUserName(nameInput.trim());
    setEditingName(false);
  }

  function handleLogout() {
    logout();
    nav("/");
  }

  return (
    <div className="space-bg min-h-screen">
      <StarField count={25} />
      <div className="page-shell px-4 pt-12 relative z-10">

        <h1 className="text-2xl font-black text-white mb-6">Profile</h1>

        {/* Avatar + name */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="glass rounded-3xl p-6 mb-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Avatar name={user?.name ?? "U"} size={80} />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 gradient-violet rounded-full flex items-center justify-center">
                <Edit2 size={12} className="text-white" />
              </div>
            </div>
          </div>
          {editingName ? (
            <div className="flex gap-2 items-center justify-center">
              <input className="input-glass text-center max-w-[180px]"
                value={nameInput} onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key==="Enter" && saveName()} autoFocus />
              <button onClick={saveName} className="w-9 h-9 gradient-violet rounded-xl flex items-center justify-center">
                <Check size={16} className="text-white" />
              </button>
            </div>
          ) : (
            <button onClick={() => setEditingName(true)} className="group">
              <h2 className="text-2xl font-black text-white group-hover:text-violet-300 transition-colors">{user?.name}</h2>
              <p className="text-white/50 text-sm mt-1">{user?.email}</p>
            </button>
          )}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Groups", value: groups.length, color: "text-violet-400" },
            { label: "Expenses", value: expenses.length, color: "text-cyan-400" },
            { label: "Currency", value: user?.currency ?? "INR", color: "text-lime-400" },
          ].map(({ label, value, color }) => (
            <motion.div key={label} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
              className="glass rounded-2xl p-4 text-center">
              <p className={`text-xl font-black ${color}`}>{value}</p>
              <p className="text-white/50 text-xs mt-1">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Settings */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="glass rounded-3xl mb-4 overflow-hidden">
          {[
            { label: "Demo Mode", value: "Ready for Supabase Auth", sub: true },
            { label: "App Version", value: "1.0.0" },
            { label: "Theme", value: "Dark Cosmos 🌌" },
          ].map((item, i) => (
            <div key={i} className={`flex items-center justify-between px-5 py-4 ${i > 0 ? "border-t border-white/10" : ""}`}>
              <span className="text-white/80 font-medium">{item.label}</span>
              <span className={`text-sm ${item.sub ? "text-violet-400" : "text-white/40"}`}>{item.value}</span>
            </div>
          ))}
        </motion.div>

        {/* Logout */}
        <motion.button
          whileTap={{ scale:0.97 }}
          onClick={handleLogout}
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.15 }}
          className="w-full glass rounded-2xl p-4 flex items-center justify-center gap-3 text-pink-400 hover:bg-pink-500/10 transition-all font-semibold"
        >
          <LogOut size={18} />
          Sign Out
        </motion.button>
      </div>
      <BottomNav />
    </div>
  );
}

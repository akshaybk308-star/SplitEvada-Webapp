import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Edit2, Check, UserPlus, Shield, X, Phone, UserCheck } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import BottomNav from "../components/ui/BottomNav";
import Avatar from "../components/ui/Avatar";
import StarField from "../components/ui/StarField";
import GradientButton from "../components/ui/GradientButton";

export default function Profile() {
  const nav = useNavigate();
  const { user, logout, updateUserName, groups, expenses, addAuthorizedMember, getAllAuthorizedMembers } = useAppStore();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? "");

  // Admin Spot Member Modal State
  const [showSpotModal, setShowSpotModal] = useState(false);
  const [spotMobile, setSpotMobile] = useState("");
  const [spotName, setSpotName] = useState("");
  const [spotFeedback, setSpotFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const isAdmin = user?.isAdmin || user?.mobile === "9961187118" || user?.name === "PEPPER";

  function saveName() {
    if (nameInput.trim()) updateUserName(nameInput.trim());
    setEditingName(false);
  }

  function handleLogout() {
    logout();
    nav("/");
  }

  function handleAddSpotMember() {
    setSpotFeedback(null);
    const res = addAuthorizedMember(spotMobile, spotName);
    if (res.success) {
      setSpotFeedback({ type: "success", msg: res.message || "Spot member added successfully!" });
      setSpotMobile("");
      setSpotName("");
    } else {
      setSpotFeedback({ type: "error", msg: res.message || "Failed to add spot member." });
    }
  }

  const allMembersList = getAllAuthorizedMembers();

  return (
    <div className="space-bg min-h-screen">
      <StarField count={25} />
      <div className="page-shell px-4 pt-12 pb-24 relative z-10">

        <h1 className="text-2xl font-black text-white mb-6">Profile</h1>

        {/* Avatar + name */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="glass rounded-3xl p-6 mb-4 text-center border border-white/10 relative overflow-hidden">
          {isAdmin && (
            <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] bg-violet-500/20 text-violet-300 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-violet-500/40">
              <Shield size={12} /> Admin
            </div>
          )}
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
              <h2 className="text-2xl font-black text-white group-hover:text-violet-300 transition-colors flex items-center justify-center gap-2">
                {user?.name}
              </h2>
              <p className="text-white/50 text-xs mt-1 font-mono">{user?.mobile || "Member"}</p>
            </button>
          )}
        </motion.div>

        {/* ADMIN SHORTCUT: Add Spot Member */}
        {isAdmin && (
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            className="gradient-violet rounded-3xl p-5 mb-4 shadow-glow-violet text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-white/80" />
                <h3 className="font-black text-base">Admin Controls</h3>
              </div>
              <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                {allMembersList.length} Total Members
              </span>
            </div>
            <p className="text-white/70 text-xs mb-4">
              Add new spot members on the fly. They can immediately sign in using their mobile number and capitalized name.
            </p>
            <GradientButton
              onClick={() => { setSpotFeedback(null); setShowSpotModal(true); }}
              variant="cyan"
              className="w-full justify-center py-3 text-sm font-bold"
              icon={<UserPlus size={16} />}
            >
              ➕ Add Spot Member
            </GradientButton>
          </motion.div>
        )}

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
            { label: "Access Status", value: isAdmin ? "Admin (PEPPER)" : "Authorized Member", sub: true },
            { label: "App Version", value: "1.0.0" },
            { label: "Theme", value: "Dark Cosmos 🌌" },
          ].map((item, i) => (
            <div key={i} className={`flex items-center justify-between px-5 py-4 ${i > 0 ? "border-t border-white/10" : ""}`}>
              <span className="text-white/80 font-medium text-sm">{item.label}</span>
              <span className={`text-xs font-semibold ${item.sub ? "text-violet-400" : "text-white/40"}`}>{item.value}</span>
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

      {/* ADMIN SPOT MEMBER MODAL */}
      <AnimatePresence>
        {showSpotModal && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center px-4 pb-6"
            onClick={e => { if (e.target === e.currentTarget) setShowSpotModal(false); }}
          >
            <motion.div
              initial={{ y:120 }} animate={{ y:0 }} exit={{ y:120 }}
              transition={{ type:"spring", damping:26, stiffness:300 }}
              className="glass rounded-3xl p-6 w-full max-w-sm border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <UserPlus size={20} className="text-cyan-400" />
                  <h2 className="font-black text-lg text-white">Add Spot Member</h2>
                </div>
                <button onClick={() => setShowSpotModal(false)} className="text-white/50 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <p className="text-white/40 text-xs mb-4">
                Register a new member so they can log in using their mobile number and capitalized name.
              </p>

              <div className="space-y-4 mb-5">
                <div>
                  <label className="text-white/70 text-xs font-semibold block mb-1.5">Mobile Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="tel"
                      className="input-glass pl-11 text-sm font-mono"
                      placeholder="e.g. 9876543210"
                      value={spotMobile}
                      onChange={e => setSpotMobile(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/70 text-xs font-semibold block mb-1">Member Name (Password)</label>
                  <p className="text-white/40 text-[10px] mb-1.5">Will automatically convert to CAPITAL LETTERS</p>
                  <div className="relative">
                    <UserCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      className="input-glass pl-11 text-sm uppercase font-bold"
                      placeholder="e.g. RAHUL"
                      value={spotName}
                      onChange={e => setSpotName(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {spotFeedback && (
                <div className={`p-3 rounded-2xl mb-4 text-xs font-semibold ${
                  spotFeedback.type === "success"
                    ? "bg-lime-500/20 text-lime-300 border border-lime-500/40"
                    : "bg-pink-500/20 text-pink-300 border border-pink-500/40"
                }`}>
                  {spotFeedback.msg}
                </div>
              )}

              <GradientButton
                onClick={handleAddSpotMember}
                variant="violet"
                className="w-full justify-center py-3.5 text-sm font-bold"
                disabled={!spotMobile.trim() || !spotName.trim()}
              >
                Save & Authorize Member
              </GradientButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

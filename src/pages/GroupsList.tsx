import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, X, QrCode, Sparkles, ArrowLeft, Check, Trash2, Calendar, IndianRupee, Clock, Upload, Image as ImageIcon } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import BottomNav from "../components/ui/BottomNav";
import GroupCard from "../components/group/GroupCard";
import GradientButton from "../components/ui/GradientButton";
import StarField from "../components/ui/StarField";
import Avatar from "../components/ui/Avatar";
import type { GroupMember } from "../types";

const EMOJIS = ["🏖️","🏠","🍕","✈️","🎉","🏕️","🎓","💼","🎮","🎵","🏋️","🚗","🍻","🎪","🌴","🎯"];

export default function GroupsList() {
  const nav = useNavigate();
  const { user, groups, groupExpenses, groupSettlements, addGroup, joinGroup } = useAppStore();
  const [search,      setSearch]      = useState("");
  const [showCreate,  setShowCreate]  = useState(false);
  const [showJoin,    setShowJoin]    = useState(false);
  const [inviteCode,  setInviteCode]  = useState("");
  const [joinError,   setJoinError]   = useState("");

  // Multi-step creation state (5 steps)
  const [step, setStep]               = useState<1 | 2 | 3 | 4 | 5>(1);
  const [gName, setGName]             = useState("");
  const [gEmoji, setGEmoji]           = useState("🏖️");
  const [spendingDate, setSpendingDate] = useState("");
  const [amountSpend, setAmountSpend] = useState("");
  const [membersList, setMembersList] = useState<string[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [finalDate, setFinalDate]     = useState("");
  const [qrCodeUrl, setQrCodeUrl]     = useState("");

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  function resetCreateForm() {
    setStep(1);
    setGName("");
    setGEmoji("🏖️");
    setSpendingDate("");
    setAmountSpend("");
    setMembersList([]);
    setNewMemberName("");
    setFinalDate("");
    setQrCodeUrl("");
  }

  function handleAddMember() {
    if (!newMemberName.trim()) return;
    if (membersList.includes(newMemberName.trim())) return;
    setMembersList(prev => [...prev, newMemberName.trim()]);
    setNewMemberName("");
  }

  function handleRemoveMember(nameToRemove: string) {
    setMembersList(prev => prev.filter(m => m !== nameToRemove));
  }

  function handleCreateFinal() {
    if (!gName.trim() || !user) return;
    
    const allGroupMembers: GroupMember[] = [
      { userId: user.id, name: user.name }
    ];

    membersList.forEach((memName, idx) => {
      allGroupMembers.push({
        userId: `m-custom-${Date.now()}-${idx}`,
        name: memName
      });
    });

    const parsedAmount = parseFloat(amountSpend) || undefined;

    addGroup({
      name: gName.trim(),
      emoji: gEmoji,
      currency: "INR",
      createdBy: user.id,
      members: allGroupMembers,
      spendingDate: spendingDate.trim() || undefined,
      targetAmount: parsedAmount,
      targetDate: finalDate.trim() || undefined,
      qrCodeUrl: qrCodeUrl.trim() || undefined,
    });

    resetCreateForm();
    setShowCreate(false);
  }

  function handleJoin() {
    setJoinError("");
    const g = joinGroup(inviteCode);
    if (!g) { setJoinError("Group not found. Check the invite code."); return; }
    setInviteCode(""); setShowJoin(false);
    nav(`/groups/${g.id}`);
  }

  return (
    <div className="space-bg min-h-screen">
      <StarField count={30} />
      <div className="page-shell px-4 pt-12 relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-white">Groups</h1>
          <button
            onClick={() => setShowJoin(true)}
            className="glass rounded-full px-3 py-1.5 text-xs text-white/70 hover:text-white glass-hover font-medium"
          >
            Join via Code
          </button>
        </div>

        {/* Search */}
        {groups.length > 0 && (
          <div className="relative mb-5">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              className="input-glass pl-11"
              placeholder="Search groups..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* EMPTY STATE */}
        {groups.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}
            className="flex flex-col items-center pt-8"
          >
            <div className="relative mb-8">
              <div className="w-32 h-32 gradient-violet rounded-full opacity-20 blur-2xl absolute inset-0 animate-glow-pulse" />
              <div className="w-32 h-32 glass rounded-full flex items-center justify-center relative z-10 shadow-glow-violet">
                <span className="text-5xl">👥</span>
              </div>
            </div>
            <h2 className="text-2xl font-black text-white text-center mb-2">No groups yet</h2>
            <p className="text-white/50 text-sm text-center mb-8 max-w-xs leading-relaxed">
              Create a group to start splitting expenses with friends, family, or colleagues.
            </p>

            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => { resetCreateForm(); setShowCreate(true); }}
              className="w-full gradient-violet rounded-3xl p-6 flex items-center gap-4 shadow-glow-violet mb-4"
            >
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Plus size={28} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-black text-white text-lg leading-tight">Create Spendings</p>
                <p className="font-black text-white text-lg leading-tight gradient-text-lime" style={{ WebkitTextFillColor: "unset", color: "rgba(163,230,53,0.9)" }}>& Split</p>
                <p className="text-white/60 text-xs mt-1">Add members · track expenses · settle up</p>
              </div>
              <Sparkles size={20} className="text-white/40 ml-auto flex-shrink-0" />
            </motion.button>

            <p className="text-white/30 text-xs">or join an existing group with an invite code</p>
          </motion.div>
        )}

        {/* GROUPS LIST */}
        {groups.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 mb-6">
              <AnimatePresence>
                {filtered.map((g, i) => (
                  <motion.div key={g.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.06 }}>
                    <GroupCard
                      group={g}
                      expenses={groupExpenses(g.id)}
                      settlements={groupSettlements(g.id)}
                      currentUserId={user?.id}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <div className="glass rounded-3xl p-10 text-center">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="text-white/60">No groups match your search</p>
                </div>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { resetCreateForm(); setShowCreate(true); }}
              className="w-full glass rounded-3xl p-4 flex items-center gap-4 glass-hover border border-dashed border-white/20"
            >
              <div className="w-12 h-12 gradient-violet rounded-2xl flex items-center justify-center shadow-glow-violet flex-shrink-0">
                <Plus size={22} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-sm">Create Spendings & Split</p>
                <p className="text-white/40 text-xs">Start a new group</p>
              </div>
              <Sparkles size={16} className="text-white/30 ml-auto" />
            </motion.button>
          </>
        )}
      </div>

      {/* Multi-Step Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center px-4 pb-6"
            onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}
          >
            <motion.div
              initial={{ y:120 }} animate={{ y:0 }} exit={{ y:120 }}
              transition={{ type:"spring", damping:26, stiffness:300 }}
              className="glass rounded-3xl p-6 w-full max-w-sm"
            >
              {/* Header & Step indicators */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {step > 1 && (
                    <button
                      onClick={() => setStep((s) => (s - 1) as any)}
                      className="text-white/50 hover:text-white p-1"
                    >
                      <ArrowLeft size={18} />
                    </button>
                  )}
                  <div>
                    <h2 className="font-black text-lg text-white">Create Group</h2>
                    <p className="text-white/40 text-xs">Step {step} of 5</p>
                  </div>
                </div>
                <button onClick={() => setShowCreate(false)} className="text-white/50 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/10 h-1.5 rounded-full mb-5 overflow-hidden">
                <motion.div
                  className="gradient-violet h-full"
                  initial={{ width: "20%" }}
                  animate={{ width: `${step * 20}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* STEP 1: Name & Emoji */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
                  <div className="mb-4">
                    <label className="text-white/60 text-sm mb-2 block font-medium">Pick an emoji</label>
                    <div className="flex flex-wrap gap-2">
                      {EMOJIS.map(e => (
                        <button
                          key={e}
                          onClick={() => setGEmoji(e)}
                          className={`text-xl w-10 h-10 rounded-xl transition-all ${
                            gEmoji === e ? "gradient-violet scale-110 shadow-glow-violet" : "glass hover:scale-105"
                          }`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="text-white/60 text-sm mb-2 block font-medium">Group Name</label>
                    <input
                      className="input-glass"
                      placeholder="e.g. Goa Trip, Flat Expenses…"
                      value={gName}
                      onChange={e => setGName(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && gName.trim() && setStep(2)}
                      autoFocus
                    />
                  </div>

                  <GradientButton
                    className="w-full justify-center py-3.5 text-base"
                    onClick={() => setStep(2)}
                    disabled={!gName.trim()}
                  >
                    Next: Date of Spending
                  </GradientButton>
                </motion.div>
              )}

              {/* STEP 2: Date of Spending */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
                  <div className="text-center py-2 mb-3">
                    <div className="w-12 h-12 gradient-violet rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-glow-violet">
                      <Clock size={22} className="text-white" />
                    </div>
                    <h3 className="font-bold text-white text-base">Date of Spending</h3>
                    <p className="text-white/40 text-xs">For past/older payments done on previous days</p>
                  </div>

                  <div className="mb-6">
                    <label className="text-white/60 text-sm mb-2 block font-medium">Spending Date</label>
                    <input
                      type="date"
                      className="input-glass text-sm"
                      value={spendingDate}
                      onChange={e => setSpendingDate(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSpendingDate(""); setStep(3); }}
                      className="px-4 py-3.5 rounded-full glass text-white/60 hover:text-white text-sm font-medium transition-colors"
                    >
                      Skip
                    </button>
                    <GradientButton
                      className="flex-1 justify-center py-3.5 text-base"
                      onClick={() => setStep(3)}
                    >
                      Next: Amount Spend
                    </GradientButton>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Amount Spend */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
                  <div className="text-center py-2 mb-4">
                    <div className="w-12 h-12 gradient-violet rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-glow-violet">
                      <IndianRupee size={22} className="text-white" />
                    </div>
                    <h3 className="font-bold text-white text-base">Expected / Target Amount</h3>
                    <p className="text-white/40 text-xs">Enter target total spend (Optional)</p>
                  </div>

                  <div className="mb-6">
                    <label className="text-white/60 text-sm mb-2 block font-medium">Amount Spend (₹)</label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        className="input-glass text-lg font-bold pl-10"
                        placeholder="0"
                        value={amountSpend}
                        onChange={e => setAmountSpend(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && setStep(4)}
                        autoFocus
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">₹</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => { setAmountSpend(""); setStep(4); }}
                      className="px-4 py-3.5 rounded-full glass text-white/60 hover:text-white text-sm font-medium transition-colors"
                    >
                      Skip
                    </button>
                    <GradientButton
                      className="flex-1 justify-center py-3.5 text-base"
                      onClick={() => setStep(4)}
                    >
                      Next: Add Members
                    </GradientButton>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Add Members Name */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
                  <div className="mb-4">
                    <label className="text-white/60 text-sm mb-1 block font-medium">Add Members Name</label>
                    <p className="text-white/40 text-xs mb-3">You ({user?.name || "You"}) are added automatically</p>

                    <div className="flex gap-2 mb-3">
                      <input
                        className="input-glass flex-1 text-sm py-2.5"
                        placeholder="Enter member's name…"
                        value={newMemberName}
                        onChange={e => setNewMemberName(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddMember(); } }}
                        autoFocus
                      />
                      <button
                        onClick={handleAddMember}
                        disabled={!newMemberName.trim()}
                        className="gradient-violet px-4 rounded-2xl flex items-center justify-center text-white disabled:opacity-40"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      <div className="flex items-center justify-between glass px-3 py-2 rounded-xl text-xs">
                        <div className="flex items-center gap-2">
                          <Avatar name={user?.name || "You"} size={22} />
                          <span className="text-white font-medium">{user?.name || "You"}</span>
                        </div>
                        <span className="text-violet-400 font-semibold text-[10px] bg-violet-500/20 px-2 py-0.5 rounded-full">Admin</span>
                      </div>

                      {membersList.map(name => (
                        <div key={name} className="flex items-center justify-between glass px-3 py-2 rounded-xl text-xs">
                          <div className="flex items-center gap-2">
                            <Avatar name={name} size={22} />
                            <span className="text-white font-medium">{name}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveMember(name)}
                            className="text-white/40 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <GradientButton
                    className="w-full justify-center py-3.5 text-base mt-2"
                    onClick={() => setStep(5)}
                  >
                    Next: Final Date
                  </GradientButton>
                </motion.div>
              )}

              {/* STEP 5: Final Date Of Completion */}
              {step === 5 && (
                <motion.div key="step5" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
                  <div className="text-center py-2 mb-3">
                    <div className="w-12 h-12 gradient-violet rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-glow-violet">
                      <Calendar size={22} className="text-white" />
                    </div>
                    <h3 className="font-bold text-white text-base">Final Date Of Completion</h3>
                    <p className="text-white/40 text-xs">Target date to finish & settle the group</p>
                  </div>

                  
                  {/* Payment QR Code Upload */}
                  <div className="mb-5">
                    <label className="text-white/60 text-sm mb-1.5 block font-medium flex items-center gap-1.5">
                      <QrCode size={16} className="text-violet-400" />
                      Payment QR Code (Optional)
                    </label>
                    <p className="text-white/40 text-xs mb-2">Upload UPI QR code image for members to scan & pay</p>
                    
                    {qrCodeUrl ? (
                      <div className="relative glass p-2 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={qrCodeUrl} alt="QR Code Preview" className="w-12 h-12 object-cover rounded-xl bg-white p-1" />
                          <span className="text-xs text-lime-400 font-semibold flex items-center gap-1">
                            <Check size={14} /> QR Image Attached
                          </span>
                        </div>
                        <button onClick={() => setQrCodeUrl("")} className="text-white/40 hover:text-red-400 p-2">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-white/15 hover:border-violet-500/50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors glass-hover">
                        <Upload size={22} className="text-violet-400 mb-1" />
                        <span className="text-xs text-white/70 font-medium">Click to upload QR image</span>
                        <span className="text-[10px] text-white/40">PNG, JPG, WEBP</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = ev => setQrCodeUrl(ev.target?.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="text-white/60 text-sm mb-2 block font-medium">Completion Date</label>
                    <input
                      type="date"
                      className="input-glass text-sm"
                      value={finalDate}
                      onChange={e => setFinalDate(e.target.value)}
                    />
                  </div>

                  {/* Summary preview */}
                  <div className="glass p-3 rounded-2xl mb-5 space-y-1.5 text-xs text-white/70">
                    <div className="flex justify-between">
                      <span>Group Name:</span>
                      <span className="font-bold text-white">{gEmoji} {gName}</span>
                    </div>
                    {spendingDate && (
                      <div className="flex justify-between">
                        <span>Spending Date:</span>
                        <span className="font-bold text-violet-400">{spendingDate}</span>
                      </div>
                    )}
                    {amountSpend && (
                      <div className="flex justify-between">
                        <span>Target Spend:</span>
                        <span className="font-bold text-lime-400">₹{parseFloat(amountSpend).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Total Members:</span>
                      <span className="font-bold text-white">{membersList.length + 1}</span>
                    </div>
                    {finalDate && (
                      <div className="flex justify-between">
                        <span>Target Date:</span>
                        <span className="font-bold text-cyan-400">{finalDate}</span>
                      </div>
                    )}
                  </div>

                  <GradientButton
                    className="w-full justify-center py-3.5 text-base"
                    onClick={handleCreateFinal}
                    icon={<Check size={16} />}
                  >
                    Finish & Create Group
                  </GradientButton>
                </motion.div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Modal */}
      <AnimatePresence>
        {showJoin && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center px-4 pb-6"
            onClick={e => { if (e.target === e.currentTarget) setShowJoin(false); }}
          >
            <motion.div
              initial={{ y:120 }} animate={{ y:0 }} exit={{ y:120 }}
              transition={{ type:"spring", damping:26, stiffness:300 }}
              className="glass rounded-3xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-xl text-white">Join a Group</h2>
                <button onClick={() => setShowJoin(false)} className="text-white/50 hover:text-white"><X size={20} /></button>
              </div>
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 gradient-cyan rounded-2xl flex items-center justify-center shadow-glow-cyan">
                  <QrCode size={32} className="text-white" />
                </div>
              </div>
              <label className="text-white/60 text-sm mb-2 block font-medium">Invite Code</label>
              <input
                className="input-glass text-center text-xl tracking-[0.35em] uppercase font-black mb-2"
                placeholder="ABC123"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                maxLength={8}
              />
              {joinError && <p className="text-pink-400 text-sm mb-3">{joinError}</p>}
              <GradientButton
                variant="cyan"
                className="w-full justify-center mt-4 py-4"
                onClick={handleJoin}
                disabled={!inviteCode.trim()}
              >
                Join Group
              </GradientButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

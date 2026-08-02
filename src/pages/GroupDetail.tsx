import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Share2, X, CheckCircle2, ChevronDown, ChevronUp, Calendar, Clock, Target, QrCode, Download } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { computeBalances, computeSettlements, formatCurrency } from "../lib/calculations";
import { exportCSV } from "../lib/csvExport";
import BottomNav from "../components/ui/BottomNav";
import Avatar from "../components/ui/Avatar";
import ExpenseCard from "../components/expense/ExpenseCard";
import GradientButton from "../components/ui/GradientButton";
import StarField from "../components/ui/StarField";

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { user, groups, groupExpenses, groupSettlements, deleteExpense, addSettlement } = useAppStore();
  const [showMembers, setShowMembers] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [settledId, setSettledId] = useState<string|null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const group = groups.find(g => g.id === id);

  if (!group) {
    return (
      <div className="space-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-white/60 mb-4">Group not found</p>
          <button onClick={() => nav("/groups")} className="text-violet-400">← Back to groups</button>
        </div>
      </div>
    );
  }

  const validGroup = group;
  const expenses   = groupExpenses(validGroup.id);
  const settlements = groupSettlements(validGroup.id);
  const balances   = computeBalances(expenses, settlements, validGroup.members);
  const suggestions = computeSettlements(balances, validGroup.members);
  const myBalance  = balances.find(b => b.userId === user?.id)?.net ?? 0;
  const totalSpent = expenses.reduce((s,e) => s + e.amount, 0);

  function handleSettle(idx: number) {
    const s = suggestions[idx];
    if (!s) return;
    setSettledId(String(idx));
    addSettlement({ groupId: validGroup.id, fromUserId: s.from.userId, toUserId: s.to.userId, amount: s.amount });
    setTimeout(() => setSettledId(null), 2000);
  }

  return (
    <div className="space-bg min-h-screen">
      <StarField count={25} />
      <div className="page-shell relative z-10">
        {/* Header */}
        <div className="px-4 pt-12 pb-4">
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => nav("/groups")} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div className="flex gap-2">
              {validGroup.qrCodeUrl && (
                <button onClick={() => setShowQrModal(true)} title="Payment QR Code" className="glass rounded-full p-2 text-violet-400 hover:text-violet-300 glass-hover">
                  <QrCode size={18} />
                </button>
              )}
              <button onClick={() => setShowInvite(true)} className="glass rounded-full p-2 text-white/60 hover:text-white glass-hover">
                <Share2 size={18} />
              </button>
              <button onClick={() => exportCSV(expenses, group, validGroup.members)} className="glass rounded-full px-3 py-1.5 text-xs text-white/70 glass-hover font-medium">
                CSV
              </button>
            </div>
          </div>

          {/* Group hero */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="glass rounded-3xl p-5 mb-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 gradient-violet rounded-2xl flex items-center justify-center text-3xl shadow-glow-violet">
                {validGroup.emoji}
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">{validGroup.name}</h1>
                <p className="text-white/50 text-sm">{validGroup.members.length} members · {validGroup?.currency || 'INR'}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {validGroup.spendingDate && (
                    <div className="flex items-center gap-1 text-[11px] bg-violet-500/20 text-violet-300 px-2.5 py-1 rounded-full border border-violet-500/30">
                      <Clock size={12} />
                      <span>Spent: {validGroup.spendingDate}</span>
                    </div>
                  )}
                  {validGroup.targetAmount && (
                    <div className="flex items-center gap-1 text-[11px] bg-lime-500/20 text-lime-300 px-2.5 py-1 rounded-full border border-lime-500/30">
                      <Target size={12} />
                      <span>Target: ₹{validGroup.targetAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {validGroup.targetDate && (
                    <div className="flex items-center gap-1 text-[11px] bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-500/30">
                      <Calendar size={12} />
                      <span>Due: {validGroup.targetDate}</span>
                    </div>
                  )}
                </div>

              </div>
            </div>
            
            {/* Payer Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="glass rounded-2xl p-3 text-center border border-violet-500/30 bg-violet-500/10">
                <p className="text-lg font-black text-violet-300">
                  {formatCurrency(expenses.filter(e => e.paidBy === user?.id).reduce((s,e) => s + e.amount, 0), validGroup.currency)}
                </p>
                <p className="text-[10px] text-violet-200/70 font-semibold uppercase tracking-wider">You Paid</p>
              </div>
              <div className="glass rounded-2xl p-3 text-center">
                <p className={`text-lg font-bold ${myBalance >= 0 ? "text-lime-400" : "text-pink-400"}`}>
                  {myBalance >= 0 ? "+" : ""}{formatCurrency(myBalance, validGroup.currency)}
                </p>
                <p className="text-[10px] text-white/50 uppercase tracking-wider">Owed to You</p>
              </div>
              <div className="glass rounded-2xl p-3 text-center">
                <p className="text-lg font-bold text-white">{formatCurrency(totalSpent, validGroup.currency)}</p>
                <p className="text-[10px] text-white/50 uppercase tracking-wider">Group Total</p>
              </div>
            </div>
          </motion.div>

          {/* Members */}
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="glass rounded-2xl mb-4 overflow-hidden">
            <button onClick={() => setShowMembers(s => !s)}
              className="w-full flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {validGroup.members.slice(0,4).map(m => <Avatar key={m.userId} name={m.name} size={28} />)}
                </div>
                <span className="text-white/70 text-sm font-medium">{validGroup.members.length} Members</span>
              </div>
              {showMembers ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
            </button>
            <AnimatePresence>
              {showMembers && (
                <motion.div initial={{ height:0 }} animate={{ height:"auto" }} exit={{ height:0 }}
                  className="overflow-hidden">
                  <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
                    {validGroup.members.map(m => {
                      const bal = balances.find(b => b.userId === m.userId)?.net ?? 0;
                      return (
                        <div key={m.userId} className="flex items-center justify-between glass p-2.5 rounded-xl border border-white/5">
                          <div className="flex items-center gap-3">
                            <Avatar name={m.name} size={36} />
                            <div>
                              <p className="text-white font-semibold text-sm flex items-center gap-1.5">
                                {m.name} {m.userId === user?.id && <span className="text-violet-400 text-xs font-normal">(You)</span>}
                              </p>
                              <div className="flex items-center gap-1 mt-0.5">
                                {bal >= -0.01 ? (
                                  <span className="text-[10px] bg-lime-500/20 text-lime-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                                    <CheckCircle2 size={10} /> Paid / Settled
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Clock size={10} /> Owes {formatCurrency(Math.abs(bal), validGroup.currency)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-black ${bal >= 0 ? "text-lime-400" : "text-pink-400"}`}>
                              {bal >= 0 ? "+" : ""}{formatCurrency(bal, validGroup.currency)}
                            </p>
                            <p className="text-[10px] text-white/40">net status</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Settlements */}
          {suggestions.length > 0 && (
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
              className="mb-4">
              <h2 className="font-bold text-white mb-3">Settle Up</h2>
              <div className="space-y-2">
                {suggestions.map((s, i) => (
                  <div key={i} className="glass rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar name={s.from.name} size={32} />
                      <span className="text-white/60 text-sm">→</span>
                      <Avatar name={s.to.name} size={32} />
                      <div className="ml-1">
                        <p className="text-xs text-white/60">{s.from.name} pays {s.to.name}</p>
                        <p className="font-bold text-lime-400">{formatCurrency(s.amount, validGroup.currency)}</p>
                      </div>
                    </div>
                    <button onClick={() => handleSettle(i)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${settledId === String(i) ? "bg-lime-500/30 text-lime-400" : "bg-violet-500/20 text-violet-400 hover:bg-violet-500/30"}`}>
                      {settledId === String(i) ? <><CheckCircle2 size={13} /> Done</> : "Settle"}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Expenses list */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white">Expenses</h2>
            <span className="text-white/40 text-sm">{expenses.length} total</span>
          </div>
        </div>

        <div className="px-4 space-y-3 pb-4">
          <AnimatePresence>
            {[...expenses].sort((a,b) => b.date.localeCompare(a.date)).map(exp => (
              <ExpenseCard key={exp.id} expense={exp} members={validGroup.members}
                currentUserId={user?.id} currency={validGroup.currency}
                onDelete={() => deleteExpense(exp.id)} />
            ))}
          </AnimatePresence>
          {expenses.length === 0 && (
            <div className="glass rounded-2xl p-10 text-center">
              <p className="text-4xl mb-3">💸</p>
              <p className="text-white/60">No expenses yet</p>
              <p className="text-white/40 text-sm mt-1">Tap + to add the first one</p>
            </div>
          )}
        </div>

        {/* FAB */}
        <div className="fixed bottom-24 right-6 z-40">
          <motion.button whileTap={{ scale:0.95 }} onClick={() => nav(`/groups/${id}/add`)}
            className="gradient-violet w-14 h-14 rounded-full flex items-center justify-center shadow-glow-violet">
            <Plus size={24} className="text-white" />
          </motion.button>
        </div>
      </div>

      {/* Invite modal */}
      <AnimatePresence>
        {showInvite && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center px-4 pb-6">
            <motion.div initial={{ y:80 }} animate={{ y:0 }} exit={{ y:80 }}
              transition={{ type:"spring", damping:25 }}
              className="glass rounded-3xl p-6 w-full max-w-sm text-center">
              <div className="flex justify-end mb-4">
                <button onClick={() => setShowInvite(false)} className="text-white/50 hover:text-white"><X size={20} /></button>
              </div>
              <p className="text-white/60 text-sm mb-3">Share this code to invite members</p>
              <div className="gradient-violet rounded-2xl p-4 mb-4 shadow-glow-violet">
                <p className="text-3xl font-black text-white tracking-[0.3em]">{validGroup.inviteCode}</p>
              </div>
              <button onClick={() => navigator.clipboard?.writeText(validGroup.inviteCode)}
                className="pill-btn pill-btn-glass w-full justify-center">
                Copy Invite Code
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      
      {/* QR Code Modal */}
      <AnimatePresence>
        {showQrModal && validGroup.qrCodeUrl && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center px-4"
            onClick={e => { if (e.target === e.currentTarget) setShowQrModal(false); }}>
            <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }}
              className="glass rounded-3xl p-6 w-full max-w-sm text-center relative border border-white/20">
              <button onClick={() => setShowQrModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X size={20} /></button>
              <div className="flex items-center justify-center gap-2 mb-2">
                <QrCode size={22} className="text-violet-400" />
                <h3 className="font-black text-lg text-white">Payment QR Code</h3>
              </div>
              <p className="text-white/50 text-xs mb-4">Scan or download to pay via UPI app</p>
              
              <div className="bg-white p-4 rounded-2xl mb-5 inline-block shadow-glow-violet">
                <img src={validGroup.qrCodeUrl} alt="Payment QR Code" className="w-56 h-56 object-contain rounded-lg" />
              </div>

              <a
                href={validGroup?.qrCodeUrl}
                download={`${validGroup?.name || "group"}_UPI_QR.png`}
                className="pill-btn pill-btn-violet w-full justify-center text-sm py-3"
              >
                <Download size={16} />
                Download QR Image
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  
      <BottomNav />
    </div>
  );
}

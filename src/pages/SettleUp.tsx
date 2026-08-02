import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { computeBalances, computeSettlements, formatCurrency } from "../lib/calculations";
import Avatar from "../components/ui/Avatar";
import StarField from "../components/ui/StarField";

export default function SettleUp() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { groups, groupExpenses, groupSettlements, addSettlement, user } = useAppStore();
  const [settled, setSettled] = useState<Set<number>>(new Set());

  const group = groups.find(g => g.id === id);
  if (!group) return null;

  const expenses = groupExpenses(group.id);
  const settlements = groupSettlements(group.id);
  const balances = computeBalances(expenses, settlements, group.members);
  const suggestions = computeSettlements(balances, group.members);

  function handleSettle(i: number) {
    if (settled.has(i)) return;
    const s = suggestions[i];
    addSettlement({ groupId: group!.id, fromUserId: s.from.userId, toUserId: s.to.userId, amount: s.amount });
    setSettled(prev => new Set([...prev, i]));
  }

  return (
    <div className="space-bg min-h-screen">
      <StarField count={20} />
      <div className="max-w-sm mx-auto px-4 pt-12 relative z-10">
        <button onClick={() => nav(`/groups/${id}`)} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6">
          <ArrowLeft size={18} /> Back to group
        </button>

        <h1 className="text-2xl font-black text-white mb-6">Settle Up</h1>

        {suggestions.length === 0 ? (
          <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
            className="glass rounded-3xl p-10 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-white mb-2">All settled!</h2>
            <p className="text-white/50">No outstanding balances in this group.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((s, i) => (
              <motion.div key={i} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.08 }}
                className="glass rounded-3xl p-5">
                <div className="flex items-center justify-center gap-5 mb-5">
                  <div className="flex flex-col items-center gap-1">
                    <Avatar name={s.from.name} size={48} />
                    <span className="text-xs text-white/60">{s.from.name}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-px bg-gradient-to-r from-violet-500 to-cyan-400 mb-1" />
                    <span className="text-xs text-white/40">pays</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Avatar name={s.to.name} size={48} />
                    <span className="text-xs text-white/60">{s.to.name}</span>
                  </div>
                </div>
                <div className="gradient-lime rounded-2xl p-4 mb-4 text-center shadow-glow-lime">
                  <p className="text-white/70 text-sm mb-1">Amount to pay</p>
                  <p className="text-3xl font-black text-white">{formatCurrency(s.amount, group.currency)}</p>
                </div>
                <button onClick={() => handleSettle(i)}
                  className={`w-full pill-btn justify-center transition-all ${settled.has(i) ? "pill-btn-glass text-lime-400" : "pill-btn-violet"}`}>
                  {settled.has(i)
                    ? <><CheckCircle2 size={18} /> Settled</>
                    : "Mark as Settled"}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

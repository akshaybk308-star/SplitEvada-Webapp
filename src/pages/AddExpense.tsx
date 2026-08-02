import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { CATEGORY_META, splitEqually } from "../lib/calculations";
import GradientButton from "../components/ui/GradientButton";
import Avatar from "../components/ui/Avatar";
import StarField from "../components/ui/StarField";
import type { ExpenseCategory, SplitType } from "../types";

const CATEGORIES = Object.keys(CATEGORY_META) as ExpenseCategory[];

export default function AddExpense() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { user, groups, addExpense } = useAppStore();
  const group = groups.find(g => g.id === id);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [paidBy, setPaidBy] = useState(user?.id ?? "");
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [customSplits, setCustomSplits] = useState<Record<string,string>>({});
  const [saving, setSaving] = useState(false);

  if (!group) return <div className="space-bg min-h-screen flex items-center justify-center text-white/60">Group not found</div>;

  const numAmount = parseFloat(amount) || 0;

  function getSplits() {
    if (splitType === "equal") return splitEqually(numAmount, group!.members.map(m => m.userId));
    if (splitType === "exact") {
      return group!.members.map(m => ({ userId: m.userId, amount: parseFloat(customSplits[m.userId] ?? "0") || 0 }));
    }
    // percentage
    return group!.members.map(m => {
      const pct = parseFloat(customSplits[m.userId] ?? "0") || 0;
      return { userId: m.userId, amount: Math.round(numAmount * pct) / 100 };
    });
  }

  async function handleSave() {
    if (!title.trim() || numAmount <= 0) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    addExpense({
      groupId: group!.id,
      paidBy,
      title: title.trim(),
      amount: numAmount,
      category,
      notes: notes.trim() || undefined,
      date,
      splits: getSplits(),
    });
    setSaving(false);
    nav(`/groups/${id}`);
  }

  const splitSumOk = splitType === "equal" || (() => {
    const splits = getSplits();
    const sum = splits.reduce((s,x) => s + x.amount, 0);
    return Math.abs(sum - numAmount) < 0.1;
  })();

  return (
    <div className="space-bg min-h-screen">
      <StarField count={20} />
      <div className="page-shell px-4 pt-12 pb-8 relative z-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-7">
          <button onClick={() => nav(`/groups/${id}`)} className="text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white">Add Expense</h1>
            <p className="text-white/50 text-sm">{group.emoji} {group.name}</p>
          </div>
        </div>

        {/* Amount input — big and prominent */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="glass rounded-3xl p-6 mb-4 text-center">
          <p className="text-white/50 text-sm mb-3">How much?</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-black text-white/60">₹</span>
            <input
              type="number" inputMode="decimal"
              className="bg-transparent border-none outline-none text-5xl font-black text-white text-center w-full max-w-[200px]"
              placeholder="0"
              value={amount} onChange={e => setAmount(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <input className="input-glass text-center text-lg font-semibold" placeholder="What was this for?"
              value={title} onChange={e => setTitle(e.target.value)} />
          </div>
        </motion.div>

        {/* Category */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
          className="glass rounded-2xl p-4 mb-4">
          <p className="text-white/60 text-sm font-medium mb-3">Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => {
              const m = CATEGORY_META[cat];
              return (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`category-chip ${category === cat ? "active" : ""}`}>
                  {m.emoji} {m.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Paid by */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
          className="glass rounded-2xl p-4 mb-4">
          <p className="text-white/60 text-sm font-medium mb-3">Paid by</p>
          <div className="flex gap-2 flex-wrap">
            {group.members.map(m => {
              const isSelected = paidBy === m.userId;
              const isMe = m.userId === user?.id;
              return (
                <button
                  key={m.userId}
                  type="button"
                  onClick={() => setPaidBy(m.userId)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-semibold transition-all ${
                    isSelected
                      ? "gradient-violet shadow-glow-violet text-white scale-105 border border-violet-400/40"
                      : "glass glass-hover text-white/70 hover:text-white"
                  }`}
                >
                  <Avatar name={m.name} size={22} />
                  <span>{m.name} {isMe ? "(You)" : ""}</span>
                  {isSelected && <Check size={14} className="text-white ml-0.5" />}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Split type */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.11 }}
          className="glass rounded-2xl p-4 mb-4">
          <p className="text-white/60 text-sm font-medium mb-3">Split</p>
          <div className="flex gap-2 mb-4">
            {(["equal","exact","percentage"] as SplitType[]).map(t => (
              <button key={t} onClick={() => setSplitType(t)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all capitalize ${splitType === t ? "gradient-violet text-white" : "glass text-white/60 glass-hover"}`}>
                {t}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {splitType === "equal" && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-2">
                {group.members.map(m => (
                  <div key={m.userId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar name={m.name} size={28} />
                      <span className="text-white/80 text-sm">{m.name}</span>
                    </div>
                    <span className="text-white/60 text-sm">
                      ₹{numAmount > 0 ? (numAmount / group.members.length).toFixed(0) : 0}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
            {splitType !== "equal" && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-3">
                {group.members.map(m => (
                  <div key={m.userId} className="flex items-center gap-3">
                    <Avatar name={m.name} size={28} />
                    <span className="text-white/80 text-sm flex-1">{m.name}</span>
                    <div className="relative w-24">
                      <input type="number" inputMode="decimal"
                        className="input-glass text-right pr-7 py-2 text-sm"
                        placeholder="0"
                        value={customSplits[m.userId] ?? ""}
                        onChange={e => setCustomSplits(s => ({ ...s, [m.userId]: e.target.value }))} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">
                        {splitType === "percentage" ? "%" : "₹"}
                      </span>
                    </div>
                  </div>
                ))}
                {!splitSumOk && numAmount > 0 && (
                  <p className="text-pink-400 text-xs">
                    {splitType === "percentage" ? "Percentages must add up to 100%" : "Amounts must add up to ₹" + numAmount.toFixed(0)}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Notes + Date */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.14 }}
          className="glass rounded-2xl p-4 mb-6 space-y-3">
          <input className="input-glass" placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
          <input type="date" className="input-glass" value={date} onChange={e => setDate(e.target.value)} />
        </motion.div>

        <GradientButton
          className="w-full justify-center text-lg py-4"
          onClick={handleSave}
          disabled={saving || !title.trim() || numAmount <= 0 || !splitSumOk}
          icon={<Check size={16} />}
        >
          {saving ? "Saving..." : "Save Expense"}
        </GradientButton>
      </div>
    </div>
  );
}

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { CATEGORY_META, formatCurrency } from "../lib/calculations";
import BottomNav from "../components/ui/BottomNav";
import WaveChart from "../components/charts/WaveChart";
import DonutChart from "../components/charts/DonutChart";
import StarField from "../components/ui/StarField";

const WAVE_DATA = [
  { month: "Mar", amount: 0, owed: 0 },
  { month: "Apr", amount: 0, owed: 0 },
  { month: "May", amount: 0, owed: 0 },
  { month: "Jun", amount: 0, owed: 0 },
  { month: "Jul", amount: 0, owed: 0 },
  { month: "Aug", amount: 0, owed: 0 },
];

const COLORS = ["#7c3aed","#14b8a6","#ec4899","#f59e0b","#84cc16","#06b6d4","#6366f1"];

export default function Analytics() {
  const { expenses, groups, user } = useAppStore();

  const categoryData = useMemo(() => {
    const map: Record<string,number> = {};
    expenses.forEach(e => { map[e.category] = (map[e.category] ?? 0) + e.amount; });
    return Object.entries(map).map(([k,v]) => ({
      name: CATEGORY_META[k]?.label ?? k,
      value: v,
    })).sort((a,b) => b.value - a.value);
  }, [expenses]);

  const totalSpent = expenses.reduce((s,e) => s + e.amount, 0);
  const avgPerGroup = groups.length > 0 ? totalSpent / groups.length : 0;

  const topExpenses = useMemo(() => [...expenses].sort((a,b) => b.amount - a.amount).slice(0,3), [expenses]);

  return (
    <div className="space-bg min-h-screen">
      <StarField count={30} />
      <div className="page-shell px-4 pt-12 relative z-10">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-white">Analytics</h1>
          <div className="glass rounded-full px-3 py-1.5 text-xs text-white/60 font-medium">All time</div>
        </div>

        {/* Hero stats */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="gradient-violet rounded-3xl p-5 mb-4 shadow-glow-violet relative overflow-hidden">
          <div className="absolute inset-0 opacity-15" style={{ background:"radial-gradient(circle at 80% 20%, rgba(255,255,255,0.35) 0%, transparent 60%)" }} />
          <div className="relative z-10 flex items-center justify-between mb-1">
            <p className="text-white/70 text-sm">Total Spending</p>
            <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1">
              <TrendingUp size={12} className="text-lime-300" />
              <span className="text-xs text-lime-300 font-semibold">0%</span>
            </div>
          </div>
          <p className="amount-display text-white mb-2 relative z-10">{formatCurrency(totalSpent)}</p>
          <p className="text-white/50 text-xs relative z-10 mb-4">Across {groups.length} groups · {expenses.length} expenses</p>
          <WaveChart data={WAVE_DATA} />
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="glass rounded-2xl p-4">
            <p className="text-white/50 text-xs mb-1">Avg per group</p>
            <p className="font-bold text-xl text-cyan-400">{formatCurrency(avgPerGroup)}</p>
          </motion.div>
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.12 }}
            className="glass rounded-2xl p-4">
            <p className="text-white/50 text-xs mb-1">Total groups</p>
            <p className="font-bold text-xl text-violet-400">{groups.length}</p>
          </motion.div>
        </div>

        {/* Category breakdown */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.14 }}
          className="glass rounded-3xl p-5 mb-4">
          <h2 className="font-bold text-white mb-4">By Category</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <DonutChart data={categoryData} />
            </div>
            <div className="space-y-2 flex-1">
              {categoryData.slice(0,5).map((d,i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-white/70 text-xs truncate flex-1">{d.name}</span>
                  <span className="text-white text-xs font-semibold">{formatCurrency(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Top expenses */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.17 }}
          className="glass rounded-3xl p-5">
          <h2 className="font-bold text-white mb-4">Biggest Expenses</h2>
          <div className="space-y-3">
            {topExpenses.map((e, i) => {
              const meta = CATEGORY_META[e.category] ?? CATEGORY_META.other;
              return (
                <div key={e.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 glass rounded-xl flex items-center justify-center text-sm flex-shrink-0">
                    {i===0?"🥇":i===1?"🥈":"🥉"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{e.title}</p>
                    <p className="text-white/40 text-xs">{meta.emoji} {meta.label}</p>
                  </div>
                  <p className="font-bold text-white">{formatCurrency(e.amount)}</p>
                </div>
              );
            })}
            {topExpenses.length === 0 && <p className="text-white/40 text-sm text-center py-4">No expenses yet</p>}
          </div>
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
}

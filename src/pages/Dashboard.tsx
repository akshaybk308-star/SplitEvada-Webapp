import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, TrendingUp, TrendingDown, Plus, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { computeBalances, formatCurrency } from "../lib/calculations";
import BottomNav from "../components/ui/BottomNav";
import Avatar from "../components/ui/Avatar";
import TeamBarChart from "../components/charts/TeamBarChart";
import ExpenseCard from "../components/expense/ExpenseCard";
import StarField from "../components/ui/StarField";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const WEEKDAYS = ["S","M","T","W","T","F","S"];

type ChartMode = "monthly" | "daily";

// ── Mini Calendar (daily mode) ────────────────────────────────────────────────
function MiniCalendar({
  date, onChange, expenseDates,
}: { date: Date; onChange: (d: Date) => void; expenseDates: Set<string> }) {
  const year  = date.getFullYear();
  const month = date.getMonth();
  const today = new Date();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow    = new Date(year, month, 1).getDay();

  return (
    <div className="mt-3">
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-center text-[10px] text-white/30 font-medium py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstDow }, (_, i) => <div key={"b"+i} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day   = i + 1;
          const key   = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const isSel = day === date.getDate();
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const hasExp = expenseDates.has(key);
          return (
            <button
              key={day}
              onClick={() => onChange(new Date(year, month, day))}
              className={`relative mx-auto w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-all ${
                isSel ? "gradient-violet text-white shadow-glow-violet scale-110" :
                isToday ? "border border-violet-500/50 text-violet-300" :
                "text-white/70 hover:bg-white/10"
              }`}
            >
              {day}
              {hasExp && !isSel && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const nav = useNavigate();
  const { user, groups, expenses, groupExpenses, groupSettlements } = useAppStore();

  const [mode, setMode]       = useState<ChartMode>("monthly");
  const [selDate, setSelDate] = useState(() => new Date());
  const [calOpen, setCalOpen] = useState(false);

  // ── Balance calcs ──────────────────────────────────────────────────────────
  const allBalances = groups.flatMap(g =>
    computeBalances(groupExpenses(g.id), groupSettlements(g.id), g.members)
  );
  const myTotalOwed   = allBalances.filter(b => b.userId === user?.id && b.net < 0).reduce((s,b) => s + Math.abs(b.net), 0);
  const myTotalOwedMe = allBalances.filter(b => b.userId === user?.id && b.net > 0).reduce((s,b) => s + b.net, 0);

  // ── Chart data ─────────────────────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(selDate.getFullYear(), selDate.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      const amount = expenses
        .filter(e => e.date.startsWith(key))
        .reduce((s,e) => s + e.amount, 0);
      const isSel = key === `${selDate.getFullYear()}-${String(selDate.getMonth()+1).padStart(2,"0")}`;
      return { label: MONTHS_SHORT[d.getMonth()], amount, isSelected: isSel };
    });
  }, [expenses, selDate]);

  const dailyData = useMemo(() => {
    const y = selDate.getFullYear(), m = selDate.getMonth();
    const days = new Date(y, m + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const day = i + 1;
      const key = `${y}-${String(m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
      const amount = expenses.filter(e => e.date === key).reduce((s,e) => s + e.amount, 0);
      return { label: String(day), amount, isSelected: day === selDate.getDate() };
    });
  }, [expenses, selDate]);

  const chartData  = mode === "monthly" ? monthlyData : dailyData;
  const totalShown = chartData.reduce((s,d) => s + d.amount, 0);

  // Expense dates set for calendar dots
  const expenseDates = useMemo(() => new Set(expenses.map(e => e.date)), [expenses]);

  // ── Month nav ──────────────────────────────────────────────────────────────
  function shiftMonth(delta: number) {
    setSelDate(d => {
      const nd = new Date(d);
      nd.setMonth(nd.getMonth() + delta);
      return nd;
    });
  }
  function shiftDay(delta: number) {
    setSelDate(d => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() + delta);
      return nd;
    });
  }

  const recentExpenses = [...expenses].sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0,5);
  const getMembers  = (gid: string) => groups.find(g => g.id === gid)?.members ?? [];
  const getCurrency = (gid: string) => groups.find(g => g.id === gid)?.currency ?? "INR";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const headerLabel = mode === "monthly"
    ? `${MONTHS_SHORT[selDate.getMonth()]} ${selDate.getFullYear()}`
    : `${selDate.getDate()} ${MONTHS_SHORT[selDate.getMonth()]} ${selDate.getFullYear()}`;

  return (
    <div className="space-bg min-h-screen">
      <StarField count={40} />
      <div className="page-shell px-4 pt-12 relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/50 text-sm">{greeting} 👋</p>
            <h1 className="text-2xl font-black text-white">{user?.name ?? "there"}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 glass rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
            </button>
            <Avatar name={user?.name ?? "U"} size={40} />
          </div>
        </div>

        {/* ── Team Spending Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-3xl p-5 mb-4 border border-white/10"
          style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(20,184,166,0.08) 100%)" }}
        >
          {/* Title + Mode toggle */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-0.5">Team Spending</p>
              <p className="amount-display gradient-text-violet" style={{ fontSize: "1.8rem" }}>
                {formatCurrency(totalShown)}
              </p>
            </div>
            <div className="glass rounded-2xl p-1 flex gap-1">
              {(["monthly","daily"] as ChartMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${
                    mode === m ? "gradient-violet text-white shadow-glow-violet" : "text-white/50 hover:text-white"
                  }`}
                >
                  {m === "monthly" ? "Monthly" : "Daily"}
                </button>
              ))}
            </div>
          </div>

          {/* Date navigator */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => mode === "monthly" ? shiftMonth(-1) : shiftDay(-1)}
              className="w-8 h-8 glass rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={() => setCalOpen(o => !o)}
              className="flex items-center gap-2 glass rounded-xl px-3 py-1.5 text-white/80 text-sm font-semibold hover:text-white transition-colors"
            >
              <Calendar size={13} className="text-violet-400" />
              {headerLabel}
            </button>

            <button
              onClick={() => mode === "monthly" ? shiftMonth(1) : shiftDay(1)}
              className="w-8 h-8 glass rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Inline calendar (daily mode) */}
          <AnimatePresence>
            {calOpen && mode === "daily" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="glass rounded-2xl p-3 mb-3 border border-white/10">
                  <MiniCalendar
                    date={selDate}
                    onChange={d => { setSelDate(d); setCalOpen(false); }}
                    expenseDates={expenseDates}
                  />
                </div>
              </motion.div>
            )}
            {calOpen && mode === "monthly" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="glass rounded-2xl p-3 mb-3 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <button onClick={() => setSelDate(d => new Date(d.getFullYear()-1, d.getMonth(), 1))}
                      className="text-white/50 hover:text-white"><ChevronLeft size={16}/></button>
                    <span className="text-white font-bold text-sm">{selDate.getFullYear()}</span>
                    <button onClick={() => setSelDate(d => new Date(d.getFullYear()+1, d.getMonth(), 1))}
                      className="text-white/50 hover:text-white"><ChevronRight size={16}/></button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {MONTHS_SHORT.map((mn, mi) => {
                      const isSel = mi === selDate.getMonth();
                      const key   = `${selDate.getFullYear()}-${String(mi+1).padStart(2,"0")}`;
                      const hasEx = expenses.some(e => e.date.startsWith(key));
                      return (
                        <button key={mn} onClick={() => { setSelDate(d => new Date(d.getFullYear(), mi, 1)); setCalOpen(false); }}
                          className={`py-2 rounded-xl text-xs font-semibold transition-all relative ${isSel ? "gradient-violet text-white" : "glass text-white/60 hover:text-white"}`}>
                          {mn}
                          {hasEx && !isSel && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bar Chart */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode + selDate.getMonth() + selDate.getFullYear()}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TeamBarChart data={chartData} mode={mode} />
            </motion.div>
          </AnimatePresence>

          {totalShown === 0 && (
            <p className="text-white/30 text-xs text-center mt-2">No team expenses for this period</p>
          )}
        </motion.div>

        {/* Owe / Owed cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-pink-500/20 rounded-lg flex items-center justify-center">
                <TrendingDown size={14} className="text-pink-400" />
              </div>
              <span className="text-white/60 text-xs">You owe</span>
            </div>
            <p className="font-bold text-xl text-pink-400">{formatCurrency(myTotalOwed)}</p>
          </motion.div>
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
            className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-lime-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp size={14} className="text-lime-400" />
              </div>
              <span className="text-white/60 text-xs">Owed to you</span>
            </div>
            <p className="font-bold text-xl text-lime-400">{formatCurrency(myTotalOwedMe)}</p>
          </motion.div>
        </div>

        {/* Groups quick access */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white">My Groups</h2>
            <button onClick={() => nav("/groups")} className="text-violet-400 text-sm hover:text-violet-300 transition-colors">See all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {groups.map(g => (
              <button key={g.id} onClick={() => nav(`/groups/${g.id}`)}
                className="flex-shrink-0 glass rounded-2xl p-3 flex flex-col items-center gap-1.5 w-20 glass-hover">
                <span className="text-2xl">{g.emoji}</span>
                <span className="text-xs text-white/70 text-center leading-tight truncate w-full">{g.name}</span>
              </button>
            ))}
            <button onClick={() => nav("/groups")}
              className="flex-shrink-0 glass rounded-2xl p-3 flex flex-col items-center gap-1.5 w-20">
              <div className="w-8 h-8 gradient-violet rounded-xl flex items-center justify-center">
                <Plus size={16} className="text-white" />
              </div>
              <span className="text-xs text-white/50">New</span>
            </button>
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white">Recent Activity</h2>
            <button onClick={() => nav("/groups")} className="text-violet-400 text-sm hover:text-violet-300 transition-colors">View all</button>
          </div>
          <div className="space-y-3">
            {recentExpenses.length === 0 && (
              <div className="glass rounded-2xl p-6 text-center text-white/40">No expenses yet. Add your first one!</div>
            )}
            {recentExpenses.map(exp => (
              <ExpenseCard key={exp.id} expense={exp} members={getMembers(exp.groupId)}
                currentUserId={user?.id} currency={getCurrency(exp.groupId)} />
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

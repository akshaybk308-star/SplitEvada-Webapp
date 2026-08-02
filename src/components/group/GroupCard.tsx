import { motion } from "framer-motion";
import { ChevronRight, Clock, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatCurrency, computeBalances } from "../../lib/calculations";
import Avatar from "../ui/Avatar";
import type { Expense, Group, Settlement } from "../../types";

interface Props { group: Group; expenses: Expense[]; settlements: Settlement[]; currentUserId?: string }

const GRADIENTS = ["gradient-violet","gradient-cyan","gradient-lime","gradient-pink"];

export default function GroupCard({ group, expenses, settlements, currentUserId }: Props) {
  const nav = useNavigate();
  const balances = computeBalances(expenses, settlements, group.members);

  // Pending = total absolute debt across all members
  const pendingAmount = balances
    .filter(b => b.net < -0.01)
    .reduce((s, b) => s + Math.abs(b.net), 0);

  // "Paid" = member whose net balance >= 0 (doesn't owe anything)
  const membersPaid  = balances.filter(b => b.net >= -0.01).length;
  const totalMembers = group.members.length;
  const allPaid      = membersPaid === totalMembers;

  const myBalance = balances.find(b => b.userId === currentUserId)?.net ?? 0;
  const grad = GRADIENTS[group.id.charCodeAt(1 % group.id.length) % GRADIENTS.length];

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => nav(`/groups/${group.id}`)}
      className="glass rounded-3xl p-5 cursor-pointer glass-hover"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-14 h-14 ${grad} rounded-2xl flex items-center justify-center text-2xl shadow-glass flex-shrink-0`}>
          {group.emoji}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {/* X/Y paid badge */}
          <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            allPaid
              ? "bg-lime-500/20 text-lime-400"
              : "bg-amber-500/15 text-amber-400"
          }`}>
            {allPaid
              ? <CheckCircle2 size={12} />
              : <Clock size={12} />}
            <span>{membersPaid}/{totalMembers} paid</span>
          </div>
          <ChevronRight size={16} className="text-white/30" />
        </div>
      </div>

      {/* Group name */}
      <h3 className="font-bold text-lg text-white mb-0.5">{group.name}</h3>

      {/* Member avatars row */}
      <div className="flex items-center gap-1 mb-4">
        {group.members.slice(0, 5).map(m => (
          <Avatar key={m.userId} name={m.name} size={22} />
        ))}
        {group.members.length > 5 && (
          <div className="w-6 h-6 rounded-full glass flex items-center justify-center text-[10px] text-white/60 font-bold">
            +{group.members.length - 5}
          </div>
        )}
      </div>

      {/* Bottom stats */}
      <div className="flex items-center justify-between border-t border-white/8 pt-3">
        {/* Pending */}
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-wide mb-0.5">Pending</p>
          <p className={`font-bold text-sm ${pendingAmount > 0 ? "text-pink-400" : "text-white/30"}`}>
            {pendingAmount > 0 ? formatCurrency(pendingAmount, group.currency) : "—"}
          </p>
        </div>
        {/* My balance */}
        <div className="text-right">
          <p className="text-[10px] text-white/40 uppercase tracking-wide mb-0.5">Your balance</p>
          <p className={`font-bold text-sm ${myBalance >= 0 ? "text-lime-400" : "text-pink-400"}`}>
            {myBalance >= 0 ? "+" : ""}{formatCurrency(myBalance, group.currency)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

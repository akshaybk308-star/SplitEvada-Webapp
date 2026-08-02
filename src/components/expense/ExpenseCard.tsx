import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import Avatar from "../ui/Avatar";
import { CATEGORY_META, formatCurrency } from "../../lib/calculations";
import type { Expense, GroupMember, Currency } from "../../types";

interface Props {
  expense: Expense; members: GroupMember[];
  currentUserId?: string; currency?: Currency;
  onDelete?: () => void;
}

export default function ExpenseCard({ expense, members, currentUserId, currency = "INR", onDelete }: Props) {
  const paidBy = members.find(m => m.userId === expense.paidBy);
  const myShare = expense.splits.find(s => s.userId === currentUserId)?.amount ?? 0;
  const iOwe = expense.paidBy !== currentUserId && myShare > 0;
  const iSpent = expense.paidBy === currentUserId;
  const meta = CATEGORY_META[expense.category] ?? CATEGORY_META.other;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      className="flex items-center gap-3 p-4 glass rounded-2xl glass-hover"
    >
      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-xl flex-shrink-0`}>
        {meta.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">{expense.title}</p>
        <p className="text-xs text-white/50 mt-0.5">
          {paidBy?.name ?? "Unknown"} · {expense.date}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-white">{formatCurrency(expense.amount, currency)}</p>
        {iOwe && <p className="text-xs text-pink-400 mt-0.5">you owe {formatCurrency(myShare, currency)}</p>}
        {iSpent && <p className="text-xs text-lime-400 mt-0.5">you paid</p>}
      </div>
      {onDelete && (
        <button onClick={onDelete} className="ml-1 p-1.5 text-white/30 hover:text-red-400 transition-colors flex-shrink-0">
          <Trash2 size={15} />
        </button>
      )}
    </motion.div>
  );
}

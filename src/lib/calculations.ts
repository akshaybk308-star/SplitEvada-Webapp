import type { Balance, Expense, GroupMember, Settlement, SettlementSuggestion } from "../types";

export function computeBalances(expenses: Expense[], settlements: Settlement[], members: GroupMember[]): Balance[] {
  const netMap = new Map<string, number>();
  members.forEach(m => netMap.set(m.userId, 0));
  for (const exp of expenses) {
    netMap.set(exp.paidBy, (netMap.get(exp.paidBy) ?? 0) + exp.amount);
    for (const s of exp.splits) netMap.set(s.userId, (netMap.get(s.userId) ?? 0) - s.amount);
  }
  for (const s of settlements) {
    netMap.set(s.fromUserId, (netMap.get(s.fromUserId) ?? 0) + s.amount);
    netMap.set(s.toUserId,   (netMap.get(s.toUserId)   ?? 0) - s.amount);
  }
  return members.map(m => ({
    userId: m.userId, name: m.name,
    net: Math.round((netMap.get(m.userId) ?? 0) * 100) / 100,
  }));
}

export function computeSettlements(balances: Balance[], members: GroupMember[]): SettlementSuggestion[] {
  const cred = balances.filter(b => b.net >  0.01).sort((a,b) => b.net - a.net).map(b => ({ ...b, rem: b.net }));
  const debt = balances.filter(b => b.net < -0.01).sort((a,b) => a.net - b.net).map(b => ({ ...b, rem: -b.net }));
  const out: SettlementSuggestion[] = [];
  let i = 0, j = 0;
  while (i < cred.length && j < debt.length) {
    const amt = Math.min(cred[i].rem, debt[j].rem);
    if (amt > 0.01) {
      const from = members.find(m => m.userId === debt[j].userId)!;
      const to   = members.find(m => m.userId === cred[i].userId)!;
      out.push({ from, to, amount: Math.round(amt * 100) / 100 });
    }
    cred[i].rem -= amt; debt[j].rem -= amt;
    if (cred[i].rem < 0.01) i++;
    if (debt[j].rem < 0.01) j++;
  }
  return out;
}

export function formatCurrency(amount: number, currency = "INR"): string {
  const sym: Record<string,string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
  const s = sym[currency] ?? "₹";
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return amount < 0 ? `-${s}${formatted}` : `${s}${formatted}`;
}

export function splitEqually(amount: number, memberIds: string[]): { userId: string; amount: number }[] {
  if (!memberIds.length) return [];
  const each = Math.floor((amount / memberIds.length) * 100) / 100;
  const splits = memberIds.map(id => ({ userId: id, amount: each }));
  const diff = Math.round((amount - each * memberIds.length) * 100) / 100;
  if (diff) splits[0].amount = Math.round((splits[0].amount + diff) * 100) / 100;
  return splits;
}

export const CATEGORY_META: Record<string, { label: string; emoji: string; color: string }> = {
  food:          { label: "Food",          emoji: "🍔", color: "from-orange-500 to-amber-400" },
  travel:        { label: "Travel",        emoji: "✈️",  color: "from-blue-500 to-cyan-400" },
  rent:          { label: "Rent",          emoji: "🏠",  color: "from-violet-500 to-purple-400" },
  entertainment: { label: "Fun",           emoji: "🎉",  color: "from-pink-500 to-rose-400" },
  utilities:     { label: "Utilities",     emoji: "⚡",  color: "from-yellow-500 to-amber-400" },
  shopping:      { label: "Shopping",      emoji: "🛍️",  color: "from-teal-500 to-cyan-400" },
  other:         { label: "Other",         emoji: "💡",  color: "from-slate-500 to-gray-400" },
};

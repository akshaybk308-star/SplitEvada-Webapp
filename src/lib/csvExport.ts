import type { Expense, Group, GroupMember } from "../types";
import { formatCurrency } from "./calculations";

export function exportCSV(expenses: Expense[], group: Group, members: GroupMember[]) {
  const mMap = new Map(members.map(m => [m.userId, m.name]));
  const rows = expenses.map(e => [
    e.date, `"${e.title}"`, e.category,
    formatCurrency(e.amount, group.currency),
    mMap.get(e.paidBy) ?? e.paidBy,
    `"${e.notes ?? ""}"`,
  ].join(","));
  const csv = ["Date,Title,Category,Amount,Paid By,Notes", ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `${group.name}_expenses.csv` });
  a.click();
  URL.revokeObjectURL(a.href);
}

export type ExpenseCategory = "food" | "travel" | "rent" | "entertainment" | "utilities" | "shopping" | "other";
export type SplitType = "equal" | "exact" | "percentage";
export type Currency = "INR" | "USD" | "EUR" | "GBP";

export interface AppUser {
  id: string; name: string; email: string; avatar?: string; currency: Currency;
}
export interface GroupMember {
  userId: string; name: string; avatar?: string;
}
export interface Group {
  id: string; name: string; emoji: string;
  members: GroupMember[]; currency: Currency;
  spendingDate?: string;
  qrCodeUrl?: string;
  targetAmount?: number;
  targetDate?: string;
  inviteCode: string; createdBy: string; createdAt: string;
}
export interface ExpenseSplit { userId: string; amount: number; }
export interface Expense {
  id: string; groupId: string; paidBy: string;
  title: string; amount: number; category: ExpenseCategory;
  notes?: string; date: string; splits: ExpenseSplit[]; createdAt: string;
}
export interface Settlement {
  id: string; groupId: string; fromUserId: string;
  toUserId: string; amount: number; settledAt: string;
}
export interface Balance { userId: string; name: string; net: number; }
export interface SettlementSuggestion { from: GroupMember; to: GroupMember; amount: number; }

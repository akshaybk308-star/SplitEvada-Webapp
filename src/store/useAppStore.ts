import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppUser, Expense, Group, GroupMember, Settlement } from "../types";

function uid() { return Math.random().toString(36).slice(2, 10); }


function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function monthsAgo(n: number, day = 1) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(day);
  return d.toISOString().slice(0, 10);
}

const DEMO_USER: AppUser = { id: "u1", name: "You", email: "demo@splitevada.app", currency: "INR" };

const DEMO_GROUPS: Group[] = [
  {
    id: "g1", name: "Goa Trip", emoji: "🏖️", currency: "INR",
    inviteCode: "GOA2024", createdBy: "u1", createdAt: "2024-08-01T00:00:00Z",
    members: [{ userId: "u1", name: "You" }, { userId: "u2", name: "Priya" }, { userId: "u3", name: "Rahul" }],
  },
  {
    id: "g2", name: "Flat Expenses", emoji: "🏠", currency: "INR",
    inviteCode: "FLAT23", createdBy: "u1", createdAt: "2024-07-01T00:00:00Z",
    members: [{ userId: "u1", name: "You" }, { userId: "u4", name: "Arjun" }],
  },
  {
    id: "g3", name: "Office Lunch", emoji: "🍱", currency: "INR",
    inviteCode: "LUNCH1", createdBy: "u1", createdAt: "2024-07-15T00:00:00Z",
    members: [{ userId: "u1", name: "You" }, { userId: "u5", name: "Sneha" }, { userId: "u6", name: "Dev" }],
  },
];

const DEMO_EXPENSES: Expense[] = [
  { id: "e1", groupId: "g1", paidBy: "u1", title: "Hotel booking", amount: 12000, category: "travel", date: monthsAgo(1, 1), splits: [{ userId:"u1", amount:4000 },{ userId:"u2", amount:4000 },{ userId:"u3", amount:4000 }], createdAt: new Date(new Date().setDate(new Date().getDate()-30)).toISOString() },
  { id: "e2", groupId: "g1", paidBy: "u2", title: "Beach dinner", amount: 3600, category: "food", date: monthsAgo(1, 3), splits: [{ userId:"u1", amount:1200 },{ userId:"u2", amount:1200 },{ userId:"u3", amount:1200 }], createdAt: new Date(new Date().setDate(new Date().getDate()-28)).toISOString() },
  { id: "e3", groupId: "g1", paidBy: "u3", title: "Scuba diving", amount: 6000, category: "entertainment", date: monthsAgo(1, 5), splits: [{ userId:"u1", amount:2000 },{ userId:"u2", amount:2000 },{ userId:"u3", amount:2000 }], createdAt: new Date(new Date().setDate(new Date().getDate()-26)).toISOString() },
  { id: "e4", groupId: "g1", paidBy: "u1", title: "Cab to airport", amount: 1500, category: "travel", date: monthsAgo(1, 7), splits: [{ userId:"u1", amount:500 },{ userId:"u2", amount:500 },{ userId:"u3", amount:500 }], createdAt: new Date(new Date().setDate(new Date().getDate()-24)).toISOString() },
  { id: "e5", groupId: "g2", paidBy: "u1", title: "Electricity bill", amount: 2800, category: "utilities", date: daysAgo(5), splits: [{ userId:"u1", amount:1400 },{ userId:"u4", amount:1400 }], createdAt: new Date(new Date().setDate(new Date().getDate()-5)).toISOString() },
  { id: "e6", groupId: "g2", paidBy: "u4", title: "Internet bill", amount: 1200, category: "utilities", date: daysAgo(10), splits: [{ userId:"u1", amount:600 },{ userId:"u4", amount:600 }], createdAt: new Date(new Date().setDate(new Date().getDate()-10)).toISOString() },
  { id: "e7", groupId: "g3", paidBy: "u5", title: "Pizza Friday", amount: 2400, category: "food", date: daysAgo(14), splits: [{ userId:"u1", amount:800 },{ userId:"u5", amount:800 },{ userId:"u6", amount:800 }], createdAt: new Date(new Date().setDate(new Date().getDate()-14)).toISOString() },
  { id: "e8", groupId: "g3", paidBy: "u1", title: "Team coffee", amount: 900, category: "food", date: daysAgo(2), splits: [{ userId:"u1", amount:300 },{ userId:"u5", amount:300 },{ userId:"u6", amount:300 }], createdAt: new Date(new Date().setDate(new Date().getDate()-2)).toISOString() },
  { id: "e9", groupId: "g1", paidBy: "u2", title: "Sunglasses", amount: 3200, category: "shopping", date: monthsAgo(2, 12), splits: [{ userId:"u1", amount:1600 },{ userId:"u2", amount:800 },{ userId:"u3", amount:800 }], createdAt: new Date(new Date().setDate(new Date().getDate()-60)).toISOString() },
  { id: "e10", groupId: "g2", paidBy: "u4", title: "Grocery run", amount: 4500, category: "food", date: monthsAgo(3, 8), splits: [{ userId:"u1", amount:2250 },{ userId:"u4", amount:2250 }], createdAt: new Date(new Date().setDate(new Date().getDate()-90)).toISOString() },
];

interface AppState {
  user: AppUser | null; isAuth: boolean;
  groups: Group[]; expenses: Expense[]; settlements: Settlement[];
  login: (email: string, name?: string) => void;
  logout: () => void;
  addGroup: (g: Omit<Group, "id"|"createdAt"|"inviteCode">) => void;
  joinGroup: (code: string) => Group | null;
  addExpense: (e: Omit<Expense, "id"|"createdAt">) => void;
  deleteExpense: (id: string) => void;
  addSettlement: (s: Omit<Settlement, "id"|"settledAt">) => void;
  groupExpenses: (gid: string) => Expense[];
  groupSettlements: (gid: string) => Settlement[];
  updateUserName: (name: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null, isAuth: false,
      groups: [], expenses: [], settlements: [],
      login: (email, name) => set({
        user: { id: `u-${uid()}`, name: name ?? email.split("@")[0], email, currency: "INR" },
        isAuth: true,
      }),
      logout: () => set({ user: null, isAuth: false }),
      addGroup: (g) => set(s => ({
        groups: [...s.groups, { ...g, id: `g-${uid()}`, inviteCode: uid().toUpperCase().slice(0,6), createdAt: new Date().toISOString() }],
      })),
      joinGroup: (code) => {
        const group = get().groups.find(g => g.inviteCode === code.toUpperCase());
        if (!group) return null;
        const user = get().user;
        if (!user || group.members.some(m => m.userId === user.id)) return group;
        set(s => ({
          groups: s.groups.map(g => g.id === group.id
            ? { ...g, members: [...g.members, { userId: user.id, name: user.name }] }
            : g),
        }));
        return group;
      },
      addExpense: (e) => set(s => ({
        expenses: [...s.expenses, { ...e, id: `e-${uid()}`, createdAt: new Date().toISOString() }],
      })),
      deleteExpense: (id) => set(s => ({ expenses: s.expenses.filter(e => e.id !== id) })),
      addSettlement: (s) => set(st => ({
        settlements: [...st.settlements, { ...s, id: `stl-${uid()}`, settledAt: new Date().toISOString() }],
      })),
      groupExpenses: (gid) => get().expenses.filter(e => e.groupId === gid),
      groupSettlements: (gid) => get().settlements.filter(s => s.groupId === gid),
      updateUserName: (name) => set(s => ({ user: s.user ? { ...s.user, name } : null })),
    }),
    { name: "splitevada-v3" }
  )
);

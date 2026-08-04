import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppUser, Expense, Group, GroupMember, Settlement } from "../types";
import { splitEqually } from "../lib/calculations";

function uid() { return Math.random().toString(36).slice(2, 10); }

interface AppState {
  user: AppUser | null; isAuth: boolean;
  groups: Group[]; expenses: Expense[]; settlements: Settlement[];
  login: (email: string, name?: string) => void;
  logout: () => void;
  addGroup: (g: Omit<Group, "id"|"createdAt"|"inviteCode">) => Group;
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
      addGroup: (g) => {
        const newGroupId = `g-${uid()}`;
        const newGroup: Group = {
          ...g,
          id: newGroupId,
          inviteCode: uid().toUpperCase().slice(0, 6),
          createdAt: new Date().toISOString(),
        };

        const newExpenses: Expense[] = [];
        if (g.targetAmount && g.targetAmount > 0) {
          const memberIds = g.members.map((m) => m.userId);
          newExpenses.push({
            id: `e-${uid()}`,
            groupId: newGroupId,
            paidBy: g.createdBy,
            title: `${g.name} Initial Spend`,
            amount: g.targetAmount,
            category: "other",
            date: g.spendingDate || new Date().toISOString().slice(0, 10),
            splits: splitEqually(g.targetAmount, memberIds),
            createdAt: new Date().toISOString(),
          });
        }

        set((s) => ({
          groups: [...s.groups, newGroup],
          expenses: [...s.expenses, ...newExpenses],
        }));

        return newGroup;
      },
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
    { name: "splitevada-v4" }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppUser, Expense, Group, GroupMember, Settlement } from "../types";
import { splitEqually } from "../lib/calculations";

function uid() { return Math.random().toString(36).slice(2, 10); }

export const INITIAL_AUTHORIZED_MEMBERS = [
  {
    "mobile": "9961187118",
    "name": "PEPPER",
    "isAdmin": true
  },
  {
    "mobile": "7902385215",
    "name": "ATHULDAS"
  },
  {
    "mobile": "9495640334",
    "name": "AKHILJITH"
  },
  {
    "mobile": "7034265672",
    "name": "ABINAND"
  },
  {
    "mobile": "7025440631",
    "name": "VISHNUGOKUL"
  },
  {
    "mobile": "9656828077",
    "name": "JASIM"
  },
  {
    "mobile": "9895579770",
    "name": "KANNAN"
  },
  {
    "mobile": "7909130049",
    "name": "ATHULRAVI"
  },
  {
    "mobile": "9539450925",
    "name": "VYSHAK"
  },
  {
    "mobile": "6235809709",
    "name": "MANU"
  },
  {
    "mobile": "7559813025",
    "name": "AMAL"
  },
  {
    "mobile": "8891317670",
    "name": "AYISHA"
  },
  {
    "mobile": "7736486736",
    "name": "SACHIN"
  }
];

export interface AuthorizedMember {
  mobile: string;
  name: string;
  isAdmin?: boolean;
}

interface AppState {
  user: AppUser | null;
  isAuth: boolean;
  groups: Group[];
  expenses: Expense[];
  settlements: Settlement[];
  customMembers: AuthorizedMember[];
  loginMember: (mobile: string, pass: string) => { success: boolean; message?: string };
  addAuthorizedMember: (mobile: string, name: string) => { success: boolean; message?: string };
  getAllAuthorizedMembers: () => AuthorizedMember[];
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
      user: null,
      isAuth: false,
      groups: [],
      expenses: [],
      settlements: [],
      customMembers: [],

      getAllAuthorizedMembers: () => {
        return [...INITIAL_AUTHORIZED_MEMBERS, ...get().customMembers];
      },

      loginMember: (mobileInput, passInput) => {
        const cleanMobile = mobileInput.replace(/\D/g, "");
        const cleanPass = passInput.trim().toUpperCase();
        
        const allMembers = get().getAllAuthorizedMembers();
        const member = allMembers.find(
          m => m.mobile === cleanMobile && m.name === cleanPass
        );

        if (!member) {
          return {
            success: false,
            message: "Access Denied: Invalid Mobile Number or Password"
          };
        }

        const userObj: AppUser = {
          id: `u-${cleanMobile}`,
          name: member.name,
          mobile: member.mobile,
          isAdmin: member.isAdmin || cleanMobile === "9961187118",
          currency: "INR"
        };

        set({ user: userObj, isAuth: true });
        return { success: true };
      },

      addAuthorizedMember: (mobileInput, nameInput) => {
        const cleanMobile = mobileInput.replace(/\D/g, "");
        const cleanName = nameInput.trim().toUpperCase();

        if (!cleanMobile || cleanMobile.length < 10) {
          return { success: false, message: "Please enter a valid 10-digit mobile number" };
        }
        if (!cleanName) {
          return { success: false, message: "Please enter a valid member name" };
        }

        const allMembers = get().getAllAuthorizedMembers();
        if (allMembers.some(m => m.mobile === cleanMobile)) {
          return { success: false, message: "Member with this mobile number already exists" };
        }

        const newMem: AuthorizedMember = { mobile: cleanMobile, name: cleanName };
        set(s => ({ customMembers: [...s.customMembers, newMem] }));
        return { success: true, message: `Added spot member ${cleanName} (${cleanMobile})` };
      },

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
    { name: "splitevada-v6" }
  )
);

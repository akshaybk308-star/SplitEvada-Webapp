import { pgTable, text, serial, integer, numeric, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { groupsTable } from "./groups";
import { membersTable } from "./members";

export const expensesTable = pgTable("expenses", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groupsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  date: date("date", { mode: "string" }).notNull(),
  payerId: integer("payer_id").notNull().references(() => membersTable.id),
  productSize: text("product_size"),
  notes: text("notes"),
  splitMode: text("split_mode").notNull().default("equal"), // equal | amount | shares
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const expenseSplitsTable = pgTable("expense_splits", {
  id: serial("id").primaryKey(),
  expenseId: integer("expense_id").notNull().references(() => expensesTable.id, { onDelete: "cascade" }),
  memberId: integer("member_id").notNull().references(() => membersTable.id, { onDelete: "cascade" }),
  owedAmount: numeric("owed_amount", { precision: 12, scale: 2 }).notNull(),
  shares: numeric("shares", { precision: 10, scale: 4 }),
});

export const insertExpenseSchema = createInsertSchema(expensesTable).omit({ id: true, createdAt: true });
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expensesTable.$inferSelect;

export const insertExpenseSplitSchema = createInsertSchema(expenseSplitsTable).omit({ id: true });
export type InsertExpenseSplit = z.infer<typeof insertExpenseSplitSchema>;
export type ExpenseSplit = typeof expenseSplitsTable.$inferSelect;

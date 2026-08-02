import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, expensesTable, expenseSplitsTable, membersTable } from "@workspace/db";
import {
  ListExpensesParams,
  CreateExpenseParams,
  CreateExpenseBody,
  GetExpenseParams,
  UpdateExpenseParams,
  UpdateExpenseBody,
  DeleteExpenseParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function toExpenseRow(e: typeof expensesTable.$inferSelect, payerName?: string) {
  return {
    id: e.id,
    groupId: e.groupId,
    title: e.title,
    amount: parseFloat(e.amount),
    currency: e.currency,
    date: e.date,
    payerId: e.payerId,
    payerName: payerName ?? "",
    productSize: e.productSize ?? null,
    notes: e.notes ?? null,
    splitMode: e.splitMode,
    createdAt: e.createdAt.toISOString(),
  };
}

// List expenses
router.get("/groups/:groupId/expenses", async (req, res): Promise<void> => {
  const params = ListExpensesParams.safeParse({ groupId: Number(req.params.groupId) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid groupId" });
    return;
  }
  const expenses = await db
    .select()
    .from(expensesTable)
    .where(eq(expensesTable.groupId, params.data.groupId))
    .orderBy(expensesTable.date);

  const memberIds = [...new Set(expenses.map((e) => e.payerId))];
  const members = memberIds.length
    ? await db.select().from(membersTable).where(eq(membersTable.groupId, params.data.groupId))
    : [];
  const memberMap = new Map(members.map((m) => [m.id, m.name]));

  res.json(expenses.map((e) => toExpenseRow(e, memberMap.get(e.payerId))));
});

// Create expense
router.post("/groups/:groupId/expenses", async (req, res): Promise<void> => {
  const params = CreateExpenseParams.safeParse({ groupId: Number(req.params.groupId) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid groupId" });
    return;
  }
  const parsed = CreateExpenseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { splits, ...expenseData } = parsed.data;
  const [expense] = await db
    .insert(expensesTable)
    .values({
      groupId: params.data.groupId,
      title: expenseData.title,
      amount: String(expenseData.amount),
      currency: expenseData.currency ?? "USD",
      date: expenseData.date,
      payerId: expenseData.payerId,
      productSize: expenseData.productSize,
      notes: expenseData.notes,
      splitMode: expenseData.splitMode,
    })
    .returning();

  if (splits && splits.length > 0) {
    await db.insert(expenseSplitsTable).values(
      splits.map((s) => ({
        expenseId: expense.id,
        memberId: s.memberId,
        owedAmount: String(s.owedAmount ?? 0),
        shares: s.shares !== undefined ? String(s.shares) : null,
      }))
    );
  }

  const payer = await db
    .select()
    .from(membersTable)
    .where(eq(membersTable.id, expense.payerId))
    .limit(1);

  res.status(201).json(toExpenseRow(expense, payer[0]?.name));
});

// Get expense detail
router.get("/groups/:groupId/expenses/:expenseId", async (req, res): Promise<void> => {
  const params = GetExpenseParams.safeParse({
    groupId: Number(req.params.groupId),
    expenseId: Number(req.params.expenseId),
  });
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const [expense] = await db
    .select()
    .from(expensesTable)
    .where(
      and(
        eq(expensesTable.id, params.data.expenseId),
        eq(expensesTable.groupId, params.data.groupId)
      )
    );
  if (!expense) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }

  const splits = await db
    .select()
    .from(expenseSplitsTable)
    .where(eq(expenseSplitsTable.expenseId, expense.id));

  const members = await db
    .select()
    .from(membersTable)
    .where(eq(membersTable.groupId, params.data.groupId));
  const memberMap = new Map(members.map((m) => [m.id, m.name]));

  res.json({
    ...toExpenseRow(expense, memberMap.get(expense.payerId)),
    splits: splits.map((s) => ({
      id: s.id,
      expenseId: s.expenseId,
      memberId: s.memberId,
      memberName: memberMap.get(s.memberId) ?? "",
      owedAmount: parseFloat(s.owedAmount),
      shares: s.shares !== null ? parseFloat(s.shares) : null,
    })),
  });
});

// Update expense
router.patch("/groups/:groupId/expenses/:expenseId", async (req, res): Promise<void> => {
  const params = UpdateExpenseParams.safeParse({
    groupId: Number(req.params.groupId),
    expenseId: Number(req.params.expenseId),
  });
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const parsed = UpdateExpenseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { splits, ...rest } = parsed.data;
  const updates: Record<string, unknown> = {};
  if (rest.title !== undefined) updates.title = rest.title;
  if (rest.amount !== undefined) updates.amount = String(rest.amount);
  if (rest.currency !== undefined) updates.currency = rest.currency;
  if (rest.date !== undefined) updates.date = rest.date;
  if (rest.payerId !== undefined) updates.payerId = rest.payerId;
  if (rest.productSize !== undefined) updates.productSize = rest.productSize;
  if (rest.notes !== undefined) updates.notes = rest.notes;
  if (rest.splitMode !== undefined) updates.splitMode = rest.splitMode;

  const [expense] = await db
    .update(expensesTable)
    .set(updates)
    .where(
      and(
        eq(expensesTable.id, params.data.expenseId),
        eq(expensesTable.groupId, params.data.groupId)
      )
    )
    .returning();
  if (!expense) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }

  if (splits && splits.length > 0) {
    await db.delete(expenseSplitsTable).where(eq(expenseSplitsTable.expenseId, expense.id));
    await db.insert(expenseSplitsTable).values(
      splits.map((s) => ({
        expenseId: expense.id,
        memberId: s.memberId,
        owedAmount: String(s.owedAmount ?? 0),
        shares: s.shares !== undefined ? String(s.shares) : null,
      }))
    );
  }

  const payer = await db
    .select()
    .from(membersTable)
    .where(eq(membersTable.id, expense.payerId))
    .limit(1);

  res.json(toExpenseRow(expense, payer[0]?.name));
});

// Delete expense
router.delete("/groups/:groupId/expenses/:expenseId", async (req, res): Promise<void> => {
  const params = DeleteExpenseParams.safeParse({
    groupId: Number(req.params.groupId),
    expenseId: Number(req.params.expenseId),
  });
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  await db
    .delete(expensesTable)
    .where(
      and(
        eq(expensesTable.id, params.data.expenseId),
        eq(expensesTable.groupId, params.data.groupId)
      )
    );
  res.status(204).send();
});

export default router;

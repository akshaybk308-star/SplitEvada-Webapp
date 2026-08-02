import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import {
  db,
  expensesTable,
  expenseSplitsTable,
  membersTable,
  paymentsTable,
  groupsTable,
} from "@workspace/db";
import {
  GetBalancesParams,
  GetSettlementsParams,
  GetGroupSummaryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

// Compute net balances per member
// net[member] = sum(expenses where payer) - sum(splits.owedAmount where memberId)
//             + sum(payments received) - sum(payments sent)
async function computeNetBalances(groupId: number) {
  const members = await db
    .select()
    .from(membersTable)
    .where(eq(membersTable.groupId, groupId));

  const expenses = await db
    .select()
    .from(expensesTable)
    .where(eq(expensesTable.groupId, groupId));

  const splits = expenses.length
    ? await db
        .select()
        .from(expenseSplitsTable)
        .where(
          // join via expense ID
          eq(expenseSplitsTable.expenseId, expenseSplitsTable.expenseId)
        )
    : [];

  // Re-fetch splits properly for the group's expenses
  const expenseIds = expenses.map((e) => e.id);
  const allSplits =
    expenseIds.length > 0
      ? await Promise.all(
          expenseIds.map((id) =>
            db
              .select()
              .from(expenseSplitsTable)
              .where(eq(expenseSplitsTable.expenseId, id))
          )
        ).then((results) => results.flat())
      : [];

  const payments = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.groupId, groupId));

  const balances = new Map<number, number>();
  for (const m of members) balances.set(m.id, 0);

  // Payer gets credit for the full expense amount
  for (const e of expenses) {
    balances.set(e.payerId, (balances.get(e.payerId) ?? 0) + parseFloat(e.amount));
  }

  // Each split debits the member
  for (const s of allSplits) {
    balances.set(s.memberId, (balances.get(s.memberId) ?? 0) - parseFloat(s.owedAmount));
  }

  // Payments: sender's balance increases (they've paid), receiver's decreases
  for (const p of payments) {
    balances.set(p.fromMemberId, (balances.get(p.fromMemberId) ?? 0) + parseFloat(p.amount));
    balances.set(p.toMemberId, (balances.get(p.toMemberId) ?? 0) - parseFloat(p.amount));
  }

  const memberMap = new Map(members.map((m) => [m.id, m.name]));
  return { balances, memberMap, members };
}

// Get balances
router.get("/groups/:groupId/balances", async (req, res): Promise<void> => {
  const params = GetBalancesParams.safeParse({ groupId: Number(req.params.groupId) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid groupId" });
    return;
  }
  const { balances, memberMap } = await computeNetBalances(params.data.groupId);
  const result = [];
  for (const [memberId, netBalance] of balances.entries()) {
    result.push({
      memberId,
      memberName: memberMap.get(memberId) ?? "",
      netBalance: Math.round(netBalance * 100) / 100,
    });
  }
  res.json(result);
});

// Get settlement suggestions using greedy algorithm
router.get("/groups/:groupId/settlements", async (req, res): Promise<void> => {
  const params = GetSettlementsParams.safeParse({ groupId: Number(req.params.groupId) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid groupId" });
    return;
  }
  const { balances, memberMap } = await computeNetBalances(params.data.groupId);

  // Greedy settlement: biggest creditor receives from biggest debtor
  const creditors: { id: number; amount: number }[] = [];
  const debtors: { id: number; amount: number }[] = [];

  for (const [id, net] of balances.entries()) {
    const rounded = Math.round(net * 100) / 100;
    if (rounded > 0.005) creditors.push({ id, amount: rounded });
    else if (rounded < -0.005) debtors.push({ id, amount: -rounded });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements: {
    fromMemberId: number;
    fromMemberName: string;
    toMemberId: number;
    toMemberName: string;
    amount: number;
  }[] = [];

  let ci = 0;
  let di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];
    const amount = Math.min(creditor.amount, debtor.amount);
    settlements.push({
      fromMemberId: debtor.id,
      fromMemberName: memberMap.get(debtor.id) ?? "",
      toMemberId: creditor.id,
      toMemberName: memberMap.get(creditor.id) ?? "",
      amount: Math.round(amount * 100) / 100,
    });
    creditor.amount -= amount;
    debtor.amount -= amount;
    if (creditor.amount < 0.005) ci++;
    if (debtor.amount < 0.005) di++;
  }

  res.json(settlements);
});

// Group summary
router.get("/groups/:groupId/summary", async (req, res): Promise<void> => {
  const params = GetGroupSummaryParams.safeParse({ groupId: Number(req.params.groupId) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid groupId" });
    return;
  }
  const groupId = params.data.groupId;

  const [group] = await db
    .select()
    .from(groupsTable)
    .where(eq(groupsTable.id, groupId))
    .limit(1);

  if (!group) {
    res.status(404).json({ error: "Group not found" });
    return;
  }

  const members = await db
    .select()
    .from(membersTable)
    .where(eq(membersTable.groupId, groupId));

  const expenses = await db
    .select()
    .from(expensesTable)
    .where(eq(expensesTable.groupId, groupId))
    .orderBy(expensesTable.date);

  const memberMap = new Map(members.map((m) => [m.id, m.name]));

  const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const recentExpenses = expenses.slice(-5).reverse().map((e) => ({
    id: e.id,
    groupId: e.groupId,
    title: e.title,
    amount: parseFloat(e.amount),
    currency: e.currency,
    date: e.date,
    payerId: e.payerId,
    payerName: memberMap.get(e.payerId) ?? "",
    productSize: e.productSize ?? null,
    notes: e.notes ?? null,
    splitMode: e.splitMode,
    createdAt: e.createdAt.toISOString(),
  }));

  res.json({
    groupId,
    totalSpent: Math.round(totalSpent * 100) / 100,
    memberCount: members.length,
    expenseCount: expenses.length,
    currency: group.currency,
    recentExpenses,
  });
});

export default router;

import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, paymentsTable, membersTable } from "@workspace/db";
import {
  ListPaymentsParams,
  RecordPaymentParams,
  RecordPaymentBody,
  DeletePaymentParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function toPaymentRow(
  p: typeof paymentsTable.$inferSelect,
  fromName?: string,
  toName?: string
) {
  return {
    id: p.id,
    groupId: p.groupId,
    fromMemberId: p.fromMemberId,
    fromMemberName: fromName ?? "",
    toMemberId: p.toMemberId,
    toMemberName: toName ?? "",
    amount: parseFloat(p.amount),
    date: p.date,
    notes: p.notes ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

// List payments
router.get("/groups/:groupId/payments", async (req, res): Promise<void> => {
  const params = ListPaymentsParams.safeParse({ groupId: Number(req.params.groupId) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid groupId" });
    return;
  }
  const payments = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.groupId, params.data.groupId))
    .orderBy(paymentsTable.date);
  const members = await db
    .select()
    .from(membersTable)
    .where(eq(membersTable.groupId, params.data.groupId));
  const memberMap = new Map(members.map((m) => [m.id, m.name]));
  res.json(
    payments.map((p) =>
      toPaymentRow(p, memberMap.get(p.fromMemberId), memberMap.get(p.toMemberId))
    )
  );
});

// Record payment
router.post("/groups/:groupId/payments", async (req, res): Promise<void> => {
  const params = RecordPaymentParams.safeParse({ groupId: Number(req.params.groupId) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid groupId" });
    return;
  }
  const parsed = RecordPaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [payment] = await db
    .insert(paymentsTable)
    .values({
      groupId: params.data.groupId,
      fromMemberId: parsed.data.fromMemberId,
      toMemberId: parsed.data.toMemberId,
      amount: String(parsed.data.amount),
      date: parsed.data.date,
      notes: parsed.data.notes,
    })
    .returning();
  const members = await db
    .select()
    .from(membersTable)
    .where(eq(membersTable.groupId, params.data.groupId));
  const memberMap = new Map(members.map((m) => [m.id, m.name]));
  res.status(201).json(
    toPaymentRow(payment, memberMap.get(payment.fromMemberId), memberMap.get(payment.toMemberId))
  );
});

// Delete payment
router.delete("/groups/:groupId/payments/:paymentId", async (req, res): Promise<void> => {
  const params = DeletePaymentParams.safeParse({
    groupId: Number(req.params.groupId),
    paymentId: Number(req.params.paymentId),
  });
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  await db
    .delete(paymentsTable)
    .where(
      and(
        eq(paymentsTable.id, params.data.paymentId),
        eq(paymentsTable.groupId, params.data.groupId)
      )
    );
  res.status(204).send();
});

export default router;

import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, membersTable } from "@workspace/db";
import {
  ListMembersParams,
  AddMemberParams,
  AddMemberBody,
  RemoveMemberParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

// List members
router.get("/groups/:groupId/members", async (req, res): Promise<void> => {
  const params = ListMembersParams.safeParse({ groupId: Number(req.params.groupId) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid groupId" });
    return;
  }
  const members = await db
    .select()
    .from(membersTable)
    .where(eq(membersTable.groupId, params.data.groupId))
    .orderBy(membersTable.createdAt);
  res.json(
    members.map((m) => ({
      id: m.id,
      groupId: m.groupId,
      name: m.name,
      email: m.email ?? null,
      createdAt: m.createdAt.toISOString(),
    }))
  );
});

// Add member
router.post("/groups/:groupId/members", async (req, res): Promise<void> => {
  const params = AddMemberParams.safeParse({ groupId: Number(req.params.groupId) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid groupId" });
    return;
  }
  const parsed = AddMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [member] = await db
    .insert(membersTable)
    .values({ groupId: params.data.groupId, name: parsed.data.name, email: parsed.data.email })
    .returning();
  res.status(201).json({
    id: member.id,
    groupId: member.groupId,
    name: member.name,
    email: member.email ?? null,
    createdAt: member.createdAt.toISOString(),
  });
});

// Remove member
router.delete("/groups/:groupId/members/:memberId", async (req, res): Promise<void> => {
  const params = RemoveMemberParams.safeParse({
    groupId: Number(req.params.groupId),
    memberId: Number(req.params.memberId),
  });
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  await db
    .delete(membersTable)
    .where(
      and(
        eq(membersTable.id, params.data.memberId),
        eq(membersTable.groupId, params.data.groupId)
      )
    );
  res.status(204).send();
});

export default router;

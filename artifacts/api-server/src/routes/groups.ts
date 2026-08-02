import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, groupsTable } from "@workspace/db";
import {
  CreateGroupBody,
  UpdateGroupBody,
  GetGroupParams,
  UpdateGroupParams,
  DeleteGroupParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

// List groups
router.get("/groups", async (req, res): Promise<void> => {
  const groups = await db.select().from(groupsTable).orderBy(groupsTable.createdAt);
  res.json(
    groups.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description ?? null,
      currency: g.currency,
      createdAt: g.createdAt.toISOString(),
    }))
  );
});

// Create group
router.post("/groups", async (req, res): Promise<void> => {
  const parsed = CreateGroupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, description, currency } = parsed.data;
  const [group] = await db
    .insert(groupsTable)
    .values({ name, description, currency: currency ?? "USD" })
    .returning();
  res.status(201).json({
    id: group.id,
    name: group.name,
    description: group.description ?? null,
    currency: group.currency,
    createdAt: group.createdAt.toISOString(),
  });
});

// Get group
router.get("/groups/:groupId", async (req, res): Promise<void> => {
  const params = GetGroupParams.safeParse({ groupId: Number(req.params.groupId) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid groupId" });
    return;
  }
  const [group] = await db
    .select()
    .from(groupsTable)
    .where(eq(groupsTable.id, params.data.groupId));
  if (!group) {
    res.status(404).json({ error: "Group not found" });
    return;
  }
  res.json({
    id: group.id,
    name: group.name,
    description: group.description ?? null,
    currency: group.currency,
    createdAt: group.createdAt.toISOString(),
  });
});

// Update group
router.patch("/groups/:groupId", async (req, res): Promise<void> => {
  const params = UpdateGroupParams.safeParse({ groupId: Number(req.params.groupId) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid groupId" });
    return;
  }
  const parsed = UpdateGroupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.currency !== undefined) updates.currency = parsed.data.currency;

  const [group] = await db
    .update(groupsTable)
    .set(updates)
    .where(eq(groupsTable.id, params.data.groupId))
    .returning();
  if (!group) {
    res.status(404).json({ error: "Group not found" });
    return;
  }
  res.json({
    id: group.id,
    name: group.name,
    description: group.description ?? null,
    currency: group.currency,
    createdAt: group.createdAt.toISOString(),
  });
});

// Delete group
router.delete("/groups/:groupId", async (req, res): Promise<void> => {
  const params = DeleteGroupParams.safeParse({ groupId: Number(req.params.groupId) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid groupId" });
    return;
  }
  await db.delete(groupsTable).where(eq(groupsTable.id, params.data.groupId));
  res.status(204).send();
});

export default router;

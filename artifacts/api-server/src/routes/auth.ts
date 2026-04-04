import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, authMiddleware } from "../lib/auth";
import { LoginBody, RegisterBody } from "@workspace/api-zod";

const router = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (!user) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  if (!user.isActive) {
    res.status(401).json({ error: "Account is inactive" });
    return;
  }

  const token = signToken({ id: user.id, username: user.username, role: user.role, fullName: user.fullName, email: user.email });

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      createdAt: user.createdAt.toISOString(),
    },
  });
});

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password, email, role, fullName } = parsed.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (existing) {
    res.status(400).json({ error: "Username already exists" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(usersTable)
    .values({ username, password: hashedPassword, email, role: role || "patient", fullName })
    .returning();

  const token = signToken({ id: user.id, username: user.username, role: user.role, fullName: user.fullName, email: user.email });

  res.status(201).json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      createdAt: user.createdAt.toISOString(),
    },
  });
});

router.get("/auth/me", authMiddleware, async (req, res): Promise<void> => {
  const user = (req as Request & { user: typeof usersTable.$inferSelect }).user;
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
    createdAt: user.createdAt.toISOString(),
  });
});

import type { Request } from "express";

export default router;

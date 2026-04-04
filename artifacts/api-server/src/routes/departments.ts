import { Router } from "express";
import { db, departmentsTable } from "@workspace/db";
import { authMiddleware } from "../lib/auth";

const router = Router();

router.get("/departments", authMiddleware, async (_req, res): Promise<void> => {
  const departments = await db.select().from(departmentsTable);
  res.json(departments);
});

export default router;

import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const doctorsTable = pgTable("doctors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  departmentId: integer("department_id"),
  fullName: text("full_name").notNull(),
  specialization: text("specialization"),
  experienceYrs: integer("experience_yrs"),
  isAvailable: boolean("is_available").notNull().default(true),
});

export const insertDoctorSchema = createInsertSchema(doctorsTable).omit({ id: true });
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Doctor = typeof doctorsTable.$inferSelect;

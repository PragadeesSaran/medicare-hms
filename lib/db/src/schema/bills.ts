import { pgTable, serial, integer, numeric, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const billsTable = pgTable("bills", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  appointmentId: integer("appointment_id"),
  consultationFee: numeric("consultation_fee", { precision: 10, scale: 2 }).notNull().default("0"),
  medicineCost: numeric("medicine_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  billDate: timestamp("bill_date", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBillSchema = createInsertSchema(billsTable).omit({ id: true, billDate: true });
export type InsertBill = z.infer<typeof insertBillSchema>;
export type Bill = typeof billsTable.$inferSelect;

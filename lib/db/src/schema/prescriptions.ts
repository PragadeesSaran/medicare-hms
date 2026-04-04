import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const prescriptionsTable = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id"),
  doctorId: integer("doctor_id").notNull(),
  patientId: integer("patient_id").notNull(),
  diagnosis: text("diagnosis").notNull(),
  medicines: text("medicines").notNull(),
  dosageInstructions: text("dosage_instructions"),
  issuedDate: timestamp("issued_date", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPrescriptionSchema = createInsertSchema(prescriptionsTable).omit({ id: true, issuedDate: true });
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type Prescription = typeof prescriptionsTable.$inferSelect;

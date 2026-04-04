import { Router } from "express";
import { db, appointmentsTable, patientsTable, doctorsTable, departmentsTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";
import {
  CreateAppointmentBody,
  GetAppointmentsQueryParams,
  CancelAppointmentParams,
  CompleteAppointmentParams,
} from "@workspace/api-zod";

const router = Router();

async function getAppointmentDetail(id: number) {
  const [result] = await db
    .select({
      id: appointmentsTable.id,
      patientId: appointmentsTable.patientId,
      doctorId: appointmentsTable.doctorId,
      appointmentDate: appointmentsTable.appointmentDate,
      timeSlot: appointmentsTable.timeSlot,
      status: appointmentsTable.status,
      notes: appointmentsTable.notes,
      createdAt: appointmentsTable.createdAt,
      patientName: patientsTable.fullName,
      doctorName: doctorsTable.fullName,
      departmentName: departmentsTable.name,
    })
    .from(appointmentsTable)
    .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .leftJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
    .leftJoin(departmentsTable, eq(doctorsTable.departmentId, departmentsTable.id))
    .where(eq(appointmentsTable.id, id));
  return result;
}

router.get("/appointments/today", authMiddleware, async (_req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];
  const all = await db
    .select()
    .from(appointmentsTable)
    .where(eq(appointmentsTable.appointmentDate, today));
  res.json({ count: all.length });
});

router.get("/appointments", authMiddleware, async (req, res): Promise<void> => {
  const params = GetAppointmentsQueryParams.safeParse(req.query);
  const dateFilter = params.success ? params.data.date : undefined;
  const statusFilter = params.success ? params.data.status : undefined;
  const page = params.success && params.data.page ? Number(params.data.page) : 1;
  const limit = params.success && params.data.limit ? Number(params.data.limit) : 20;
  const offset = (page - 1) * limit;

  const results = await db
    .select({
      id: appointmentsTable.id,
      patientId: appointmentsTable.patientId,
      doctorId: appointmentsTable.doctorId,
      appointmentDate: appointmentsTable.appointmentDate,
      timeSlot: appointmentsTable.timeSlot,
      status: appointmentsTable.status,
      notes: appointmentsTable.notes,
      createdAt: appointmentsTable.createdAt,
      patientName: patientsTable.fullName,
      doctorName: doctorsTable.fullName,
      departmentName: departmentsTable.name,
    })
    .from(appointmentsTable)
    .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .leftJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
    .leftJoin(departmentsTable, eq(doctorsTable.departmentId, departmentsTable.id))
    .orderBy(desc(appointmentsTable.createdAt));

  let filtered = results;
  if (dateFilter) filtered = filtered.filter(a => a.appointmentDate === dateFilter);
  if (statusFilter) filtered = filtered.filter(a => a.status === statusFilter);

  const total = filtered.length;
  const page_results = filtered.slice(offset, offset + limit);

  res.json({
    appointments: page_results.map(a => ({
      ...a,
      patientName: a.patientName || "Unknown",
      doctorName: a.doctorName || "Unknown",
      createdAt: a.createdAt.toISOString(),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

router.post("/appointments", authMiddleware, async (req, res): Promise<void> => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [appointment] = await db
    .insert(appointmentsTable)
    .values({ ...parsed.data, status: "scheduled" })
    .returning();

  const detail = await getAppointmentDetail(appointment.id);
  res.status(201).json({
    ...detail,
    patientName: detail?.patientName || "Unknown",
    doctorName: detail?.doctorName || "Unknown",
    createdAt: detail?.createdAt.toISOString(),
  });
});

router.put("/appointments/:id/cancel", authMiddleware, async (req, res): Promise<void> => {
  const params = CancelAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [appointment] = await db
    .update(appointmentsTable)
    .set({ status: "cancelled" })
    .where(eq(appointmentsTable.id, params.data.id))
    .returning();

  if (!appointment) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  const detail = await getAppointmentDetail(appointment.id);
  res.json({
    ...detail,
    patientName: detail?.patientName || "Unknown",
    doctorName: detail?.doctorName || "Unknown",
    createdAt: detail?.createdAt.toISOString(),
  });
});

router.put("/appointments/:id/complete", authMiddleware, async (req, res): Promise<void> => {
  const params = CompleteAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [appointment] = await db
    .update(appointmentsTable)
    .set({ status: "completed" })
    .where(eq(appointmentsTable.id, params.data.id))
    .returning();

  if (!appointment) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  const detail = await getAppointmentDetail(appointment.id);
  res.json({
    ...detail,
    patientName: detail?.patientName || "Unknown",
    doctorName: detail?.doctorName || "Unknown",
    createdAt: detail?.createdAt.toISOString(),
  });
});

export default router;

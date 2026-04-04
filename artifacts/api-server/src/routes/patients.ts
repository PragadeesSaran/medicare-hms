import { Router } from "express";
import { db, patientsTable, appointmentsTable, doctorsTable } from "@workspace/db";
import { eq, ilike, or, sql, desc } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";
import { CreatePatientBody, UpdatePatientBody, GetPatientParams, UpdatePatientParams, GetPatientHistoryParams, GetPatientsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/patients", authMiddleware, async (req, res): Promise<void> => {
  const params = GetPatientsQueryParams.safeParse(req.query);
  const search = params.success ? params.data.search : undefined;
  const page = params.success && params.data.page ? Number(params.data.page) : 1;
  const limit = params.success && params.data.limit ? Number(params.data.limit) : 10;
  const offset = (page - 1) * limit;

  let query = db.select().from(patientsTable);

  if (search) {
    query = query.where(ilike(patientsTable.fullName, `%${search}%`)) as typeof query;
  }

  const allPatients = await query.orderBy(desc(patientsTable.createdAt));
  const total = allPatients.length;
  const patients = allPatients.slice(offset, offset + limit);

  res.json({
    patients: patients.map(p => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

router.post("/patients", authMiddleware, async (req, res): Promise<void> => {
  const parsed = CreatePatientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email: _email, ...patientData } = parsed.data;
  const [patient] = await db.insert(patientsTable).values(patientData).returning();

  res.status(201).json({ ...patient, createdAt: patient.createdAt.toISOString() });
});

router.get("/patients/:id", authMiddleware, async (req, res): Promise<void> => {
  const params = GetPatientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, params.data.id));
  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }

  res.json({ ...patient, createdAt: patient.createdAt.toISOString() });
});

router.put("/patients/:id", authMiddleware, async (req, res): Promise<void> => {
  const params = UpdatePatientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePatientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [patient] = await db
    .update(patientsTable)
    .set(parsed.data)
    .where(eq(patientsTable.id, params.data.id))
    .returning();

  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }

  res.json({ ...patient, createdAt: patient.createdAt.toISOString() });
});

router.get("/patients/:id/history", authMiddleware, async (req, res): Promise<void> => {
  const params = GetPatientHistoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const appointments = await db
    .select({
      id: appointmentsTable.id,
      patientId: appointmentsTable.patientId,
      doctorId: appointmentsTable.doctorId,
      appointmentDate: appointmentsTable.appointmentDate,
      timeSlot: appointmentsTable.timeSlot,
      status: appointmentsTable.status,
      notes: appointmentsTable.notes,
      createdAt: appointmentsTable.createdAt,
      doctorName: doctorsTable.fullName,
    })
    .from(appointmentsTable)
    .leftJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
    .where(eq(appointmentsTable.patientId, params.data.id))
    .orderBy(desc(appointmentsTable.appointmentDate));

  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, params.data.id));

  res.json(
    appointments.map(a => ({
      ...a,
      patientName: patient?.fullName || "Unknown",
      doctorName: a.doctorName || "Unknown",
      departmentName: null,
      createdAt: a.createdAt.toISOString(),
    }))
  );
});

export default router;

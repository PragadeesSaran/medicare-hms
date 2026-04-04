import { Router } from "express";
import { db, prescriptionsTable, patientsTable, doctorsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";
import { CreatePrescriptionBody, GetPrescriptionsQueryParams, GetPrescriptionParams } from "@workspace/api-zod";

const router = Router();

async function getPrescriptionDetail(id: number) {
  const [result] = await db
    .select({
      id: prescriptionsTable.id,
      appointmentId: prescriptionsTable.appointmentId,
      doctorId: prescriptionsTable.doctorId,
      patientId: prescriptionsTable.patientId,
      diagnosis: prescriptionsTable.diagnosis,
      medicines: prescriptionsTable.medicines,
      dosageInstructions: prescriptionsTable.dosageInstructions,
      issuedDate: prescriptionsTable.issuedDate,
      patientName: patientsTable.fullName,
      doctorName: doctorsTable.fullName,
    })
    .from(prescriptionsTable)
    .leftJoin(patientsTable, eq(prescriptionsTable.patientId, patientsTable.id))
    .leftJoin(doctorsTable, eq(prescriptionsTable.doctorId, doctorsTable.id))
    .where(eq(prescriptionsTable.id, id));
  return result;
}

router.get("/prescriptions", authMiddleware, async (req, res): Promise<void> => {
  const params = GetPrescriptionsQueryParams.safeParse(req.query);

  const results = await db
    .select({
      id: prescriptionsTable.id,
      appointmentId: prescriptionsTable.appointmentId,
      doctorId: prescriptionsTable.doctorId,
      patientId: prescriptionsTable.patientId,
      diagnosis: prescriptionsTable.diagnosis,
      medicines: prescriptionsTable.medicines,
      dosageInstructions: prescriptionsTable.dosageInstructions,
      issuedDate: prescriptionsTable.issuedDate,
      patientName: patientsTable.fullName,
      doctorName: doctorsTable.fullName,
    })
    .from(prescriptionsTable)
    .leftJoin(patientsTable, eq(prescriptionsTable.patientId, patientsTable.id))
    .leftJoin(doctorsTable, eq(prescriptionsTable.doctorId, doctorsTable.id))
    .orderBy(desc(prescriptionsTable.issuedDate));

  let filtered = results;
  if (params.success && params.data.patientId) {
    filtered = filtered.filter(p => p.patientId === Number(params.data.patientId));
  }
  if (params.success && params.data.doctorId) {
    filtered = filtered.filter(p => p.doctorId === Number(params.data.doctorId));
  }

  res.json(
    filtered.map(p => ({
      ...p,
      patientName: p.patientName || "Unknown",
      doctorName: p.doctorName || "Unknown",
      issuedDate: p.issuedDate.toISOString(),
    }))
  );
});

router.post("/prescriptions", authMiddleware, async (req, res): Promise<void> => {
  const parsed = CreatePrescriptionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [prescription] = await db.insert(prescriptionsTable).values(parsed.data).returning();

  const detail = await getPrescriptionDetail(prescription.id);
  res.status(201).json({
    ...detail,
    patientName: detail?.patientName || "Unknown",
    doctorName: detail?.doctorName || "Unknown",
    issuedDate: detail?.issuedDate.toISOString(),
  });
});

router.get("/prescriptions/:id", authMiddleware, async (req, res): Promise<void> => {
  const params = GetPrescriptionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const detail = await getPrescriptionDetail(params.data.id);
  if (!detail) {
    res.status(404).json({ error: "Prescription not found" });
    return;
  }

  res.json({
    ...detail,
    patientName: detail.patientName || "Unknown",
    doctorName: detail.doctorName || "Unknown",
    issuedDate: detail.issuedDate.toISOString(),
  });
});

export default router;

import { Router } from "express";
import { db, doctorsTable, departmentsTable, appointmentsTable, patientsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";
import {
  CreateDoctorBody,
  GetDoctorParams,
  GetDoctorSlotsParams,
  GetDoctorSlotsQueryParams,
  UpdateDoctorAvailabilityParams,
  UpdateDoctorAvailabilityBody,
  GetDoctorAppointmentsParams,
  GetDoctorAppointmentsQueryParams,
  GetDoctorsQueryParams,
} from "@workspace/api-zod";
import bcrypt from "bcryptjs";

const router = Router();

const ALL_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM",
];

async function getDoctorWithDept(doctorId: number) {
  const [result] = await db
    .select({
      id: doctorsTable.id,
      userId: doctorsTable.userId,
      departmentId: doctorsTable.departmentId,
      fullName: doctorsTable.fullName,
      specialization: doctorsTable.specialization,
      experienceYrs: doctorsTable.experienceYrs,
      isAvailable: doctorsTable.isAvailable,
      departmentName: departmentsTable.name,
    })
    .from(doctorsTable)
    .leftJoin(departmentsTable, eq(doctorsTable.departmentId, departmentsTable.id))
    .where(eq(doctorsTable.id, doctorId));
  return result;
}

router.get("/doctors", authMiddleware, async (req, res): Promise<void> => {
  const params = GetDoctorsQueryParams.safeParse(req.query);
  const departmentFilter = params.success ? params.data.department : undefined;

  const results = await db
    .select({
      id: doctorsTable.id,
      userId: doctorsTable.userId,
      departmentId: doctorsTable.departmentId,
      fullName: doctorsTable.fullName,
      specialization: doctorsTable.specialization,
      experienceYrs: doctorsTable.experienceYrs,
      isAvailable: doctorsTable.isAvailable,
      departmentName: departmentsTable.name,
    })
    .from(doctorsTable)
    .leftJoin(departmentsTable, eq(doctorsTable.departmentId, departmentsTable.id));

  const filtered = departmentFilter
    ? results.filter(d => d.departmentName?.toLowerCase().includes(departmentFilter.toLowerCase()))
    : results;

  // Fetch emails from users table
  const withEmail = await Promise.all(
    filtered.map(async (doc) => {
      let email: string | null = null;
      if (doc.userId) {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, doc.userId));
        email = user?.email ?? null;
      }
      return { ...doc, email };
    })
  );

  res.json(withEmail);
});

router.post("/doctors", authMiddleware, async (req, res): Promise<void> => {
  const parsed = CreateDoctorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { fullName, specialization, departmentId, experienceYrs, email, password } = parsed.data;

  let userId: number | undefined;
  if (email && password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const username = email.split("@")[0] + "_" + Date.now();
    const [user] = await db
      .insert(usersTable)
      .values({ username, password: hashedPassword, email, role: "doctor", fullName })
      .returning();
    userId = user.id;
  }

  const [doctor] = await db
    .insert(doctorsTable)
    .values({ fullName, specialization, departmentId, experienceYrs, userId, isAvailable: true })
    .returning();

  const result = await getDoctorWithDept(doctor.id);
  res.status(201).json({ ...result, email: email || null });
});

router.get("/doctors/:id", authMiddleware, async (req, res): Promise<void> => {
  const params = GetDoctorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const result = await getDoctorWithDept(params.data.id);
  if (!result) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  res.json({ ...result, email: null });
});

router.get("/doctors/:id/slots", authMiddleware, async (req, res): Promise<void> => {
  const params = GetDoctorSlotsParams.safeParse(req.params);
  const queryParams = GetDoctorSlotsQueryParams.safeParse(req.query);

  if (!params.success || !queryParams.success) {
    res.status(400).json({ error: "Invalid parameters" });
    return;
  }

  const { id } = params.data;
  const { date } = queryParams.data;

  // Get booked slots for this doctor on this date
  const booked = await db
    .select({ timeSlot: appointmentsTable.timeSlot })
    .from(appointmentsTable)
    .where(
      and(
        eq(appointmentsTable.doctorId, id),
        eq(appointmentsTable.appointmentDate, date),
        eq(appointmentsTable.status, "scheduled")
      )
    );

  const bookedSlots = new Set(booked.map(b => b.timeSlot));
  const availableSlots = ALL_SLOTS.filter(slot => !bookedSlots.has(slot));

  res.json(availableSlots);
});

router.put("/doctors/:id/availability", authMiddleware, async (req, res): Promise<void> => {
  const params = UpdateDoctorAvailabilityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateDoctorAvailabilityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [doctor] = await db
    .update(doctorsTable)
    .set({ isAvailable: parsed.data.isAvailable })
    .where(eq(doctorsTable.id, params.data.id))
    .returning();

  if (!doctor) {
    res.status(404).json({ error: "Doctor not found" });
    return;
  }

  const result = await getDoctorWithDept(doctor.id);
  res.json({ ...result, email: null });
});

router.get("/doctors/:id/appointments", authMiddleware, async (req, res): Promise<void> => {
  const params = GetDoctorAppointmentsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const queryParams = GetDoctorAppointmentsQueryParams.safeParse(req.query);
  const dateFilter = queryParams.success ? queryParams.data.date : undefined;

  let conditions = [eq(appointmentsTable.doctorId, params.data.id)];

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
    .where(and(...conditions));

  const filtered = dateFilter
    ? results.filter(a => a.appointmentDate === dateFilter)
    : results;

  res.json(
    filtered.map(a => ({
      ...a,
      patientName: a.patientName || "Unknown",
      doctorName: a.doctorName || "Unknown",
      createdAt: a.createdAt.toISOString(),
    }))
  );
});

export default router;

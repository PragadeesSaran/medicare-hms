import { Router } from "express";
import { db, usersTable, patientsTable, doctorsTable, appointmentsTable, billsTable, prescriptionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";

const router = Router();

router.get("/dashboard/stats", authMiddleware, async (_req, res): Promise<void> => {
  const [patients, doctors, bills, prescriptions] = await Promise.all([
    db.select().from(patientsTable),
    db.select().from(doctorsTable),
    db.select().from(billsTable),
    db.select().from(prescriptionsTable),
  ]);

  const today = new Date().toISOString().split("T")[0];
  const todayAppts = await db
    .select()
    .from(appointmentsTable)
    .where(eq(appointmentsTable.appointmentDate, today));

  const totalRevenue = bills
    .filter(b => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + parseFloat(b.totalAmount || "0"), 0);

  const pendingBills = bills.filter(b => b.paymentStatus === "pending").length;

  res.json({
    totalPatients: patients.length,
    totalDoctors: doctors.length,
    todayAppointments: todayAppts.length,
    totalRevenue,
    pendingBills,
    totalPrescriptions: prescriptions.length,
  });
});

router.get("/dashboard/chart-data", authMiddleware, async (_req, res): Promise<void> => {
  // Get last 7 days appointments
  const last7Days: Array<{ date: string; count: number; scheduled: number; completed: number; cancelled: number }> = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    const dayAppts = await db
      .select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.appointmentDate, dateStr));

    last7Days.push({
      date: dateStr,
      count: dayAppts.length,
      scheduled: dayAppts.filter(a => a.status === "scheduled").length,
      completed: dayAppts.filter(a => a.status === "completed").length,
      cancelled: dayAppts.filter(a => a.status === "cancelled").length,
    });
  }

  // Status breakdown
  const allAppts = await db.select().from(appointmentsTable);
  const statusBreakdown = [
    { status: "Scheduled", count: allAppts.filter(a => a.status === "scheduled").length },
    { status: "Completed", count: allAppts.filter(a => a.status === "completed").length },
    { status: "Cancelled", count: allAppts.filter(a => a.status === "cancelled").length },
  ];

  res.json({ appointmentsByDay: last7Days, statusBreakdown });
});

router.get("/dashboard/recent-appointments", authMiddleware, async (_req, res): Promise<void> => {
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
    })
    .from(appointmentsTable)
    .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .leftJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
    .orderBy(desc(appointmentsTable.createdAt))
    .limit(5);

  res.json(
    results.map(a => ({
      ...a,
      patientName: a.patientName || "Unknown",
      doctorName: a.doctorName || "Unknown",
      departmentName: null,
      createdAt: a.createdAt.toISOString(),
    }))
  );
});

export default router;

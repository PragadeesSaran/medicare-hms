import { Router } from "express";
import { db, billsTable, patientsTable, appointmentsTable, doctorsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";
import { CreateBillBody, GetBillsQueryParams, PayBillParams } from "@workspace/api-zod";

const router = Router();

async function getBillDetail(id: number) {
  const [result] = await db
    .select({
      id: billsTable.id,
      patientId: billsTable.patientId,
      appointmentId: billsTable.appointmentId,
      consultationFee: billsTable.consultationFee,
      medicineCost: billsTable.medicineCost,
      totalAmount: billsTable.totalAmount,
      paymentStatus: billsTable.paymentStatus,
      billDate: billsTable.billDate,
      patientName: patientsTable.fullName,
      doctorName: doctorsTable.fullName,
    })
    .from(billsTable)
    .leftJoin(patientsTable, eq(billsTable.patientId, patientsTable.id))
    .leftJoin(appointmentsTable, eq(billsTable.appointmentId, appointmentsTable.id))
    .leftJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
    .where(eq(billsTable.id, id));
  return result;
}

router.get("/bills/stats", authMiddleware, async (_req, res): Promise<void> => {
  const bills = await db.select().from(billsTable);

  const totalBilled = bills.reduce((sum, b) => sum + parseFloat(b.totalAmount || "0"), 0);
  const totalCollected = bills
    .filter(b => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + parseFloat(b.totalAmount || "0"), 0);
  const pendingAmount = bills
    .filter(b => b.paymentStatus === "pending")
    .reduce((sum, b) => sum + parseFloat(b.totalAmount || "0"), 0);

  res.json({
    totalBilled,
    totalCollected,
    pendingAmount,
    totalBills: bills.length,
    paidBills: bills.filter(b => b.paymentStatus === "paid").length,
    pendingBills: bills.filter(b => b.paymentStatus === "pending").length,
  });
});

router.get("/bills", authMiddleware, async (req, res): Promise<void> => {
  const params = GetBillsQueryParams.safeParse(req.query);

  const results = await db
    .select({
      id: billsTable.id,
      patientId: billsTable.patientId,
      appointmentId: billsTable.appointmentId,
      consultationFee: billsTable.consultationFee,
      medicineCost: billsTable.medicineCost,
      totalAmount: billsTable.totalAmount,
      paymentStatus: billsTable.paymentStatus,
      billDate: billsTable.billDate,
      patientName: patientsTable.fullName,
      doctorName: doctorsTable.fullName,
    })
    .from(billsTable)
    .leftJoin(patientsTable, eq(billsTable.patientId, patientsTable.id))
    .leftJoin(appointmentsTable, eq(billsTable.appointmentId, appointmentsTable.id))
    .leftJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
    .orderBy(desc(billsTable.billDate));

  let filtered = results;
  if (params.success && params.data.patientId) {
    filtered = filtered.filter(b => b.patientId === Number(params.data.patientId));
  }
  if (params.success && params.data.status) {
    filtered = filtered.filter(b => b.paymentStatus === params.data.status);
  }

  res.json(
    filtered.map(b => ({
      ...b,
      consultationFee: parseFloat(b.consultationFee || "0"),
      medicineCost: parseFloat(b.medicineCost || "0"),
      totalAmount: parseFloat(b.totalAmount || "0"),
      patientName: b.patientName || "Unknown",
      billDate: b.billDate.toISOString(),
    }))
  );
});

router.post("/bills", authMiddleware, async (req, res): Promise<void> => {
  const parsed = CreateBillBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { consultationFee, medicineCost } = parsed.data;
  const total = (consultationFee || 0) + (medicineCost || 0);

  const [bill] = await db
    .insert(billsTable)
    .values({
      ...parsed.data,
      consultationFee: String(consultationFee || 0),
      medicineCost: String(medicineCost || 0),
      totalAmount: String(total),
      paymentStatus: "pending",
    })
    .returning();

  const detail = await getBillDetail(bill.id);
  res.status(201).json({
    ...detail,
    consultationFee: parseFloat(detail?.consultationFee || "0"),
    medicineCost: parseFloat(detail?.medicineCost || "0"),
    totalAmount: parseFloat(detail?.totalAmount || "0"),
    patientName: detail?.patientName || "Unknown",
    billDate: detail?.billDate.toISOString(),
  });
});

router.put("/bills/:id/pay", authMiddleware, async (req, res): Promise<void> => {
  const params = PayBillParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [bill] = await db
    .update(billsTable)
    .set({ paymentStatus: "paid" })
    .where(eq(billsTable.id, params.data.id))
    .returning();

  if (!bill) {
    res.status(404).json({ error: "Bill not found" });
    return;
  }

  const detail = await getBillDetail(bill.id);
  res.json({
    ...detail,
    consultationFee: parseFloat(detail?.consultationFee || "0"),
    medicineCost: parseFloat(detail?.medicineCost || "0"),
    totalAmount: parseFloat(detail?.totalAmount || "0"),
    patientName: detail?.patientName || "Unknown",
    billDate: detail?.billDate.toISOString(),
  });
});

export default router;

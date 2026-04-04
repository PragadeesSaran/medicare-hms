import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import departmentsRouter from "./departments";
import patientsRouter from "./patients";
import doctorsRouter from "./doctors";
import appointmentsRouter from "./appointments";
import prescriptionsRouter from "./prescriptions";
import billsRouter from "./bills";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(departmentsRouter);
router.use(patientsRouter);
router.use(doctorsRouter);
router.use(appointmentsRouter);
router.use(prescriptionsRouter);
router.use(billsRouter);
router.use(dashboardRouter);

export default router;

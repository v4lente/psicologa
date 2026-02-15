import { Router } from "express";
import { authMiddleware } from "../../shared/middlewares/authMiddleware.js";
import { create, list, updateStatus } from "./appointments.controller.js";

const router = Router();

router.post("/public/appointments", create);

router.get("/admin/appointments", authMiddleware, list);
router.patch("/admin/appointments/:id/status", authMiddleware, updateStatus);

export const appointmentRoutes = router;

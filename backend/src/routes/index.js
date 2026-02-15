import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { availabilityRoutes } from "../modules/availability/availability.routes.js";
import { appointmentRoutes } from "../modules/appointments/appointments.routes.js";
import { contentRoutes } from "../modules/content/content.routes.js";
import { integrationsRoutes } from "../modules/integrations/integrations.routes.js";

const router = Router();

router.use(authRoutes);
router.use(availabilityRoutes);
router.use(appointmentRoutes);
router.use(contentRoutes);
router.use(integrationsRoutes);

export { router };

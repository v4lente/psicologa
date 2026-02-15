import { Router } from "express";
import { authMiddleware } from "../../shared/middlewares/authMiddleware.js";
import { authUrl, callback, disconnect, status } from "./google/google.controller.js";

const router = Router();

router.get("/admin/integrations/google/status", authMiddleware, status);
router.get("/admin/integrations/google/auth-url", authMiddleware, authUrl);
router.delete("/admin/integrations/google", authMiddleware, disconnect);
router.get("/admin/integrations/google/callback", callback);

export const integrationsRoutes = router;

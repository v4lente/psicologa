import { Router } from "express";
import { authMiddleware } from "../../shared/middlewares/authMiddleware.js";
import { login, me } from "./auth.controller.js";

const router = Router();

router.post("/auth/login", login);
router.get("/auth/me", authMiddleware, me);

export const authRoutes = router;

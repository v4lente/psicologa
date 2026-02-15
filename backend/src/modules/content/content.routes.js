import { Router } from "express";
import { authMiddleware } from "../../shared/middlewares/authMiddleware.js";
import { create, listAdmin, listPublic, remove, update } from "./content.controller.js";

const router = Router();

router.get("/public/contents", listPublic);

router.get("/admin/contents", authMiddleware, listAdmin);
router.post("/admin/contents", authMiddleware, create);
router.put("/admin/contents/:id", authMiddleware, update);
router.delete("/admin/contents/:id", authMiddleware, remove);

export const contentRoutes = router;

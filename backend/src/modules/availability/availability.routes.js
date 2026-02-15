import { Router } from "express";
import { authMiddleware } from "../../shared/middlewares/authMiddleware.js";
import {
  create,
  listAdmin,
  listPublic,
  listSlots,
  remove,
  update
} from "./availability.controller.js";

const router = Router();

router.get("/public/availabilities", listPublic);
router.get("/public/slots", listSlots);

router.get("/admin/availabilities", authMiddleware, listAdmin);
router.post("/admin/availabilities", authMiddleware, create);
router.put("/admin/availabilities/:id", authMiddleware, update);
router.delete("/admin/availabilities/:id", authMiddleware, remove);

export const availabilityRoutes = router;

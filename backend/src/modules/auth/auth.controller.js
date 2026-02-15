import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { loginSchema } from "./auth.schema.js";
import { loginAdmin } from "./auth.service.js";

export const login = asyncHandler(async (req, res) => {
  const payload = loginSchema.parse(req.body);
  const data = await loginAdmin(payload);
  res.json(data);
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

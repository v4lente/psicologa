import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { availabilitySchema, dateQuerySchema } from "./availability.schema.js";
import {
  createAvailability,
  deleteAvailability,
  getSlotsByDate,
  listAdminAvailabilities,
  listPublicAvailabilities,
  updateAvailability
} from "./availability.service.js";

export const listPublic = asyncHandler(async (req, res) => {
  const data = await listPublicAvailabilities();
  res.json(data);
});

export const listAdmin = asyncHandler(async (req, res) => {
  const data = await listAdminAvailabilities();
  res.json(data);
});

export const create = asyncHandler(async (req, res) => {
  const payload = availabilitySchema.parse(req.body);
  const data = await createAvailability(payload);
  res.status(201).json(data);
});

export const update = asyncHandler(async (req, res) => {
  const payload = availabilitySchema.parse(req.body);
  await updateAvailability(Number(req.params.id), payload);
  res.status(204).send();
});

export const remove = asyncHandler(async (req, res) => {
  await deleteAvailability(Number(req.params.id));
  res.status(204).send();
});

export const listSlots = asyncHandler(async (req, res) => {
  const { date } = dateQuerySchema.parse(req.query);
  const data = await getSlotsByDate(date, true);
  res.json(data);
});

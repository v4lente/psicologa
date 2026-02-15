import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema
} from "./appointments.schema.js";
import {
  createAppointment,
  listAppointments,
  updateAppointmentStatus
} from "./appointments.service.js";

export const create = asyncHandler(async (req, res) => {
  const payload = createAppointmentSchema.parse(req.body);
  const data = await createAppointment(payload);
  res.status(201).json(data);
});

export const list = asyncHandler(async (req, res) => {
  const data = await listAppointments({
    dateFrom: req.query.dateFrom,
    dateTo: req.query.dateTo,
    status: req.query.status
  });
  res.json(data);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = updateAppointmentStatusSchema.parse(req.body);
  await updateAppointmentStatus(Number(req.params.id), status);
  res.status(204).send();
});

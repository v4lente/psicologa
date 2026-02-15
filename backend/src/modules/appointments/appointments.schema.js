import { z } from "zod";
import { isValidTime } from "../../shared/utils/time.js";

export const createAppointmentSchema = z.object({
  patientName: z.string().min(3, "Nome e obrigatorio"),
  email: z.string().email("Email invalido"),
  phone: z.string().min(8, "Telefone invalido"),
  notes: z.string().max(1000).optional().default(""),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve ser YYYY-MM-DD"),
  startTime: z
    .string()
    .refine((value) => isValidTime(value), "Horario deve seguir HH:MM")
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(["scheduled", "confirmed", "cancelled", "completed"])
});

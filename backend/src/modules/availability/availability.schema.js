import { z } from "zod";
import { isValidTime } from "../../shared/utils/time.js";

const timeField = z
  .string()
  .refine((value) => isValidTime(value), "Horario deve seguir HH:MM");

export const availabilitySchema = z
  .object({
    weekday: z.number().int().min(0).max(6),
    startTime: timeField,
    endTime: timeField,
    slotMinutes: z.number().int().min(20).max(120),
    isActive: z.boolean().optional().default(true)
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "startTime deve ser menor que endTime",
    path: ["startTime"]
  });

export const dateQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve ser YYYY-MM-DD")
});

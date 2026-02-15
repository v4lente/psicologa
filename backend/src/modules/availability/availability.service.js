import dayjs from "dayjs";
import { db } from "../../config/db.js";
import { AppError } from "../../shared/errors/AppError.js";
import { minutesToTime, timeToMinutes } from "../../shared/utils/time.js";

export async function listAdminAvailabilities() {
  const [rows] = await db.query(
    "SELECT id, weekday, TIME_FORMAT(start_time, '%H:%i') AS startTime, TIME_FORMAT(end_time, '%H:%i') AS endTime, slot_minutes AS slotMinutes, is_active AS isActive FROM availabilities ORDER BY weekday, start_time"
  );
  return rows;
}

export async function listPublicAvailabilities() {
  const [rows] = await db.query(
    "SELECT id, weekday, TIME_FORMAT(start_time, '%H:%i') AS startTime, TIME_FORMAT(end_time, '%H:%i') AS endTime, slot_minutes AS slotMinutes FROM availabilities WHERE is_active = 1 ORDER BY weekday, start_time"
  );
  return rows;
}

export async function createAvailability(payload) {
  const [result] = await db.query(
    "INSERT INTO availabilities (weekday, start_time, end_time, slot_minutes, is_active) VALUES (?, ?, ?, ?, ?)",
    [
      payload.weekday,
      payload.startTime,
      payload.endTime,
      payload.slotMinutes,
      payload.isActive ? 1 : 0
    ]
  );
  return { id: result.insertId };
}

export async function updateAvailability(id, payload) {
  const [result] = await db.query(
    "UPDATE availabilities SET weekday = ?, start_time = ?, end_time = ?, slot_minutes = ?, is_active = ?, updated_at = NOW() WHERE id = ?",
    [
      payload.weekday,
      payload.startTime,
      payload.endTime,
      payload.slotMinutes,
      payload.isActive ? 1 : 0,
      id
    ]
  );
  if (result.affectedRows === 0) {
    throw new AppError("Disponibilidade nao encontrada", 404);
  }
}

export async function deleteAvailability(id) {
  const [result] = await db.query("DELETE FROM availabilities WHERE id = ?", [id]);
  if (result.affectedRows === 0) {
    throw new AppError("Disponibilidade nao encontrada", 404);
  }
}

export async function getSlotsByDate(date, includeBooked = true) {
  const parsed = dayjs(date, "YYYY-MM-DD", true);
  if (!parsed.isValid()) {
    throw new AppError("Data invalida", 422);
  }

  const weekday = parsed.day();
  const [rules] = await db.query(
    "SELECT TIME_FORMAT(start_time, '%H:%i') AS startTime, TIME_FORMAT(end_time, '%H:%i') AS endTime, slot_minutes AS slotMinutes FROM availabilities WHERE weekday = ? AND is_active = 1 ORDER BY start_time",
    [weekday]
  );

  if (rules.length === 0) {
    return [];
  }

  const [appointments] = await db.query(
    "SELECT TIME_FORMAT(start_time, '%H:%i') AS startTime FROM appointments WHERE date = ? AND status IN ('scheduled', 'confirmed')",
    [date]
  );
  const booked = new Set(appointments.map((item) => item.startTime));

  const now = dayjs();
  const slots = [];
  for (const rule of rules) {
    let pointer = timeToMinutes(rule.startTime);
    const limit = timeToMinutes(rule.endTime);
    while (pointer + rule.slotMinutes <= limit) {
      const startTime = minutesToTime(pointer);
      const endTime = minutesToTime(pointer + rule.slotMinutes);
      const slotDateTime = dayjs(`${date} ${startTime}`);
      const isPast = slotDateTime.isBefore(now);
      const isBooked = booked.has(startTime);
      const isAvailable = !isPast && !isBooked;
      if (includeBooked || isAvailable) {
        slots.push({ startTime, endTime, isAvailable });
      }
      pointer += rule.slotMinutes;
    }
  }

  return slots;
}

export async function ensureSlotIsAvailable(date, startTime) {
  const slots = await getSlotsByDate(date, true);
  const slot = slots.find((item) => item.startTime === startTime);
  if (!slot || !slot.isAvailable) {
    throw new AppError("Horario indisponivel", 409);
  }
  return slot;
}

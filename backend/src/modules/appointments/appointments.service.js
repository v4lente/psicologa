import { db } from "../../config/db.js";
import { AppError } from "../../shared/errors/AppError.js";
import { ensureSlotIsAvailable } from "../availability/availability.service.js";
import { createGoogleCalendarEventForAppointment } from "../integrations/google/google.service.js";
import { sendAppointmentWhatsappMessage } from "../integrations/whatsapp/whatsapp.service.js";

export async function createAppointment(payload) {
  const slot = await ensureSlotIsAvailable(payload.date, payload.startTime);

  const [result] = await db.query(
    "INSERT INTO appointments (patient_name, email, phone, notes, date, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')",
    [
      payload.patientName,
      payload.email,
      payload.phone,
      payload.notes,
      payload.date,
      payload.startTime,
      slot.endTime
    ]
  );

  const appointment = {
    id: result.insertId,
    patientName: payload.patientName,
    email: payload.email,
    phone: payload.phone,
    notes: payload.notes,
    date: payload.date,
    startTime: payload.startTime,
    endTime: slot.endTime
  };

  let googleResult = {
    status: "not_configured",
    eventId: null,
    meetLink: null,
    error: null
  };
  try {
    googleResult = await createGoogleCalendarEventForAppointment(appointment);
  } catch (error) {
    googleResult = {
      status: "failed",
      eventId: null,
      meetLink: null,
      error: error?.message || "Falha ao criar evento no Google Calendar"
    };
  }

  let whatsappResult = {
    status: "not_configured",
    messageId: null,
    error: null
  };
  try {
    whatsappResult = await sendAppointmentWhatsappMessage({
      ...appointment,
      meetLink: googleResult.meetLink
    });
  } catch (error) {
    whatsappResult = {
      status: "failed",
      messageId: null,
      error: error?.message || "Falha ao enviar mensagem no WhatsApp"
    };
  }

  const integrationErrors = [googleResult.error, whatsappResult.error]
    .filter(Boolean)
    .join(" | ")
    .slice(0, 1000);

  await db.query(
    `
      UPDATE appointments
      SET
        google_event_id = ?,
        google_meet_link = ?,
        google_calendar_status = ?,
        whatsapp_message_id = ?,
        whatsapp_status = ?,
        integration_error = ?,
        updated_at = NOW()
      WHERE id = ?
    `,
    [
      googleResult.eventId,
      googleResult.meetLink,
      googleResult.status,
      whatsappResult.messageId,
      whatsappResult.status,
      integrationErrors || null,
      result.insertId
    ]
  );

  return {
    id: result.insertId,
    meetLink: googleResult.meetLink,
    googleCalendarStatus: googleResult.status,
    whatsappStatus: whatsappResult.status
  };
}

export async function listAppointments({ dateFrom, dateTo, status }) {
  const filters = [];
  const params = [];

  if (dateFrom) {
    filters.push("date >= ?");
    params.push(dateFrom);
  }
  if (dateTo) {
    filters.push("date <= ?");
    params.push(dateTo);
  }
  if (status) {
    filters.push("status = ?");
    params.push(status);
  }

  const whereSql = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";
  const [rows] = await db.query(
    `
      SELECT
        id,
        patient_name AS patientName,
        email,
        phone,
        notes,
        date,
        TIME_FORMAT(start_time, '%H:%i') AS startTime,
        TIME_FORMAT(end_time, '%H:%i') AS endTime,
        google_event_id AS googleEventId,
        google_meet_link AS googleMeetLink,
        google_calendar_status AS googleCalendarStatus,
        whatsapp_message_id AS whatsappMessageId,
        whatsapp_status AS whatsappStatus,
        integration_error AS integrationError,
        status,
        created_at AS createdAt
      FROM appointments
      ${whereSql}
      ORDER BY date DESC, start_time DESC
    `,
    params
  );

  return rows;
}

export async function updateAppointmentStatus(id, status) {
  const [result] = await db.query(
    "UPDATE appointments SET status = ?, updated_at = NOW() WHERE id = ?",
    [status, id]
  );

  if (result.affectedRows === 0) {
    throw new AppError("Agendamento nao encontrado", 404);
  }
}

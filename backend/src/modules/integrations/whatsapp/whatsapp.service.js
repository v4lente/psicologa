import { env } from "../../../config/env.js";

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  if (digits.startsWith(env.whatsappDefaultCountryCode)) {
    return digits;
  }
  return `${env.whatsappDefaultCountryCode}${digits}`;
}

function buildMessageBody({ patientName, date, startTime, meetLink }) {
  const lines = [
    `Oi ${patientName}, seu agendamento foi confirmado.`,
    `Data: ${date}`,
    `Horario: ${startTime}`,
    "Profissional: Thais Coletto (CRP 07/34396)"
  ];
  if (meetLink) {
    lines.push(`Link Google Meet: ${meetLink}`);
  }
  lines.push("Qualquer duvida, responda esta mensagem.");
  return lines.join("\n");
}

function isWhatsappConfigured() {
  return Boolean(
    env.whatsappEnabled &&
      env.whatsappPhoneNumberId &&
      env.whatsappAccessToken &&
      env.whatsappApiVersion
  );
}

export async function sendAppointmentWhatsappMessage(appointment) {
  if (!isWhatsappConfigured()) {
    return {
      status: "not_configured",
      messageId: null
    };
  }

  const normalizedPhone = normalizePhone(appointment.phone);
  if (!normalizedPhone) {
    return {
      status: "failed",
      messageId: null,
      error: "Telefone invalido para envio no WhatsApp"
    };
  }

  const url = `https://graph.facebook.com/${env.whatsappApiVersion}/${env.whatsappPhoneNumberId}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to: normalizedPhone,
    type: "text",
    text: {
      preview_url: false,
      body: buildMessageBody(appointment)
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.whatsappAccessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return {
      status: "failed",
      messageId: null,
      error: data?.error?.message || "Falha ao enviar mensagem WhatsApp"
    };
  }

  return {
    status: "sent",
    messageId: data?.messages?.[0]?.id || null
  };
}

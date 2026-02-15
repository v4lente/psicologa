import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { google } from "googleapis";
import { db } from "../../../config/db.js";
import { env } from "../../../config/env.js";
import { AppError } from "../../../shared/errors/AppError.js";

const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email"
];

function isGoogleEnvConfigured() {
  return Boolean(env.googleClientId && env.googleClientSecret && env.googleRedirectUri);
}

function getOAuthClient() {
  return new google.auth.OAuth2(
    env.googleClientId,
    env.googleClientSecret,
    env.googleRedirectUri
  );
}

function normalizeReturnTo(returnTo = "/admin?tab=integrations") {
  if (typeof returnTo !== "string" || !returnTo.startsWith("/")) {
    return "/admin?tab=integrations";
  }
  return returnTo;
}

function signOAuthState({ userId, returnTo }) {
  return jwt.sign(
    { userId, returnTo: normalizeReturnTo(returnTo), type: "google_oauth_state" },
    env.integrationStateSecret,
    { expiresIn: "15m" }
  );
}

function verifyOAuthState(stateToken) {
  try {
    const payload = jwt.verify(stateToken, env.integrationStateSecret);
    if (payload.type !== "google_oauth_state") {
      throw new AppError("State invalido", 400);
    }
    return payload;
  } catch {
    throw new AppError("State invalido ou expirado", 400);
  }
}

async function getGoogleIntegrationByUser(userId) {
  try {
    const [rows] = await db.query(
      `
        SELECT
          id,
          user_id AS userId,
          google_email AS googleEmail,
          refresh_token AS refreshToken,
          access_token AS accessToken,
          token_expiry_date AS tokenExpiryDate,
          token_scope AS tokenScope,
          token_type AS tokenType,
          calendar_id AS calendarId
        FROM google_integrations
        WHERE user_id = ?
        LIMIT 1
      `,
      [userId]
    );
    return rows[0] || null;
  } catch (error) {
    if (error?.code === "ER_NO_SUCH_TABLE") {
      return null;
    }
    throw error;
  }
}

async function saveGoogleIntegration({ userId, googleEmail, tokens }) {
  const existing = await getGoogleIntegrationByUser(userId);
  const refreshToken = tokens.refresh_token || existing?.refreshToken;
  if (!refreshToken) {
    throw new AppError(
      "Google nao retornou refresh token. Remova permissao anterior e tente novamente com consentimento.",
      400
    );
  }

  const accessToken = tokens.access_token || existing?.accessToken || null;
  const tokenExpiryDate = tokens.expiry_date || existing?.tokenExpiryDate || null;
  const tokenScope = tokens.scope || existing?.tokenScope || null;
  const tokenType = tokens.token_type || existing?.tokenType || null;

  if (existing) {
    await db.query(
      `
        UPDATE google_integrations
        SET
          google_email = ?,
          refresh_token = ?,
          access_token = ?,
          token_expiry_date = ?,
          token_scope = ?,
          token_type = ?,
          calendar_id = ?,
          updated_at = NOW()
        WHERE user_id = ?
      `,
      [
        googleEmail,
        refreshToken,
        accessToken,
        tokenExpiryDate,
        tokenScope,
        tokenType,
        env.googleCalendarId,
        userId
      ]
    );
    return;
  }

  try {
    await db.query(
      `
        INSERT INTO google_integrations
        (user_id, google_email, refresh_token, access_token, token_expiry_date, token_scope, token_type, calendar_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        googleEmail,
        refreshToken,
        accessToken,
        tokenExpiryDate,
        tokenScope,
        tokenType,
        env.googleCalendarId
      ]
    );
  } catch (error) {
    if (error?.code === "ER_NO_SUCH_TABLE") {
      throw new AppError(
        "Tabela google_integrations ausente. Execute a migracao SQL de integracoes.",
        500
      );
    }
    throw error;
  }
}

function encodeCallbackStatus({ connected, error, returnTo }) {
  const base = normalizeReturnTo(returnTo);
  const url = new URL(base, env.frontendOriginPrimary);
  if (connected) {
    url.searchParams.set("google", "connected");
  } else {
    url.searchParams.set("google", "error");
    if (error) {
      url.searchParams.set("message", error);
    }
  }
  return url.toString();
}

export async function getGoogleIntegrationStatus(userId) {
  if (!isGoogleEnvConfigured()) {
    return {
      configured: false,
      connected: false,
      message:
        "Configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_REDIRECT_URI para ativar."
    };
  }

  const integration = await getGoogleIntegrationByUser(userId);
  if (!integration) {
    return {
      configured: true,
      connected: false,
      message: "Conta Google ainda nao vinculada."
    };
  }

  return {
    configured: true,
    connected: true,
    googleEmail: integration.googleEmail,
    calendarId: integration.calendarId,
    tokenScope: integration.tokenScope
  };
}

export function createGoogleAuthUrl(userId, returnTo) {
  if (!isGoogleEnvConfigured()) {
    throw new AppError(
      "Integracao Google nao configurada no servidor. Verifique variaveis de ambiente.",
      400
    );
  }

  const oauthClient = getOAuthClient();
  const state = signOAuthState({ userId, returnTo });
  const authUrl = oauthClient.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: true,
    scope: GOOGLE_SCOPES,
    state
  });

  return { authUrl };
}

export async function handleGoogleOAuthCallback({ code, state }) {
  if (!code || !state) {
    return encodeCallbackStatus({
      connected: false,
      error: "Parametros de callback invalidos",
      returnTo: "/admin?tab=integrations"
    });
  }

  let payload;
  try {
    payload = verifyOAuthState(state);
  } catch (error) {
    return encodeCallbackStatus({
      connected: false,
      error: error.message,
      returnTo: "/admin?tab=integrations"
    });
  }

  try {
    const oauthClient = getOAuthClient();
    const { tokens } = await oauthClient.getToken(code);
    oauthClient.setCredentials(tokens);

    const oauth2Api = google.oauth2({ version: "v2", auth: oauthClient });
    const userInfo = await oauth2Api.userinfo.get();
    const googleEmail = userInfo?.data?.email;
    if (!googleEmail) {
      throw new AppError("Nao foi possivel identificar o email da conta Google", 400);
    }

    await saveGoogleIntegration({
      userId: Number(payload.userId),
      googleEmail,
      tokens
    });

    return encodeCallbackStatus({
      connected: true,
      returnTo: payload.returnTo
    });
  } catch (error) {
    return encodeCallbackStatus({
      connected: false,
      error: error?.message || "Falha ao vincular conta Google",
      returnTo: payload.returnTo
    });
  }
}

export async function disconnectGoogleIntegration(userId) {
  await db.query("DELETE FROM google_integrations WHERE user_id = ?", [userId]);
}

function attachTokenAutoSave(oauthClient, integration) {
  let currentRefreshToken = integration.refreshToken;
  oauthClient.on("tokens", async (tokens) => {
    try {
      if (!tokens?.access_token && !tokens?.refresh_token) {
        return;
      }
      currentRefreshToken = tokens.refresh_token || currentRefreshToken;
      await db.query(
        `
          UPDATE google_integrations
          SET
            refresh_token = ?,
            access_token = ?,
            token_expiry_date = ?,
            token_scope = ?,
            token_type = ?,
            updated_at = NOW()
          WHERE id = ?
        `,
        [
          currentRefreshToken,
          tokens.access_token || integration.accessToken || null,
          tokens.expiry_date || integration.tokenExpiryDate || null,
          tokens.scope || integration.tokenScope || null,
          tokens.token_type || integration.tokenType || null,
          integration.id
        ]
      );
    } catch (error) {
      console.error("Falha ao salvar refresh de token Google:", error);
    }
  });
}

async function getActiveAdminGoogleIntegration() {
  if (!isGoogleEnvConfigured()) {
    return null;
  }

  try {
    const [rows] = await db.query(
      `
        SELECT
          gi.id,
          gi.user_id AS userId,
          gi.google_email AS googleEmail,
          gi.refresh_token AS refreshToken,
          gi.access_token AS accessToken,
          gi.token_expiry_date AS tokenExpiryDate,
          gi.token_scope AS tokenScope,
          gi.token_type AS tokenType,
          gi.calendar_id AS calendarId
        FROM google_integrations gi
        INNER JOIN users u ON u.id = gi.user_id
        WHERE u.role = 'admin'
        ORDER BY gi.updated_at DESC
        LIMIT 1
      `
    );

    return rows[0] || null;
  } catch (error) {
    if (error?.code === "ER_NO_SUCH_TABLE") {
      return null;
    }
    throw error;
  }
}

function getMeetLinkFromEvent(eventData) {
  const direct = eventData?.hangoutLink;
  if (direct) {
    return direct;
  }

  const entryPoints = eventData?.conferenceData?.entryPoints || [];
  const video = entryPoints.find((item) => item.entryPointType === "video");
  return video?.uri || null;
}

export async function createGoogleCalendarEventForAppointment(appointment) {
  const integration = await getActiveAdminGoogleIntegration();
  if (!integration) {
    return {
      status: "not_configured",
      eventId: null,
      meetLink: null
    };
  }

  const oauthClient = getOAuthClient();
  oauthClient.setCredentials({
    refresh_token: integration.refreshToken,
    access_token: integration.accessToken,
    expiry_date: integration.tokenExpiryDate
  });
  attachTokenAutoSave(oauthClient, integration);

  const calendarApi = google.calendar({ version: "v3", auth: oauthClient });
  const eventPayload = {
    summary: `Sessao psicologica - ${appointment.patientName}`,
    description: [
      "Agendamento realizado pelo site.",
      `Paciente: ${appointment.patientName}`,
      `Email: ${appointment.email}`,
      `Telefone: ${appointment.phone}`,
      appointment.notes ? `Observacoes: ${appointment.notes}` : null
    ]
      .filter(Boolean)
      .join("\n"),
    start: {
      dateTime: `${appointment.date}T${appointment.startTime}:00`,
      timeZone: env.googleTimezone
    },
    end: {
      dateTime: `${appointment.date}T${appointment.endTime}:00`,
      timeZone: env.googleTimezone
    },
    attendees: [{ email: appointment.email }],
    conferenceData: {
      createRequest: {
        requestId: randomUUID(),
        conferenceSolutionKey: { type: "hangoutsMeet" }
      }
    }
  };

  const response = await calendarApi.events.insert({
    calendarId: integration.calendarId || env.googleCalendarId,
    sendUpdates: "all",
    conferenceDataVersion: 1,
    requestBody: eventPayload
  });

  return {
    status: "created",
    eventId: response.data.id || null,
    meetLink: getMeetLinkFromEvent(response.data)
  };
}

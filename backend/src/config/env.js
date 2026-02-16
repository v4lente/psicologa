import dotenv from "dotenv";

dotenv.config();

function parseDatabaseUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return {
      host: url.hostname || "",
      port: url.port ? Number(url.port) : 3306,
      user: decodeURIComponent(url.username || ""),
      password: decodeURIComponent(url.password || ""),
      name: (url.pathname || "").replace(/^\//, "")
    };
  } catch {
    return null;
  }
}

const parsedDbUrl =
  parseDatabaseUrl(process.env.DATABASE_URL) || parseDatabaseUrl(process.env.DB_URL);

const resolvedDbHost = process.env.DB_HOST || parsedDbUrl?.host || "";
const resolvedDbPort = Number(process.env.DB_PORT || parsedDbUrl?.port || 3306);
const resolvedDbUser = process.env.DB_USER || parsedDbUrl?.user || "";
const resolvedDbPassword =
  process.env.DB_PASSWORD !== undefined
    ? process.env.DB_PASSWORD
    : parsedDbUrl?.password || "";
const resolvedDbName = process.env.DB_NAME || parsedDbUrl?.name || "";
const resolvedJwtSecret =
  process.env.JWT_SECRET ||
  process.env.SESSION_SECRET ||
  process.env.INTEGRATION_STATE_SECRET ||
  "";

if (!resolvedJwtSecret) {
  throw new Error(
    "Variavel obrigatoria ausente: JWT_SECRET (ou SESSION_SECRET/INTEGRATION_STATE_SECRET)"
  );
}

if (!resolvedDbHost) {
  throw new Error("Variavel obrigatoria ausente: DB_HOST (ou DATABASE_URL)");
}
if (!resolvedDbUser) {
  throw new Error("Variavel obrigatoria ausente: DB_USER (ou DATABASE_URL)");
}
if (!resolvedDbName) {
  throw new Error("Variavel obrigatoria ausente: DB_NAME (ou DATABASE_URL)");
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(
    process.env.PORT || process.env.APP_PORT || process.env.HOSTINGER_PORT || 3000
  ),
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  frontendOriginPrimary: (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)[0],
  dbHost: resolvedDbHost,
  dbPort: resolvedDbPort,
  dbUser: resolvedDbUser,
  dbPassword: resolvedDbPassword,
  dbName: resolvedDbName,
  jwtSecret: resolvedJwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "12h",
  adminName: process.env.ADMIN_NAME || "Administrador",
  adminEmail: process.env.ADMIN_EMAIL || "admin@thaiscoletto.com.br",
  adminPassword: process.env.ADMIN_PASSWORD || "admin123",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  googleRedirectUri:
    process.env.GOOGLE_REDIRECT_URI ||
    "http://localhost:4000/api/admin/integrations/google/callback",
  googleCalendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
  googleTimezone: process.env.GOOGLE_TIMEZONE || "America/Sao_Paulo",
  integrationStateSecret:
    process.env.INTEGRATION_STATE_SECRET || resolvedJwtSecret,
  whatsappEnabled: String(process.env.WHATSAPP_ENABLED || "false") === "true",
  whatsappApiVersion: process.env.WHATSAPP_API_VERSION || "v23.0",
  whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  whatsappAccessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
  whatsappDefaultCountryCode: process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "55",
  autoMigrate: String(process.env.AUTO_MIGRATE || "true") === "true"
};

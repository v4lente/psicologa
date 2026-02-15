import dotenv from "dotenv";

dotenv.config();

const requiredKeys = ["DB_HOST", "DB_USER", "DB_NAME", "JWT_SECRET"];

for (const key of requiredKeys) {
  if (!process.env[key]) {
    throw new Error(`Variavel obrigatoria ausente: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  frontendOriginPrimary: (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)[0],
  dbHost: process.env.DB_HOST,
  dbPort: Number(process.env.DB_PORT || 3306),
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD || "",
  dbName: process.env.DB_NAME,
  jwtSecret: process.env.JWT_SECRET,
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
    process.env.INTEGRATION_STATE_SECRET || process.env.JWT_SECRET,
  whatsappEnabled: String(process.env.WHATSAPP_ENABLED || "false") === "true",
  whatsappApiVersion: process.env.WHATSAPP_API_VERSION || "v23.0",
  whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  whatsappAccessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
  whatsappDefaultCountryCode: process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "55",
  autoMigrate: String(process.env.AUTO_MIGRATE || "true") === "true"
};

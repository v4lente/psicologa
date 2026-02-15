import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { router } from "./routes/index.js";
import { errorHandler } from "./shared/middlewares/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");
const hasFrontendBuild = fs.existsSync(path.join(frontendDistPath, "index.html"));

export const app = express();

app.use(
  cors({
    origin: env.frontendOrigin.split(",").map((origin) => origin.trim()),
    credentials: false
  })
);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use("/api", router);

app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "Rota de API nao encontrada" });
});

if (hasFrontendBuild) {
  app.use(express.static(frontendDistPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

app.use(errorHandler);

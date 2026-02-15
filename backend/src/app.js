import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { router } from "./routes/index.js";
import { errorHandler } from "./shared/middlewares/errorHandler.js";

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
app.use(errorHandler);

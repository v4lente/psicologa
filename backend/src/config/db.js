import mysql from "mysql2/promise";
import { env } from "./env.js";

export const db = mysql.createPool({
  host: env.dbHost,
  port: env.dbPort,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
});

export async function pingDatabase() {
  await db.query("SELECT 1");
}

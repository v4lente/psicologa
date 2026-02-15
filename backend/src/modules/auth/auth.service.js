import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../../config/db.js";
import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/AppError.js";

export async function loginAdmin({ email, password }) {
  const [rows] = await db.query(
    "SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  const user = rows[0];
  if (!user || user.role !== "admin") {
    throw new AppError("Credenciais invalidas", 401);
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw new AppError("Credenciais invalidas", 401);
  }

  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
      name: user.name
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}

export async function ensureAdminUser() {
  const [rows] = await db.query(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [env.adminEmail]
  );

  if (rows.length > 0) {
    return;
  }

  const passwordHash = await bcrypt.hash(env.adminPassword, 10);

  await db.query(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')",
    [env.adminName, env.adminEmail, passwordHash]
  );

  console.log(`Admin inicial criado: ${env.adminEmail}`);
}

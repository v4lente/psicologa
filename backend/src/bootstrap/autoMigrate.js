import mysql from "mysql2/promise";
import { env } from "../config/env.js";

async function databaseConnectionWithoutSchema() {
  return mysql.createConnection({
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUser,
    password: env.dbPassword
  });
}

async function databaseConnectionWithSchema() {
  return mysql.createConnection({
    host: env.dbHost,
    port: env.dbPort,
    user: env.dbUser,
    password: env.dbPassword,
    database: env.dbName
  });
}

async function tableExists(conn, tableName) {
  const [rows] = await conn.query(
    `
      SELECT COUNT(*) AS count
      FROM information_schema.tables
      WHERE table_schema = ? AND table_name = ?
    `,
    [env.dbName, tableName]
  );
  return Number(rows[0]?.count || 0) > 0;
}

async function columnExists(conn, tableName, columnName) {
  const [rows] = await conn.query(
    `
      SELECT COUNT(*) AS count
      FROM information_schema.columns
      WHERE table_schema = ? AND table_name = ? AND column_name = ?
    `,
    [env.dbName, tableName, columnName]
  );
  return Number(rows[0]?.count || 0) > 0;
}

async function indexExists(conn, tableName, indexName) {
  const [rows] = await conn.query(
    `
      SELECT COUNT(*) AS count
      FROM information_schema.statistics
      WHERE table_schema = ? AND table_name = ? AND index_name = ?
    `,
    [env.dbName, tableName, indexName]
  );
  return Number(rows[0]?.count || 0) > 0;
}

async function ensureColumn(conn, tableName, columnName, definitionSql) {
  const exists = await columnExists(conn, tableName, columnName);
  if (exists) {
    return;
  }
  await conn.query(`ALTER TABLE \`${tableName}\` ADD COLUMN ${definitionSql}`);
}

async function ensureIndex(conn, tableName, indexName, addIndexSql) {
  const exists = await indexExists(conn, tableName, indexName);
  if (exists) {
    return;
  }
  await conn.query(`ALTER TABLE \`${tableName}\` ADD ${addIndexSql}`);
}

async function ensureBaseTables(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin') NOT NULL DEFAULT 'admin',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS availabilities (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      weekday TINYINT NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      slot_minutes SMALLINT NOT NULL DEFAULT 50,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      patient_name VARCHAR(120) NOT NULL,
      email VARCHAR(150) NOT NULL,
      phone VARCHAR(30) NOT NULL,
      notes TEXT,
      date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      status ENUM('scheduled', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'scheduled',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS contents (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(180) NOT NULL,
      slug VARCHAR(220) NOT NULL UNIQUE,
      excerpt VARCHAR(320) NOT NULL,
      body TEXT NOT NULL,
      is_featured BOOLEAN NOT NULL DEFAULT FALSE,
      published_at DATETIME NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS google_integrations (
      id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NOT NULL,
      google_email VARCHAR(150) NOT NULL,
      refresh_token TEXT NOT NULL,
      access_token TEXT NULL,
      token_expiry_date BIGINT NULL,
      token_scope TEXT NULL,
      token_type VARCHAR(50) NULL,
      calendar_id VARCHAR(150) NOT NULL DEFAULT 'primary',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_google_integrations_user (user_id),
      CONSTRAINT fk_google_integrations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
}

async function ensureBaseIndexes(conn) {
  await ensureIndex(
    conn,
    "availabilities",
    "idx_availability_weekday",
    "INDEX idx_availability_weekday (weekday)"
  );

  await ensureIndex(
    conn,
    "appointments",
    "uk_appointments_slot",
    "UNIQUE KEY uk_appointments_slot (`date`, start_time)"
  );
  await ensureIndex(
    conn,
    "appointments",
    "idx_appointments_date",
    "INDEX idx_appointments_date (`date`)"
  );
  await ensureIndex(
    conn,
    "appointments",
    "idx_appointments_status",
    "INDEX idx_appointments_status (status)"
  );

  await ensureIndex(
    conn,
    "contents",
    "idx_contents_published",
    "INDEX idx_contents_published (published_at)"
  );
  await ensureIndex(
    conn,
    "contents",
    "idx_contents_featured",
    "INDEX idx_contents_featured (is_featured)"
  );
}

async function ensureAppointmentIntegrationColumns(conn) {
  const exists = await tableExists(conn, "appointments");
  if (!exists) {
    return;
  }

  await ensureColumn(conn, "appointments", "google_event_id", "google_event_id VARCHAR(255) NULL AFTER end_time");
  await ensureColumn(
    conn,
    "appointments",
    "google_meet_link",
    "google_meet_link VARCHAR(255) NULL AFTER google_event_id"
  );
  await ensureColumn(
    conn,
    "appointments",
    "google_calendar_status",
    "google_calendar_status ENUM('not_configured', 'created', 'failed') NOT NULL DEFAULT 'not_configured' AFTER google_meet_link"
  );
  await ensureColumn(
    conn,
    "appointments",
    "whatsapp_message_id",
    "whatsapp_message_id VARCHAR(255) NULL AFTER google_calendar_status"
  );
  await ensureColumn(
    conn,
    "appointments",
    "whatsapp_status",
    "whatsapp_status ENUM('not_configured', 'sent', 'failed') NOT NULL DEFAULT 'not_configured' AFTER whatsapp_message_id"
  );
  await ensureColumn(
    conn,
    "appointments",
    "integration_error",
    "integration_error TEXT NULL AFTER whatsapp_status"
  );
}

export async function runAutoMigrations() {
  if (!env.autoMigrate) {
    console.log("AUTO_MIGRATE=false: migracao automatica desativada.");
    return;
  }

  console.log(`AUTO_MIGRATE=true: verificando schema '${env.dbName}'...`);

  const connectionNoSchema = await databaseConnectionWithoutSchema();
  try {
    try {
      await connectionNoSchema.query(
        `CREATE DATABASE IF NOT EXISTS \`${env.dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
    } catch (error) {
      const createDbDeniedCodes = ["ER_DBACCESS_DENIED_ERROR", "ER_ACCESS_DENIED_ERROR"];
      if (!createDbDeniedCodes.includes(error?.code)) {
        throw error;
      }
      console.warn(
        `Sem permissao para CREATE DATABASE. Tentando usar schema existente: ${env.dbName}`
      );
    }
  } finally {
    await connectionNoSchema.end();
  }

  let connection;
  try {
    connection = await databaseConnectionWithSchema();
  } catch (error) {
    if (error?.code === "ER_BAD_DB_ERROR") {
      throw new Error(
        `Banco '${env.dbName}' nao existe e o usuario atual nao conseguiu cria-lo automaticamente. Crie o banco no painel MySQL da hospedagem.`
      );
    }
    throw error;
  }

  try {
    await ensureBaseTables(connection);
    await ensureBaseIndexes(connection);
    await ensureAppointmentIntegrationColumns(connection);
    console.log("Migracao automatica concluida com sucesso.");
  } finally {
    await connection.end();
  }
}

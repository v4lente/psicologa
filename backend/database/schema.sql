CREATE DATABASE IF NOT EXISTS psicologa_thais CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE psicologa_thais;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin') NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS availabilities (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  weekday TINYINT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_minutes SMALLINT NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_availability_weekday (weekday)
);

CREATE TABLE IF NOT EXISTS appointments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  patient_name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  notes TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  google_event_id VARCHAR(255) NULL,
  google_meet_link VARCHAR(255) NULL,
  google_calendar_status ENUM('not_configured', 'created', 'failed') NOT NULL DEFAULT 'not_configured',
  whatsapp_message_id VARCHAR(255) NULL,
  whatsapp_status ENUM('not_configured', 'sent', 'failed') NOT NULL DEFAULT 'not_configured',
  integration_error TEXT NULL,
  status ENUM('scheduled', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_appointments_slot (date, start_time),
  INDEX idx_appointments_date (date),
  INDEX idx_appointments_status (status)
);

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
);

CREATE TABLE IF NOT EXISTS contents (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  excerpt VARCHAR(320) NOT NULL,
  body TEXT NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  published_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_contents_published (published_at),
  INDEX idx_contents_featured (is_featured)
);

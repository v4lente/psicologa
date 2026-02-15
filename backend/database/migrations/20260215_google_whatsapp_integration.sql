USE psicologa_thais;

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS google_event_id VARCHAR(255) NULL AFTER end_time,
  ADD COLUMN IF NOT EXISTS google_meet_link VARCHAR(255) NULL AFTER google_event_id,
  ADD COLUMN IF NOT EXISTS google_calendar_status ENUM('not_configured', 'created', 'failed') NOT NULL DEFAULT 'not_configured' AFTER google_meet_link,
  ADD COLUMN IF NOT EXISTS whatsapp_message_id VARCHAR(255) NULL AFTER google_calendar_status,
  ADD COLUMN IF NOT EXISTS whatsapp_status ENUM('not_configured', 'sent', 'failed') NOT NULL DEFAULT 'not_configured' AFTER whatsapp_message_id,
  ADD COLUMN IF NOT EXISTS integration_error TEXT NULL AFTER whatsapp_status;

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

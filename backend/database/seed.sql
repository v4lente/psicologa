USE psicologa_thais;

INSERT INTO availabilities (id, weekday, start_time, end_time, slot_minutes, is_active)
VALUES
  (101, 1, '08:00:00', '12:00:00', 50, TRUE),
  (102, 2, '08:00:00', '12:00:00', 50, TRUE),
  (103, 3, '13:00:00', '18:00:00', 50, TRUE),
  (104, 4, '08:00:00', '12:00:00', 50, TRUE),
  (105, 5, '13:00:00', '18:00:00', 50, TRUE)
ON DUPLICATE KEY UPDATE
  weekday = VALUES(weekday),
  start_time = VALUES(start_time),
  end_time = VALUES(end_time),
  slot_minutes = VALUES(slot_minutes),
  is_active = VALUES(is_active),
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO contents (title, slug, excerpt, body, is_featured, published_at)
VALUES
  (
    'Como a avaliacao psicologica pode ajudar no seu desenvolvimento',
    'avaliacao-psicologica-desenvolvimento',
    'Entenda como o processo de avaliacao psicologica apoia autoconhecimento e tomada de decisao.',
    'A avaliacao psicologica e um processo tecnico e humano que observa padroes cognitivos, emocionais e comportamentais. Com instrumentos cientificos e escuta qualificada, e possivel construir um plano de cuidado mais preciso.',
    TRUE,
    NOW()
  )
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

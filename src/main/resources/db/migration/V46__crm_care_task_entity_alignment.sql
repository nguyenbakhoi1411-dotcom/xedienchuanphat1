ALTER TABLE crm_care_tasks
    ADD COLUMN IF NOT EXISTS lead_id BIGINT,
    ADD COLUMN IF NOT EXISTS content VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

UPDATE crm_care_tasks
SET content = note
WHERE content IS NULL
  AND note IS NOT NULL;

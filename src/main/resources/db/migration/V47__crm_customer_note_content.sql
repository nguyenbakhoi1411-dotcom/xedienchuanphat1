ALTER TABLE crm_customer_notes
    ADD COLUMN IF NOT EXISTS content VARCHAR(1200);

UPDATE crm_customer_notes
SET content = note
WHERE content IS NULL
  AND note IS NOT NULL;

UPDATE crm_customer_notes
SET content = ''
WHERE content IS NULL;

ALTER TABLE crm_customer_notes
    ALTER COLUMN content SET NOT NULL;

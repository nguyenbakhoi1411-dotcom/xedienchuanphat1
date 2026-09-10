ALTER TABLE crm_customer_notes
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(120);

UPDATE crm_customer_notes
SET created_by = username
WHERE created_by IS NULL
  AND username IS NOT NULL;

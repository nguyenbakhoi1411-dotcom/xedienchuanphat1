ALTER TABLE crm_leads
    ADD COLUMN IF NOT EXISTS lead_name VARCHAR(160),
    ADD COLUMN IF NOT EXISTS interested_product VARCHAR(180),
    ADD COLUMN IF NOT EXISTS lost_reason VARCHAR(300),
    ADD COLUMN IF NOT EXISTS converted_customer_id BIGINT,
    ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

UPDATE crm_leads
SET lead_name = full_name
WHERE lead_name IS NULL
  AND full_name IS NOT NULL;

UPDATE crm_leads
SET updated_at = created_at
WHERE updated_at IS NULL
  AND created_at IS NOT NULL;

UPDATE crm_leads
SET updated_at = NOW()
WHERE updated_at IS NULL;

UPDATE crm_leads
SET lead_name = ''
WHERE lead_name IS NULL;

ALTER TABLE crm_leads
    ALTER COLUMN lead_name SET NOT NULL,
    ALTER COLUMN updated_at SET NOT NULL;

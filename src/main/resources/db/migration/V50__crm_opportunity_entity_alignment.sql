ALTER TABLE crm_opportunities
    ADD COLUMN IF NOT EXISTS probability INTEGER NOT NULL DEFAULT 10,
    ADD COLUMN IF NOT EXISTS quotation_id BIGINT,
    ADD COLUMN IF NOT EXISTS sales_order_id BIGINT,
    ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS converted_by VARCHAR(120),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

UPDATE crm_opportunities
SET updated_at = created_at
WHERE updated_at IS NULL
  AND created_at IS NOT NULL;

UPDATE crm_opportunities
SET updated_at = NOW()
WHERE updated_at IS NULL;

ALTER TABLE crm_opportunities
    ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE purchase_orders
    ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS purchase_date DATE;

UPDATE purchase_orders
SET purchase_date = COALESCE(purchase_date, order_date, CURRENT_DATE)
WHERE purchase_date IS NULL;

ALTER TABLE purchase_orders
    ALTER COLUMN purchase_date SET NOT NULL;

ALTER TABLE purchase_return_items
    ADD COLUMN IF NOT EXISTS reason VARCHAR(200);

ALTER TABLE receivables
    ADD COLUMN IF NOT EXISTS type VARCHAR(30) NOT NULL DEFAULT 'SALE',
    ADD COLUMN IF NOT EXISTS invoice_no VARCHAR(80),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE receivables
    ALTER COLUMN debit_amount TYPE NUMERIC(18,2),
    ALTER COLUMN credit_amount TYPE NUMERIC(18,2);

ALTER TABLE refresh_tokens
    ADD COLUMN IF NOT EXISTS user_id BIGINT,
    ADD COLUMN IF NOT EXISTS replaced_by_token VARCHAR(120),
    ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP WITH TIME ZONE;

UPDATE refresh_tokens rt
SET user_id = u.id
FROM app_users u
WHERE rt.user_id IS NULL
  AND rt.username = u.username;

ALTER TABLE reminders
    ADD COLUMN IF NOT EXISTS reminder_date DATE,
    ADD COLUMN IF NOT EXISTS assigned_to BIGINT,
    ADD COLUMN IF NOT EXISTS done_at TIMESTAMP WITH TIME ZONE;

UPDATE reminders
SET reminder_date = COALESCE(reminder_date, CAST(remind_at AS DATE), CURRENT_DATE)
WHERE reminder_date IS NULL;

ALTER TABLE reminders
    ALTER COLUMN reminder_date SET NOT NULL;

ALTER TABLE repair_quotations
    ADD COLUMN IF NOT EXISTS parts_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS labor_amount NUMERIC(12,2) NOT NULL DEFAULT 0;

ALTER TABLE service_invoices
    ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2) NOT NULL DEFAULT 0;

UPDATE service_invoices
SET amount = COALESCE(NULLIF(amount, 0), total_amount, 0);

ALTER TABLE service_ticket_items
    ADD COLUMN IF NOT EXISTS type VARCHAR(20),
    ADD COLUMN IF NOT EXISTS name VARCHAR(120),
    ADD COLUMN IF NOT EXISTS product_id BIGINT,
    ADD COLUMN IF NOT EXISTS warehouse_id BIGINT,
    ADD COLUMN IF NOT EXISTS unit_cost NUMERIC(12,2) NOT NULL DEFAULT 0;

UPDATE service_ticket_items
SET type = COALESCE(type, item_type, 'LABOR'),
    name = COALESCE(name, description, 'Legacy service item')
WHERE type IS NULL
   OR name IS NULL;

ALTER TABLE service_ticket_items
    ALTER COLUMN type SET NOT NULL,
    ALTER COLUMN name SET NOT NULL;

ALTER TABLE service_ticket_timeline
    ADD COLUMN IF NOT EXISTS title VARCHAR(160),
    ADD COLUMN IF NOT EXISTS description VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS event_time TIMESTAMP WITH TIME ZONE;

UPDATE service_ticket_timeline
SET title = COALESCE(title, status, 'Legacy timeline event'),
    description = COALESCE(description, note),
    event_time = COALESCE(event_time, created_at, CURRENT_TIMESTAMP)
WHERE title IS NULL
   OR event_time IS NULL;

ALTER TABLE service_ticket_timeline
    ALTER COLUMN title SET NOT NULL,
    ALTER COLUMN event_time SET NOT NULL;

ALTER TABLE service_tickets
    ADD COLUMN IF NOT EXISTS diagnosis_note VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS predicted_cause VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS returned_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS labor_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS parts_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS warranty_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

UPDATE service_tickets
SET diagnosis_note = COALESCE(diagnosis_note, diagnosis),
    returned_at = COALESCE(returned_at, completed_at),
    updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)
WHERE diagnosis_note IS NULL
   OR returned_at IS NULL
   OR updated_at IS NULL;

ALTER TABLE service_tickets
    ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE suppliers
    ADD COLUMN IF NOT EXISTS code VARCHAR(40),
    ADD COLUMN IF NOT EXISTS name VARCHAR(160),
    ADD COLUMN IF NOT EXISTS contact_person VARCHAR(120);

UPDATE suppliers
SET code = COALESCE(code, supplier_code, 'SUP-' || id),
    name = COALESCE(name, supplier_name, 'Legacy supplier ' || id)
WHERE code IS NULL
   OR name IS NULL;

ALTER TABLE suppliers
    ALTER COLUMN code SET NOT NULL,
    ALTER COLUMN name SET NOT NULL;

ALTER TABLE system_error_logs
    ADD COLUMN IF NOT EXISTS module VARCHAR(80),
    ADD COLUMN IF NOT EXISTS error_type VARCHAR(180),
    ADD COLUMN IF NOT EXISTS path VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS username VARCHAR(80);

UPDATE system_error_logs
SET module = COALESCE(module, source, 'SYSTEM'),
    error_type = COALESCE(error_type, 'LegacyError')
WHERE module IS NULL
   OR error_type IS NULL;

ALTER TABLE system_error_logs
    ALTER COLUMN module SET NOT NULL,
    ALTER COLUMN error_type SET NOT NULL;

ALTER TABLE warranties
    ADD COLUMN IF NOT EXISTS policy_id BIGINT,
    ADD COLUMN IF NOT EXISTS main_parts_warranty VARCHAR(1000);

UPDATE warranties
SET main_parts_warranty = COALESCE(main_parts_warranty, covered_parts)
WHERE main_parts_warranty IS NULL;

ALTER TABLE warranty_policies
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;

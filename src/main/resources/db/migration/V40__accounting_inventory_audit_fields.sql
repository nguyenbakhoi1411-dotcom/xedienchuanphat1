-- V27: Accounting period and inventory audit fields
-- Add nullable columns only. Existing accounting history must be reviewed before any backfill.

ALTER TABLE journal_entries
    ADD COLUMN IF NOT EXISTS accounting_year INTEGER,
    ADD COLUMN IF NOT EXISTS accounting_month INTEGER;

ALTER TABLE inventory_transactions
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(120);

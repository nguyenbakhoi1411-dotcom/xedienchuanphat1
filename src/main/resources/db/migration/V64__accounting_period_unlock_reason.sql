ALTER TABLE accounting_periods
    ADD COLUMN IF NOT EXISTS unlock_reason VARCHAR(500);

ALTER TABLE journal_entries
    ADD COLUMN IF NOT EXISTS adjustment_for_year INTEGER,
    ADD COLUMN IF NOT EXISTS adjustment_for_month INTEGER;

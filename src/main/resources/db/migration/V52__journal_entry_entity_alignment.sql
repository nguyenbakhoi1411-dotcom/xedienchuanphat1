ALTER TABLE journal_entries
    ADD COLUMN IF NOT EXISTS reference_type VARCHAR(40),
    ADD COLUMN IF NOT EXISTS reference_id VARCHAR(80),
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(120),
    ADD COLUMN IF NOT EXISTS posted_by VARCHAR(120),
    ADD COLUMN IF NOT EXISTS total_debit NUMERIC(18,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_credit NUMERIC(18,2) NOT NULL DEFAULT 0;

UPDATE journal_entries
SET reference_type = COALESCE(source_type, 'MANUAL')
WHERE reference_type IS NULL;

UPDATE journal_entries
SET reference_id = source_no
WHERE reference_id IS NULL
  AND source_no IS NOT NULL;

UPDATE journal_entries
SET created_by = 'system'
WHERE created_by IS NULL;

UPDATE journal_entries entry
SET total_debit = totals.total_debit,
    total_credit = totals.total_credit
FROM (
    SELECT journal_entry_id,
           COALESCE(SUM(debit_amount), 0) AS total_debit,
           COALESCE(SUM(credit_amount), 0) AS total_credit
    FROM journal_entry_lines
    GROUP BY journal_entry_id
) totals
WHERE entry.id = totals.journal_entry_id;

ALTER TABLE journal_entries
    ALTER COLUMN reference_type SET NOT NULL,
    ALTER COLUMN created_by SET NOT NULL;

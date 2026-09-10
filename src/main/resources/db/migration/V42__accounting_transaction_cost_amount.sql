-- V42: Align accounting_transactions with AccountingTransaction entity

ALTER TABLE accounting_transactions
    ADD COLUMN IF NOT EXISTS cost_amount NUMERIC(18,2);

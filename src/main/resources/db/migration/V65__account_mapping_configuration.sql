CREATE TABLE IF NOT EXISTS account_mappings (
    id BIGSERIAL PRIMARY KEY,
    transaction_type VARCHAR(50) NOT NULL UNIQUE,
    account_code VARCHAR(30) NOT NULL,
    updated_by VARCHAR(120) NOT NULL DEFAULT 'system',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS account_mapping_history (
    id BIGSERIAL PRIMARY KEY,
    transaction_type VARCHAR(50) NOT NULL,
    old_account_code VARCHAR(30),
    new_account_code VARCHAR(30) NOT NULL,
    changed_by VARCHAR(120) NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_account_mapping_history_type_changed
    ON account_mapping_history(transaction_type, changed_at DESC);

INSERT INTO account_mappings (transaction_type, account_code, updated_by, updated_at) VALUES
    ('SALES_FOOD', '5113', 'system', NOW()),
    ('SALES_EV', '5111', 'system', NOW()),
    ('VAT_OUTPUT', '33311', 'system', NOW()),
    ('COGS', '632', 'system', NOW()),
    ('INVENTORY', '156', 'system', NOW()),
    ('RECEIVABLE', '131', 'system', NOW())
ON CONFLICT (transaction_type) DO NOTHING;

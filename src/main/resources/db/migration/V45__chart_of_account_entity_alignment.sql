ALTER TABLE chart_of_accounts
    ADD COLUMN IF NOT EXISTS parent_account_id BIGINT,
    ADD COLUMN IF NOT EXISTS description VARCHAR(500),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE chart_of_accounts child
SET parent_account_id = parent.id
FROM chart_of_accounts parent
WHERE child.parent_account_id IS NULL
  AND child.parent_code IS NOT NULL
  AND child.parent_code = parent.account_code;

ALTER TABLE chart_of_accounts
    ADD CONSTRAINT fk_chart_of_accounts_parent_account
        FOREIGN KEY (parent_account_id) REFERENCES chart_of_accounts(id);

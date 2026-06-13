-- V21: CRM Customer 360 upgrade
-- 1. Customer Groups
CREATE TABLE IF NOT EXISTS customer_groups (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(30)  NOT NULL UNIQUE,
    name        VARCHAR(120) NOT NULL,
    description VARCHAR(500),
    discount_percent DECIMAL(5,2) DEFAULT 0,
    status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Seed default groups
INSERT INTO customer_groups (code, name, description) VALUES
    ('INDIVIDUAL',  'Cá nhân',   'Khách lẻ cá nhân'),
    ('BUSINESS',    'Doanh nghiệp', 'Khách doanh nghiệp, cơ quan'),
    ('DEALER',      'Đại lý',    'Đại lý phân phối, mua sỉ'),
    ('VIP',         'VIP',       'Khách hàng VIP đặc biệt')
ON CONFLICT (code) DO NOTHING;

-- 2. Upgrade customers table
ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS customer_code     VARCHAR(30)  UNIQUE,
    ADD COLUMN IF NOT EXISTS customer_group_id BIGINT       REFERENCES customer_groups(id),
    ADD COLUMN IF NOT EXISTS score             INTEGER      DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_debt        DECIMAL(14,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_care_date    DATE,
    ADD COLUMN IF NOT EXISTS note              TEXT;

-- Auto-generate customer codes for existing rows
DO $$
BEGIN
    UPDATE customers SET customer_code = 'KH-' || LPAD(id::text, 6, '0')
    WHERE customer_code IS NULL;
END $$;

-- 3. Upgrade crm_leads table
ALTER TABLE crm_leads
    ADD COLUMN IF NOT EXISTS branch_id           BIGINT,
    ADD COLUMN IF NOT EXISTS email               VARCHAR(120),
    ADD COLUMN IF NOT EXISTS next_follow_up_date DATE,
    ADD COLUMN IF NOT EXISTS expected_value      DECIMAL(14,2);

-- Extend LeadStatus constraint if exists (handle gracefully)
ALTER TABLE crm_leads ALTER COLUMN status TYPE VARCHAR(30);

-- 4. CRM Alerts table
CREATE TABLE IF NOT EXISTS crm_alerts (
    id              BIGSERIAL PRIMARY KEY,
    alert_type      VARCHAR(40)  NOT NULL,
    -- LEAD_STALE | QUOTED_NO_BUY | WARRANTY_EXPIRING | NO_MAINTENANCE | OVERDUE_DEBT | BIRTHDAY | INACTIVE_90_DAYS
    customer_id     BIGINT       REFERENCES customers(id),
    lead_id         BIGINT       REFERENCES crm_leads(id),
    title           VARCHAR(300) NOT NULL,
    detail          TEXT,
    severity        VARCHAR(20)  NOT NULL DEFAULT 'INFO',  -- INFO | WARNING | URGENT
    is_dismissed    BOOLEAN      NOT NULL DEFAULT FALSE,
    dismissed_by    VARCHAR(120),
    dismissed_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_alerts_customer   ON crm_alerts(customer_id) WHERE NOT is_dismissed;
CREATE INDEX IF NOT EXISTS idx_crm_alerts_type_date  ON crm_alerts(alert_type, created_at DESC);

-- 5. Permissions for new features
INSERT INTO permissions (name, description) VALUES
    ('CRM_CUSTOMER_VIEW',       'Xem danh sách khách hàng'),
    ('CRM_CUSTOMER_EDIT',       'Chỉnh sửa khách hàng'),
    ('CRM_LEAD_VIEW',           'Xem lead'),
    ('CRM_LEAD_EDIT',           'Thêm/sửa lead'),
    ('CRM_ALERT_VIEW',          'Xem cảnh báo CRM'),
    ('CRM_ALERT_DISMISS',       'Đóng cảnh báo CRM'),
    ('CRM_360_VIEW',            'Xem Customer 360')
ON CONFLICT (name) DO NOTHING;

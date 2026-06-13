-- V10: Quản lý Đặt Cọc (Deposit)

CREATE TABLE IF NOT EXISTS deposits (
    id BIGSERIAL PRIMARY KEY,
    deposit_code VARCHAR(30) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL REFERENCES customers(id),
    branch_id BIGINT NOT NULL REFERENCES branches(id),
    product_id BIGINT REFERENCES products(id),
    serial_id BIGINT REFERENCES product_serials(id),
    amount NUMERIC(14,2) NOT NULL,
    deposit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expired_at DATE,
    payment_method VARCHAR(30),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    converted_to_order_id BIGINT REFERENCES sales_orders(id),
    converted_at TIMESTAMPTZ,
    converted_by VARCHAR(120),
    refunded_by VARCHAR(120),
    refunded_at TIMESTAMPTZ,
    refund_amount NUMERIC(14,2),
    note VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(120) NOT NULL,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_deposit_status CHECK (status IN ('ACTIVE', 'CONVERTED', 'REFUNDED', 'FORFEITED', 'EXPIRED'))
);

CREATE INDEX IF NOT EXISTS idx_deposits_customer ON deposits(customer_id);
CREATE INDEX IF NOT EXISTS idx_deposits_branch ON deposits(branch_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);

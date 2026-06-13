-- V11: Thanh toán Nhà Cung Cấp và Trả Hàng Mua

CREATE TABLE IF NOT EXISTS supplier_payments (
    id BIGSERIAL PRIMARY KEY,
    payment_code VARCHAR(30) NOT NULL UNIQUE,
    supplier_id BIGINT NOT NULL REFERENCES suppliers(id),
    branch_id BIGINT NOT NULL REFERENCES branches(id),
    purchase_order_id BIGINT REFERENCES purchase_orders(id),
    amount NUMERIC(14,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(30),
    bank_ref VARCHAR(100),
    note VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(120) NOT NULL,
    cancelled BOOLEAN NOT NULL DEFAULT FALSE,
    cancelled_by VARCHAR(120),
    cancelled_at TIMESTAMPTZ,
    cancel_reason VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS purchase_returns (
    id BIGSERIAL PRIMARY KEY,
    return_code VARCHAR(30) NOT NULL UNIQUE,
    supplier_id BIGINT NOT NULL REFERENCES suppliers(id),
    branch_id BIGINT NOT NULL REFERENCES branches(id),
    purchase_order_id BIGINT REFERENCES purchase_orders(id),
    return_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    refund_method VARCHAR(30),
    reason VARCHAR(500),
    note VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(120) NOT NULL,
    CONSTRAINT chk_purchase_return_status CHECK (status IN ('DRAFT', 'COMPLETED', 'CANCELLED'))
);

CREATE TABLE IF NOT EXISTS purchase_return_items (
    id BIGSERIAL PRIMARY KEY,
    purchase_return_id BIGINT NOT NULL REFERENCES purchase_returns(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    serial_id BIGINT REFERENCES product_serials(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(14,2) NOT NULL,
    line_total NUMERIC(14,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_supplier_payments_supplier ON supplier_payments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_payments_branch ON supplier_payments(branch_id);
CREATE INDEX IF NOT EXISTS idx_purchase_returns_supplier ON purchase_returns(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_returns_branch ON purchase_returns(branch_id);
CREATE INDEX IF NOT EXISTS idx_purchase_return_items_return ON purchase_return_items(purchase_return_id);

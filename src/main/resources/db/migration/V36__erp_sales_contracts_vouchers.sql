-- Bảng Hợp đồng bán hàng
CREATE TABLE IF NOT EXISTS sales_contracts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_no VARCHAR(50) NOT NULL UNIQUE,
    contract_date DATE,
    order_id BIGINT,
    customer_id BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'Chưa thực hiện',
    delivery_status VARCHAR(50) DEFAULT 'Chưa giao',
    project_name VARCHAR(255),
    total_amount DECIMAL(18, 2) DEFAULT 0.00,
    liquidated_amount DECIMAL(18, 2) DEFAULT 0.00,
    liquidation_date DATE,
    payment_term_date DATE,
    auto_liquidate BOOLEAN DEFAULT FALSE,
    note VARCHAR(500),
    branch_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sales_contracts_order FOREIGN KEY (order_id) REFERENCES sales_orders(id),
    CONSTRAINT fk_sales_contracts_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS sales_contract_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    contract_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    unit VARCHAR(50),
    required_quantity DECIMAL(18, 4) DEFAULT 0.0000,
    delivered_quantity DECIMAL(18, 4) DEFAULT 0.0000,
    unit_price DECIMAL(18, 2) DEFAULT 0.00,
    amount DECIMAL(18, 2) DEFAULT 0.00,
    discount_rate DECIMAL(5, 2) DEFAULT 0.00,
    discount_amount DECIMAL(18, 2) DEFAULT 0.00,
    tax_rate DECIMAL(5, 2) DEFAULT 0.00,
    tax_amount DECIMAL(18, 2) DEFAULT 0.00,
    CONSTRAINT fk_contract_items_contract FOREIGN KEY (contract_id) REFERENCES sales_contracts(id),
    CONSTRAINT fk_contract_items_product FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Bảng Chứng từ bán hàng (Ghi nhận doanh thu)
CREATE TABLE IF NOT EXISTS sales_vouchers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    voucher_no VARCHAR(50) NOT NULL UNIQUE,
    voucher_date DATE,
    accounting_date DATE,
    customer_id BIGINT NOT NULL,
    order_id BIGINT,
    salesperson VARCHAR(100),
    description VARCHAR(500),
    payment_method VARCHAR(50),
    is_export_voucher BOOLEAN DEFAULT FALSE,
    is_tax_invoice BOOLEAN DEFAULT FALSE,
    total_amount DECIMAL(18, 2) DEFAULT 0.00,
    total_tax_amount DECIMAL(18, 2) DEFAULT 0.00,
    total_payment DECIMAL(18, 2) DEFAULT 0.00,
    branch_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sales_vouchers_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
    CONSTRAINT fk_sales_vouchers_order FOREIGN KEY (order_id) REFERENCES sales_orders(id)
);

CREATE TABLE IF NOT EXISTS sales_voucher_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    voucher_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    warehouse_id BIGINT,
    unit VARCHAR(50),
    debit_account VARCHAR(20),
    credit_account VARCHAR(20),
    quantity DECIMAL(18, 4) DEFAULT 0.0000,
    unit_price DECIMAL(18, 2) DEFAULT 0.00,
    amount DECIMAL(18, 2) DEFAULT 0.00,
    tax_rate DECIMAL(5, 2) DEFAULT 0.00,
    tax_amount DECIMAL(18, 2) DEFAULT 0.00,
    tax_account VARCHAR(20),
    cogs_debit_account VARCHAR(20),
    cogs_credit_account VARCHAR(20),
    cogs_amount DECIMAL(18, 2) DEFAULT 0.00,
    CONSTRAINT fk_voucher_items_voucher FOREIGN KEY (voucher_id) REFERENCES sales_vouchers(id),
    CONSTRAINT fk_voucher_items_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_voucher_items_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

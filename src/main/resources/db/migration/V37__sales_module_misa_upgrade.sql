-- ============================================================
-- V37: Module Ban Hang MISA AMIS - Nang cap toan dien
-- ============================================================

-- 1. Bo sung cot vao QUOTATIONS
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS customer_address   VARCHAR(500);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS contact_person     VARCHAR(150);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS payment_term       VARCHAR(100);
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS salesperson_id     BIGINT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS warehouse_id       BIGINT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS total_discount      DECIMAL(18,2) DEFAULT 0;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS grand_total         DECIMAL(18,2) DEFAULT 0;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS converted_to_order  BIGINT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS created_by          VARCHAR(120);

-- 2. Bo sung cot vao QUOTATION_ITEMS
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS line_no         INTEGER DEFAULT 1;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS unit            VARCHAR(30);
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS discount_rate   DECIMAL(5,2) DEFAULT 0;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(18,2) DEFAULT 0;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS warranty_months INTEGER DEFAULT 0;
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS unit_name       VARCHAR(100);
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS product_code    VARCHAR(50);
ALTER TABLE quotation_items ADD COLUMN IF NOT EXISTS serial_no       VARCHAR(100);

-- 3. Bo sung cot vao SALES_ORDERS
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS customer_address  VARCHAR(500);
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS phone             VARCHAR(20);
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS mobile_phone      VARCHAR(20);
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS salesperson_name  VARCHAR(150);
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS warehouse_id      BIGINT;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS collected_amount  DECIMAL(18,2) DEFAULT 0;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS deposit_amount    DECIMAL(18,2) DEFAULT 0;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS cancel_reason     VARCHAR(500);
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS delivery_address  VARCHAR(500);

-- 4. Bo sung cot vao SALES_ORDER_ITEMS
ALTER TABLE sales_order_items ADD COLUMN IF NOT EXISTS line_no              INTEGER DEFAULT 1;
ALTER TABLE sales_order_items ADD COLUMN IF NOT EXISTS quantity_sold        DECIMAL(18,3) DEFAULT 0;
ALTER TABLE sales_order_items ADD COLUMN IF NOT EXISTS quantity_exported    DECIMAL(18,3) DEFAULT 0;
ALTER TABLE sales_order_items ADD COLUMN IF NOT EXISTS discount_rate        DECIMAL(5,2) DEFAULT 0;
ALTER TABLE sales_order_items ADD COLUMN IF NOT EXISTS discount_amount      DECIMAL(18,2) DEFAULT 0;
ALTER TABLE sales_order_items ADD COLUMN IF NOT EXISTS promotion_item       BOOLEAN DEFAULT FALSE;
ALTER TABLE sales_order_items ADD COLUMN IF NOT EXISTS commercial_discount  BOOLEAN DEFAULT FALSE;
ALTER TABLE sales_order_items ADD COLUMN IF NOT EXISTS account_receivable   VARCHAR(20) DEFAULT '131';
ALTER TABLE sales_order_items ADD COLUMN IF NOT EXISTS revenue_account      VARCHAR(20) DEFAULT '511';
ALTER TABLE sales_order_items ADD COLUMN IF NOT EXISTS serial_no            VARCHAR(100);
ALTER TABLE sales_order_items ADD COLUMN IF NOT EXISTS product_code         VARCHAR(50);
ALTER TABLE sales_order_items ADD COLUMN IF NOT EXISTS warehouse_id         BIGINT;

-- 5. Bo sung cot vao SALES_CONTRACTS
ALTER TABLE sales_contracts ADD COLUMN IF NOT EXISTS customer_address  VARCHAR(500);
ALTER TABLE sales_contracts ADD COLUMN IF NOT EXISTS tax_code          VARCHAR(20);
ALTER TABLE sales_contracts ADD COLUMN IF NOT EXISTS revenue           DECIMAL(18,2) DEFAULT 0;
ALTER TABLE sales_contracts ADD COLUMN IF NOT EXISTS invoiced_amount   DECIMAL(18,2) DEFAULT 0;
ALTER TABLE sales_contracts ADD COLUMN IF NOT EXISTS actual_collected  DECIMAL(18,2) DEFAULT 0;
ALTER TABLE sales_contracts ADD COLUMN IF NOT EXISTS actual_expense    DECIMAL(18,2) DEFAULT 0;
ALTER TABLE sales_contracts ADD COLUMN IF NOT EXISTS start_date        DATE;
ALTER TABLE sales_contracts ADD COLUMN IF NOT EXISTS end_date          DATE;
ALTER TABLE sales_contracts ADD COLUMN IF NOT EXISTS payment_term      VARCHAR(200);
ALTER TABLE sales_contracts ADD COLUMN IF NOT EXISTS salesperson_id    BIGINT;
ALTER TABLE sales_contracts ADD COLUMN IF NOT EXISTS customer_name     VARCHAR(200);

-- 6. Bo sung cot vao SALES_VOUCHERS
ALTER TABLE sales_vouchers ADD COLUMN IF NOT EXISTS voucher_type     VARCHAR(20) DEFAULT 'SALES';
ALTER TABLE sales_vouchers ADD COLUMN IF NOT EXISTS customer_code    VARCHAR(30);
ALTER TABLE sales_vouchers ADD COLUMN IF NOT EXISTS salesperson_name VARCHAR(150);
ALTER TABLE sales_vouchers ADD COLUMN IF NOT EXISTS address          VARCHAR(500);
ALTER TABLE sales_vouchers ADD COLUMN IF NOT EXISTS phone            VARCHAR(20);
ALTER TABLE sales_vouchers ADD COLUMN IF NOT EXISTS mobile_phone     VARCHAR(20);
ALTER TABLE sales_vouchers ADD COLUMN IF NOT EXISTS warehouse_id     BIGINT;
ALTER TABLE sales_vouchers ADD COLUMN IF NOT EXISTS posted_at        TIMESTAMP;
ALTER TABLE sales_vouchers ADD COLUMN IF NOT EXISTS status           VARCHAR(20) DEFAULT 'DRAFT';
ALTER TABLE sales_vouchers ADD COLUMN IF NOT EXISTS customer_name    VARCHAR(200);

-- 7. Bo sung cot vao SALES_VOUCHER_ITEMS
ALTER TABLE sales_voucher_items ADD COLUMN IF NOT EXISTS line_no             INTEGER DEFAULT 1;
ALTER TABLE sales_voucher_items ADD COLUMN IF NOT EXISTS promotion_item      BOOLEAN DEFAULT FALSE;
ALTER TABLE sales_voucher_items ADD COLUMN IF NOT EXISTS commercial_discount BOOLEAN DEFAULT FALSE;
ALTER TABLE sales_voucher_items ADD COLUMN IF NOT EXISTS account_receivable  VARCHAR(20) DEFAULT '131';
ALTER TABLE sales_voucher_items ADD COLUMN IF NOT EXISTS revenue_account     VARCHAR(20) DEFAULT '511';
ALTER TABLE sales_voucher_items ADD COLUMN IF NOT EXISTS discount_rate       DECIMAL(5,2) DEFAULT 0;
ALTER TABLE sales_voucher_items ADD COLUMN IF NOT EXISTS discount_amount     DECIMAL(18,2) DEFAULT 0;
ALTER TABLE sales_voucher_items ADD COLUMN IF NOT EXISTS serial_no           VARCHAR(100);
ALTER TABLE sales_voucher_items ADD COLUMN IF NOT EXISTS product_code        VARCHAR(50);
ALTER TABLE sales_voucher_items ADD COLUMN IF NOT EXISTS product_name        VARCHAR(300);
ALTER TABLE sales_voucher_items ADD COLUMN IF NOT EXISTS warehouse_name      VARCHAR(100);

-- ============================================================
-- 8. HOA DON VAT (Tax Invoice)
-- ============================================================
CREATE TABLE IF NOT EXISTS tax_invoices (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_no           VARCHAR(30) UNIQUE,
    invoice_serial       VARCHAR(20),
    invoice_date         DATE NOT NULL,
    invoice_type         VARCHAR(20) NOT NULL DEFAULT 'OUTPUT',
    invoice_form         VARCHAR(50) DEFAULT 'Hoa don moi',
    customer_id          BIGINT REFERENCES customers(id),
    customer_name        VARCHAR(200),
    customer_address     VARCHAR(500),
    customer_tax_code    VARCHAR(20),
    order_id             BIGINT REFERENCES sales_orders(id),
    voucher_id           BIGINT REFERENCES sales_vouchers(id),
    tax_base_amount      DECIMAL(18,2) NOT NULL DEFAULT 0,
    vat_rate             DECIMAL(5,2) DEFAULT 10,
    vat_amount           DECIMAL(18,2) NOT NULL DEFAULT 0,
    total_amount         DECIMAL(18,2) NOT NULL DEFAULT 0,
    status               VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    assembly_status      VARCHAR(30) DEFAULT 'NOT_READY',
    issue_status         VARCHAR(30) DEFAULT 'NOT_ISSUED',
    tax_authority_code   VARCHAR(50),
    invalid_handling     VARCHAR(100),
    original_invoice_id  BIGINT,
    branch_id            BIGINT NOT NULL,
    created_by           VARCHAR(120) NOT NULL,
    created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    issued_at            TIMESTAMP,
    cancelled_at         TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tax_invoice_lines (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id           BIGINT NOT NULL REFERENCES tax_invoices(id) ON DELETE CASCADE,
    line_no              INTEGER NOT NULL DEFAULT 1,
    product_id           BIGINT REFERENCES products(id),
    product_code         VARCHAR(50),
    product_name         VARCHAR(300) NOT NULL,
    unit                 VARCHAR(30),
    quantity             DECIMAL(18,3) NOT NULL DEFAULT 1,
    unit_price           DECIMAL(18,2) NOT NULL DEFAULT 0,
    commercial_discount  BOOLEAN DEFAULT FALSE,
    total_price          DECIMAL(18,2) NOT NULL DEFAULT 0,
    vat_rate             DECIMAL(5,2) DEFAULT 10,
    vat_amount           DECIMAL(18,2) DEFAULT 0,
    expiry_date          DATE,
    serial_no            VARCHAR(100),
    note                 VARCHAR(300)
);

-- ============================================================
-- 9. GIAM GIA HANG BAN (Sales Discount)
-- ============================================================
CREATE TABLE IF NOT EXISTS sales_discounts (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    discount_no      VARCHAR(30) NOT NULL UNIQUE,
    discount_date    DATE NOT NULL,
    customer_id      BIGINT REFERENCES customers(id),
    customer_name    VARCHAR(200),
    invoice_id       BIGINT REFERENCES tax_invoices(id),
    total_amount     DECIMAL(18,2) NOT NULL DEFAULT 0,
    status           VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    branch_id        BIGINT NOT NULL,
    created_by       VARCHAR(120) NOT NULL,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_discount_lines (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    discount_id           BIGINT NOT NULL REFERENCES sales_discounts(id) ON DELETE CASCADE,
    line_no               INTEGER NOT NULL DEFAULT 1,
    product_id            BIGINT REFERENCES products(id),
    product_code          VARCHAR(50),
    product_name          VARCHAR(300) NOT NULL,
    discount_account      VARCHAR(20) DEFAULT '511',
    ar_account            VARCHAR(20) DEFAULT '131',
    unit                  VARCHAR(30),
    quantity              DECIMAL(18,3) NOT NULL DEFAULT 1,
    unit_price_after_tax  DECIMAL(18,2) DEFAULT 0,
    unit_price            DECIMAL(18,2) NOT NULL DEFAULT 0,
    total_price           DECIMAL(18,2) NOT NULL DEFAULT 0,
    vat_rate              DECIMAL(5,2) DEFAULT 0,
    vat_amount            DECIMAL(18,2) DEFAULT 0,
    vat_account           VARCHAR(20),
    original_voucher_no   VARCHAR(30)
);

-- ============================================================
-- 10. CONG NO PHAI THU (AR Balances)
-- ============================================================
CREATE TABLE IF NOT EXISTS ar_balances (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id         BIGINT NOT NULL REFERENCES customers(id),
    customer_code       VARCHAR(30),
    customer_name       VARCHAR(200),
    branch_id           BIGINT NOT NULL,
    amount_by_invoice   DECIMAL(18,2) NOT NULL DEFAULT 0,
    advance_received    DECIMAL(18,2) NOT NULL DEFAULT 0,
    remaining_amount    DECIMAL(18,2) GENERATED ALWAYS AS (amount_by_invoice - advance_received) STORED,
    address             VARCHAR(500),
    tax_code            VARCHAR(20),
    customer_group      VARCHAR(100),
    as_of_date          DATE NOT NULL,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ar_aging_details (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id      BIGINT NOT NULL REFERENCES customers(id),
    invoice_id       BIGINT REFERENCES tax_invoices(id),
    invoice_no       VARCHAR(30),
    due_date         DATE,
    original_amount  DECIMAL(18,2) NOT NULL DEFAULT 0,
    paid_amount      DECIMAL(18,2) NOT NULL DEFAULT 0,
    remaining        DECIMAL(18,2) NOT NULL DEFAULT 0,
    debt_type        VARCHAR(30) DEFAULT 'NORMAL',
    branch_id        BIGINT NOT NULL,
    as_of_date       DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ============================================================
-- 11. THANH TOAN TIEN HANG (Sales Payments)
-- ============================================================
CREATE TABLE IF NOT EXISTS sales_payments (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_no       VARCHAR(30) NOT NULL UNIQUE,
    payment_date     DATE NOT NULL,
    customer_id      BIGINT REFERENCES customers(id),
    customer_name    VARCHAR(200),
    order_id         BIGINT REFERENCES sales_orders(id),
    amount           DECIMAL(18,2) NOT NULL,
    payment_method   VARCHAR(20) NOT NULL DEFAULT 'CASH',
    bank_account     VARCHAR(50),
    reference_no     VARCHAR(100),
    note             VARCHAR(300),
    cash_account     VARCHAR(20) DEFAULT '111',
    status           VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    branch_id        BIGINT NOT NULL,
    created_by       VARCHAR(120) NOT NULL,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 12. Nang cap bang CUSTOMERS
-- ============================================================
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_group  VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS id_card_no      VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS mobile_nlh      VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS ar_balance      DECIMAL(18,2) DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_revenue   DECIMAL(18,2) DEFAULT 0;

-- ============================================================
-- 13. Nang cap bang PRODUCTS
-- ============================================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS tax_reduction        BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS item_type            VARCHAR(20) DEFAULT 'GOODS';
ALTER TABLE products ADD COLUMN IF NOT EXISTS item_group           VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS main_unit            VARCHAR(30);
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_stock            DECIMAL(18,3) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS default_warehouse_id BIGINT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS inventory_account    VARCHAR(20) DEFAULT '156';

-- ============================================================
-- 14. Indexes bo sung
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tax_invoices_branch    ON tax_invoices(branch_id);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_customer  ON tax_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_date      ON tax_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_order     ON tax_invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_sales_discounts_branch ON sales_discounts(branch_id);
CREATE INDEX IF NOT EXISTS idx_sales_payments_branch  ON sales_payments(branch_id);
CREATE INDEX IF NOT EXISTS idx_sales_payments_order   ON sales_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_ar_balances_customer   ON ar_balances(customer_id);
CREATE INDEX IF NOT EXISTS idx_ar_balances_branch     ON ar_balances(branch_id);

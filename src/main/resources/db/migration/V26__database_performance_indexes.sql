-- Performance hardening for large ERP tables.
-- Keep this migration additive: indexes and nullable soft-delete metadata only.

-- Soft delete metadata for large mutable documents.
ALTER TABLE customers ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(120);

ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(120);
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS document_code VARCHAR(80);
ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS source_document_id VARCHAR(80);

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(120);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS document_code VARCHAR(80);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS source_document_id VARCHAR(80);

ALTER TABLE tax_invoices ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tax_invoices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE tax_invoices ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(120);

ALTER TABLE cash_books ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE cash_books ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE cash_books ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(120);
ALTER TABLE cash_books ADD COLUMN IF NOT EXISTS document_code VARCHAR(80);
ALTER TABLE cash_books ADD COLUMN IF NOT EXISTS source_document_id VARCHAR(80);

ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(120);
ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS document_code VARCHAR(80);
ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS source_document_id VARCHAR(80);

ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(120);
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS reference_type VARCHAR(50);
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS reference_id VARCHAR(80);
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS document_code VARCHAR(80);
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS source_document_id VARCHAR(80);

ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(120);
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS document_code VARCHAR(80);
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS source_document_id VARCHAR(80);
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(30);

-- Serial aliases used by imports/integrations.
ALTER TABLE product_serials ADD COLUMN IF NOT EXISTS battery_number VARCHAR(80);

-- Sales order / sales item hot paths.
CREATE INDEX IF NOT EXISTS idx_sales_orders_status_date ON sales_orders(status, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_orders_branch_status_date ON sales_orders(branch_id, status, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_orders_created_at ON sales_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_orders_order_no ON sales_orders(order_no);
CREATE INDEX IF NOT EXISTS idx_sales_orders_document_code ON sales_orders(document_code);
CREATE INDEX IF NOT EXISTS idx_sales_orders_source_document_id ON sales_orders(source_document_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_payment_status ON sales_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_deleted ON sales_orders(deleted);

CREATE INDEX IF NOT EXISTS idx_sales_order_items_order_id ON sales_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_items_serial_id ON sales_order_items(serial_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_items_product_serial ON sales_order_items(product_id, serial_id);

-- Inventory transaction movement/report filters.
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_transaction_date ON inventory_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type_date ON inventory_transactions(type, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_reference ON inventory_transactions(reference_type, reference_no);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_transaction_no ON inventory_transactions(transaction_no);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_document_code ON inventory_transactions(document_code);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_source_document_id ON inventory_transactions(source_document_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_deleted ON inventory_transactions(deleted);

-- Accounting journal/report filters.
CREATE INDEX IF NOT EXISTS idx_journal_entries_branch_date ON journal_entries(branch_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status_date ON journal_entries(status, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_reference ON journal_entries(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_document_code ON journal_entries(document_code);
CREATE INDEX IF NOT EXISTS idx_journal_entries_source_document_id ON journal_entries(source_document_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_deleted ON journal_entries(deleted);

CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_entry_id ON journal_entry_lines(entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account_code ON journal_entry_lines(account_code);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_customer_id ON journal_entry_lines(customer_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_supplier_id ON journal_entry_lines(supplier_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_product_id ON journal_entry_lines(product_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_branch_id ON journal_entry_lines(branch_id);

-- Customer search and branch dashboard filters.
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_source ON customers(source);
CREATE INDEX IF NOT EXISTS idx_customers_assigned_to ON customers(assigned_to);
CREATE INDEX IF NOT EXISTS idx_customers_last_purchase_date ON customers(last_purchase_date DESC);
CREATE INDEX IF NOT EXISTS idx_customers_deleted ON customers(deleted);

-- Product serial lookup.
CREATE INDEX IF NOT EXISTS idx_product_serials_product_id ON product_serials(product_id);
CREATE INDEX IF NOT EXISTS idx_product_serials_branch_id ON product_serials(branch_id);
CREATE INDEX IF NOT EXISTS idx_product_serials_frame_number ON product_serials(frame_number);
CREATE INDEX IF NOT EXISTS idx_product_serials_battery_serial ON product_serials(battery_serial);
CREATE INDEX IF NOT EXISTS idx_product_serials_battery_number ON product_serials(battery_number);
CREATE INDEX IF NOT EXISTS idx_product_serials_import_date ON product_serials(import_date DESC);

-- Service ticket list/report filters.
CREATE INDEX IF NOT EXISTS idx_service_tickets_branch_status_created ON service_tickets(branch_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_tickets_customer_id ON service_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_tickets_vehicle_id ON service_tickets(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_service_tickets_serial_number ON service_tickets(serial_number);
CREATE INDEX IF NOT EXISTS idx_service_tickets_phone ON service_tickets(phone);
CREATE INDEX IF NOT EXISTS idx_service_tickets_customer_phone ON service_tickets(customer_phone);
CREATE INDEX IF NOT EXISTS idx_service_tickets_received_date ON service_tickets(received_date DESC);
CREATE INDEX IF NOT EXISTS idx_service_tickets_service_type ON service_tickets(service_type);
CREATE INDEX IF NOT EXISTS idx_service_tickets_component_type ON service_tickets(component_type);
CREATE INDEX IF NOT EXISTS idx_service_tickets_document_code ON service_tickets(document_code);
CREATE INDEX IF NOT EXISTS idx_service_tickets_source_document_id ON service_tickets(source_document_id);
CREATE INDEX IF NOT EXISTS idx_service_tickets_deleted ON service_tickets(deleted);

-- Audit log retention/search filters.
CREATE INDEX IF NOT EXISTS idx_audit_logs_module_created ON audit_logs(module, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created ON audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Payment and invoice filters.
CREATE INDEX IF NOT EXISTS idx_sales_payments_order_id ON sales_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_sales_payments_payment_date ON sales_payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_payments_method ON sales_payments(payment_method);

CREATE INDEX IF NOT EXISTS idx_cash_books_transaction_date ON cash_books(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_cash_books_source ON cash_books(source_type, source_no);
CREATE INDEX IF NOT EXISTS idx_cash_books_document_code ON cash_books(document_code);
CREATE INDEX IF NOT EXISTS idx_cash_books_source_document_id ON cash_books(source_document_id);
CREATE INDEX IF NOT EXISTS idx_cash_books_created_at ON cash_books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cash_books_deleted ON cash_books(deleted);

CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_no ON invoices(invoice_no);
CREATE INDEX IF NOT EXISTS idx_invoices_document_code ON invoices(document_code);
CREATE INDEX IF NOT EXISTS idx_invoices_source_document_id ON invoices(source_document_id);
CREATE INDEX IF NOT EXISTS idx_invoices_deleted ON invoices(deleted);

CREATE INDEX IF NOT EXISTS idx_tax_invoices_branch_status_date ON tax_invoices(branch_id, status, invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_code ON tax_invoices(invoice_code);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_related_order ON tax_invoices(related_order_no);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_deleted ON tax_invoices(deleted);

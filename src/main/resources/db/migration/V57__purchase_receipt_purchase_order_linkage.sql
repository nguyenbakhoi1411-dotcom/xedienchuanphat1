-- PR3: ensure purchase receipts can be linked to purchase orders.
-- Kept nullable for historical direct receipts; new purchase receipts are validated in service.
ALTER TABLE purchase_receipts
    ADD COLUMN IF NOT EXISTS purchase_order_id BIGINT REFERENCES purchase_orders(id);

CREATE INDEX IF NOT EXISTS idx_purchase_receipts_po
    ON purchase_receipts(purchase_order_id);

COMMENT ON COLUMN purchase_receipts.purchase_order_id IS 'Purchase order linked to this goods receipt when the receipt is created from purchasing flow';

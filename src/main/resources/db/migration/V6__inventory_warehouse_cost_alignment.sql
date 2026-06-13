ALTER TABLE inventory_stocks ADD COLUMN IF NOT EXISTS available_quantity INTEGER NOT NULL DEFAULT 0;
UPDATE inventory_stocks
SET available_quantity = quantity_on_hand - reserved_quantity
WHERE available_quantity = 0 AND quantity_on_hand <> reserved_quantity;

UPDATE inventory_stocks stock
SET warehouse_id = warehouse.id
FROM warehouses warehouse
WHERE stock.warehouse_id IS NULL
  AND warehouse.branch_id = stock.branch_id
  AND warehouse.type = 'MAIN'
  AND warehouse.status = 'ACTIVE';

ALTER TABLE inventory_stocks DROP CONSTRAINT IF EXISTS inventory_stocks_branch_id_product_id_key;
ALTER TABLE inventory_stocks ADD CONSTRAINT uk_inventory_stock_branch_warehouse_product UNIQUE (branch_id, warehouse_id, product_id);

CREATE INDEX IF NOT EXISTS idx_inventory_stocks_branch_warehouse_product ON inventory_stocks(branch_id, warehouse_id, product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stocks_low_stock ON inventory_stocks(branch_id, warehouse_id, available_quantity, min_quantity);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_warehouse ON inventory_transactions(from_warehouse_id, to_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_average_costs_lookup ON inventory_average_costs(branch_id, warehouse_id, product_id);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM inventory_stocks stock
        WHERE stock.warehouse_id IS NULL
          AND NOT EXISTS (
              SELECT 1 FROM warehouses warehouse
              WHERE warehouse.branch_id = stock.branch_id
                AND warehouse.type = 'MAIN'
                AND warehouse.status = 'ACTIVE'
          )
    ) THEN
        RAISE EXCEPTION 'Cannot reconcile inventory rows without a MAIN warehouse';
    END IF;
END;
$$;

CREATE TEMP TABLE inventory_null_stock_merge ON COMMIT DROP AS
SELECT source.id AS source_id,
       target.id AS target_id,
       source.quantity_on_hand,
       source.reserved_quantity,
       source.min_quantity,
       source.max_quantity,
       source.average_cost
FROM inventory_stocks source
JOIN warehouses main_warehouse
  ON main_warehouse.branch_id = source.branch_id
 AND main_warehouse.type = 'MAIN'
 AND main_warehouse.status = 'ACTIVE'
JOIN inventory_stocks target
  ON target.branch_id = source.branch_id
 AND target.warehouse_id = main_warehouse.id
 AND target.product_id = source.product_id
WHERE source.warehouse_id IS NULL;

UPDATE inventory_stocks target
SET quantity_on_hand = target.quantity_on_hand + source.quantity_on_hand,
        reserved_quantity = target.reserved_quantity + source.reserved_quantity,
        available_quantity = target.quantity_on_hand + source.quantity_on_hand
                            - target.reserved_quantity - source.reserved_quantity,
        min_quantity = GREATEST(target.min_quantity, source.min_quantity),
        max_quantity = GREATEST(target.max_quantity, source.max_quantity),
        average_cost = CASE
            WHEN target.quantity_on_hand + source.quantity_on_hand = 0 THEN 0
            ELSE round((target.average_cost * target.quantity_on_hand
                      + source.average_cost * source.quantity_on_hand)
                      / (target.quantity_on_hand + source.quantity_on_hand), 2)
        END
FROM inventory_null_stock_merge source
WHERE target.id = source.target_id;

DELETE FROM inventory_stocks stock
USING inventory_null_stock_merge source
WHERE stock.id = source.source_id;

UPDATE inventory_stocks stock
SET warehouse_id = warehouse.id
FROM warehouses warehouse
WHERE stock.warehouse_id IS NULL
  AND warehouse.id = (
      SELECT main_warehouse.id FROM warehouses main_warehouse
      WHERE main_warehouse.branch_id = stock.branch_id
        AND main_warehouse.type = 'MAIN'
        AND main_warehouse.status = 'ACTIVE'
      ORDER BY main_warehouse.id LIMIT 1
  );

WITH resolved_transactions AS (
    SELECT transaction.*,
           COALESCE(transaction.from_warehouse_id,
               (SELECT warehouse.id FROM warehouses warehouse
                WHERE warehouse.branch_id = transaction.from_branch_id
                  AND warehouse.type = 'MAIN' AND warehouse.status = 'ACTIVE'
                ORDER BY warehouse.id LIMIT 1)) AS resolved_from_warehouse_id,
           COALESCE(transaction.to_warehouse_id,
               (SELECT warehouse.id FROM warehouses warehouse
                WHERE warehouse.branch_id = transaction.to_branch_id
                  AND warehouse.type = 'MAIN' AND warehouse.status = 'ACTIVE'
                ORDER BY warehouse.id LIMIT 1)) AS resolved_to_warehouse_id
    FROM inventory_transactions transaction
    WHERE transaction.deleted = FALSE
), ledger_balances AS (
    SELECT stock.id AS stock_id,
           stock.branch_id,
           stock.warehouse_id,
           stock.product_id,
           stock.quantity_on_hand,
           stock.average_cost,
           COALESCE(SUM(CASE
               WHEN transaction.type IN ('IMPORT', 'PURCHASE_RECEIPT', 'RETURN', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'COUNT_ADJUSTMENT_IN')
                    AND transaction.resolved_to_warehouse_id = stock.warehouse_id THEN transaction.quantity
               WHEN transaction.type IN ('EXPORT', 'SALE', 'GOODS_ISSUE', 'WRITE_OFF', 'PURCHASE_RETURN', 'TRANSFER_OUT', 'ADJUSTMENT_OUT', 'COUNT_ADJUSTMENT_OUT', 'SERVICE_USE')
                    AND transaction.resolved_from_warehouse_id = stock.warehouse_id THEN -transaction.quantity
               ELSE 0
           END), 0) AS ledger_quantity
    FROM inventory_stocks stock
    LEFT JOIN resolved_transactions transaction ON transaction.product_id = stock.product_id
    GROUP BY stock.id, stock.branch_id, stock.warehouse_id, stock.product_id, stock.quantity_on_hand, stock.average_cost
), corrections AS (
    SELECT balance.*,
           balance.quantity_on_hand - balance.ledger_quantity AS delta_quantity
    FROM ledger_balances balance
    WHERE balance.warehouse_id IS NOT NULL
      AND balance.quantity_on_hand <> balance.ledger_quantity
)
INSERT INTO inventory_transactions (
    type, transaction_no, transaction_date, product_id,
    from_branch_id, to_branch_id, from_warehouse_id, to_warehouse_id,
    quantity, unit_cost, total_cost, reference_type, reference_no,
    document_code, source_document_id, note, created_by, created_at, deleted
)
SELECT CASE WHEN correction.delta_quantity > 0 THEN 'ADJUSTMENT_IN' ELSE 'ADJUSTMENT_OUT' END,
       'V65-BASELINE-' || correction.stock_id,
       CURRENT_DATE,
       correction.product_id,
       CASE WHEN correction.delta_quantity < 0 THEN correction.branch_id END,
       CASE WHEN correction.delta_quantity > 0 THEN correction.branch_id END,
       CASE WHEN correction.delta_quantity < 0 THEN correction.warehouse_id END,
       CASE WHEN correction.delta_quantity > 0 THEN correction.warehouse_id END,
       ABS(correction.delta_quantity),
       COALESCE(cost.average_cost, correction.average_cost, 0),
       ABS(correction.delta_quantity) * COALESCE(cost.average_cost, correction.average_cost, 0),
       'LEGACY_BALANCE_RECONCILIATION',
       'inventory-stock-' || correction.stock_id,
       'inventory-stock-' || correction.stock_id,
       'inventory-stocks:' || correction.stock_id,
       'Opening balance reconciliation before immutable inventory ledger enforcement',
       'system',
       CURRENT_TIMESTAMP,
       FALSE
FROM corrections correction
LEFT JOIN inventory_average_costs cost
       ON cost.branch_id = correction.branch_id
      AND cost.warehouse_id = correction.warehouse_id
      AND cost.product_id = correction.product_id;

CREATE OR REPLACE FUNCTION reject_inventory_transaction_mutation()
RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'inventory_transactions is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_transactions_append_only
    BEFORE UPDATE OR DELETE ON inventory_transactions
    FOR EACH ROW EXECUTE FUNCTION reject_inventory_transaction_mutation();

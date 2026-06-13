# Performance Optimization - Chuan Phat

## Performance Issues Found

- Sales order and quotation list APIs mapped full entity responses, including lazy item collections. This can trigger N+1 queries and returns large payloads for list screens.
- Sales list APIs accepted arbitrary `pageSize`, which can overload the database and API response size.
- Report APIs use aggregate queries over large transactional tables. Without strict date windows and supporting indexes, these queries can scan too many rows.
- Report export is synchronous. Large date ranges or high row counts should be narrowed or moved to an async export job.
- Frontend POS search issued requests per keystroke when users typed quickly.
- Sales operation tables loaded only the first server page before optimization, so users could not navigate larger result sets.
- Slow API/query timings were not logged consistently.

## Code Optimizations Applied

- Added DTO projection list responses:
  - `SalesOrderListResponse`
  - `QuotationListResponse`
- Updated sales order and quotation list repository methods to select only list fields plus `itemCount`.
- Kept detail endpoints fetching full item graphs through `@EntityGraph`, so detail screens still return line items without N+1 traversal.
- Capped backend sales list `pageSize` to `100`.
- Added report date range validation:
  - Interactive report max: `186` days.
  - Export max guard is prepared; synchronous exports should still be kept small or moved to async jobs for large result sets.
- Added `performance` metadata to paginated report responses:
  - `largeResult`
  - `asyncExportRecommended`
  - `message`
- Added slow report query logging for report JDBC calls over `1000 ms`.
- Added slow API logging for `/api/**` requests over `1500 ms`.
- Added SQL indexes in `src/main/resources/db/performance-indexes.sql`.

## Index SQL

Use:

```sql
\i src/main/resources/db/performance-indexes.sql
```

Important indexes included:

- `sales_orders(order_date)`
- `sales_orders(branch_id)`
- `sales_orders(customer_id)`
- `sales_order_items(product_id)`
- `inventory_transactions(created_at)`
- `inventory_transactions(product_id)`
- `inventory_transactions(from_branch_id)`
- `inventory_transactions(to_branch_id)`
- `customers(phone)`
- `customers(branch_id)`
- `product_serials(serial_number)`
- `product_serials(status)`
- `audit_logs(created_at)`
- `audit_logs(user_id)`

Note: the current entity model uses `inventory_transactions.from_branch_id` and `inventory_transactions.to_branch_id`, not a single `branch_id`, so both branch indexes are included.

## Performance Test Checklist

- Verify list APIs:
  - `GET /api/sales/orders?page=0&pageSize=20`
  - `GET /api/sales/orders?page=1&pageSize=20`
  - `GET /api/sales/quotations?page=0&pageSize=20`
  - Ensure response does not include full item arrays on list endpoints.
- Verify detail APIs:
  - `GET /api/sales/orders/{id}`
  - `GET /api/sales/quotations/{id}`
  - Ensure line items are still available.
- Run report queries with realistic data:
  - `SALES_REPORT`
  - `STOCK_MOVEMENT`
  - `PRODUCT_PERFORMANCE`
  - `WARRANTY_COST`
  - Confirm date ranges over the configured max return a clear validation error.
- Check PostgreSQL query plans with `EXPLAIN ANALYZE` for:
  - sales by date and branch
  - sales item by product
  - inventory movement by date/product/branch
  - audit log search by date/user
- Confirm server logs include slow API warnings when endpoints exceed `1500 ms`.
- Confirm report logs include slow query warnings when report JDBC calls exceed `1000 ms`.
- Frontend:
  - Type quickly in product/customer search and confirm debounce reduces request count.
  - Navigate sales order/quotation pages and confirm data changes by server page.
  - Confirm loading skeleton or loading state displays during report fetches.
  - Confirm React Query cache prevents duplicate refetches when revisiting screens.

## Async Export Recommendation

For reports with `performance.asyncExportRecommended = true`, implement an async export job table with statuses:

- `PENDING`
- `RUNNING`
- `COMPLETED`
- `FAILED`

The frontend should submit the export request, poll status, and download the generated file when complete.

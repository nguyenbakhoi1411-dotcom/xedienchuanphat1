# Chuan Phat Internal Test Checklist

## Environment
- Backend runs with `SPRING_PROFILES_ACTIVE=dev`.
- Dev seed uses `spring.sql.init.continue-on-error=false`.
- Production build uses `SPRING_PROFILES_ACTIVE=prod` and a PostgreSQL database, not H2.
- Frontend production env has `NEXT_PUBLIC_ENABLE_MOCK=false` and `NEXT_PUBLIC_ENABLE_MOCK_LOGIN=false`.
- Login seed account works with credentials supplied through local environment or approved dev-only seed data.

## Auth
- Login succeeds with valid credentials and returns access/refresh tokens.
- Login message is generic for unknown user and wrong password.
- Failed login increments counter.
- Account locks for 15 minutes after 5 failed attempts.
- Successful login resets failed counter and lock timestamp.
- Refresh token returns a new access token.
- Logout revokes refresh token.
- Audit log records `LOGIN`, `LOGIN_FAILED`, and `ACCOUNT_LOCKED`.

## Branch
- Admin can list all branches.
- Branch Manager sees only assigned branch.
- Create/update/delete branch requires branch permissions.
- Non-admin cannot access another branch via direct API parameters.

## Product
- Product create/update validates code uniqueness and sale price >= import price.
- Deleted products are hidden from normal list.
- Serial create requires inventory import permission and assigned branch access.
- Serial list only returns `IN_STOCK` serials for accessible branch.
- Direct API call cannot list/create serials for another branch.

## Inventory
- Stock list is scoped by branch for non-admin users.
- Import increases stock and records inventory transaction.
- Export decreases stock and blocks negative stock.
- Transfer requires access to both source and destination branches.
- Stocktake updates quantity and records transaction.
- Warehouse user cannot operate on another branch.

## Sales
- Sales user can sell only in their assigned branch.
- Creating order requires customer in the same branch.
- Electric motorbike sale requires serial.
- Serial must be `IN_STOCK`; `SOLD`, `WARRANTY`, `TRANSFERRED`, `INACTIVE` are rejected.
- Successful sale decreases inventory stock.
- Successful sale changes selected serial to `SOLD`.
- Successful sale creates sales order items.
- Successful sale creates invoice.
- Successful sale records accounting transaction and cash/bank payment when paid.
- Partial/unpaid sale creates receivable balance.
- DRAFT order can be CONFIRMED, then moves to PARTIALLY_PAID/PAID as payments are recorded.
- CONFIRMED unpaid order reserves selected serial until `reservationUntil`.
- Expired reservation release returns serial to `IN_STOCK`.
- Quotation supports DRAFT/SENT/ACCEPTED/REJECTED/EXPIRED and converts to sales order.
- Payment history supports multiple payment rows and mixed cash/bank payments.
- Installment application records PENDING/APPROVED/REJECTED/DISBURSED and only creates payment on DISBURSED.
- Invoice can be created as DRAFT, issued, and previewed/exported as PDF.
- Sales return supports partial/full return, refund, serial RETURNED/DAMAGED, inventory adjustment, accounting adjustment, and audit log.
- Voucher validation checks date, usage limit, minimum order, product and branch applicability.
- Electric motorbike sale creates warranty.
- Audit log records invoice/payment creation.
- Sales APIs enforce `SALES_VIEW`, `SALES_CREATE`, `SALES_UPDATE`, `SALES_CANCEL`, `SALES_DISCOUNT_APPROVE`, `SALES_RETURN`, and `INVOICE_ISSUE`.

## Customer
- Customer list is scoped by branch for non-admin users.
- Create/update customer requires branch access.
- Duplicate phone is rejected.
- Direct API update cannot move a customer into another unauthorized branch.

## Warranty
- Warranty lookup returns active warranty by serial.
- Service ticket creation validates warranty/serial data.
- Service status transitions work.
- Technician assignment works.
- Repair cost items update ticket cost.
- Non-admin users cannot inspect tickets from another branch through reports/dashboard.

## Supplier
- Supplier CRUD requires supplier permissions.
- Purchase order requires branch access.
- Purchase order imports stock.
- Partial/unpaid purchase creates payable.
- Purchase order records audit log.

## Accounting
- Receipt form requires customer selection.
- Payment form requires supplier selection.
- Bank transfer requires bank account selection.
- Cash transaction uses default cash book flow.
- Receipt cannot exceed customer debt.
- Payment cannot exceed supplier debt.
- Cash flow and profit/loss reports return database values.

## Dashboard
- Dashboard summary uses database sales, stock, debt, and service ticket data.
- Revenue by month is populated from sales orders.
- Revenue by branch is scoped for non-admin users.
- Top products are calculated from sales order items.
- Warranty tickets are scoped by branch.

## Reports
- All report APIs accept `fromDate`, `toDate`, `branchId`, `employeeId`, and `productId` where applicable.
- Non-admin branch scope overrides forged `branchId`.
- Revenue time, branch, employee, top products, inventory, debt, profit, and warranty repair reports use database data.
- Export output includes current filtered report rows.

## Settings
- Settings page loads from `/api/settings`.
- Company info, logo URL, invoice template, warranty policy, and low-stock threshold save through `PUT /api/settings`.
- Settings access requires `SETTING_MANAGE`.

## Marketing
- Voucher list/create/update/delete works.
- Campaign list/create/update works.
- Customer source counts are calculated from customers.
- APIs enforce `MARKETING_VIEW`, `MARKETING_CREATE`, and `MARKETING_UPDATE`.

## Audit Log
- Audit log list is accessible only with `AUDIT_VIEW`.
- Auth, sales, purchase, receipt, and payment actions are recorded.
- Audit filters by user/action/module/date work.

# QA System Test Plan - Chuan Phat

## Scope

This plan covers system-level QA for:

1. Auth
2. User/Role/Permission
3. Branch
4. Product
5. Product Serial
6. Warehouse/Inventory
7. Sales/POS
8. Customer CRM
9. Warranty/Service
10. Supplier/Purchase
11. Accounting
12. Dashboard
13. Reports
14. Settings
15. Marketing/Voucher
16. Audit Log

## Test Cases

| Test Case ID | Module | Pre-condition | Test data | Steps | Expected result | Priority | Type |
|---|---|---|---|---|---|---|---|
| AUTH-001 | Auth | User exists and is active | `admin@example.com` / valid password | Open login page, enter valid credentials, submit | User receives token, lands on dashboard, `/api/auth/me` returns current user | P0 | Positive |
| AUTH-002 | Auth | User exists | Valid email + wrong password 5 times | Submit wrong password repeatedly | Login denied; account/rate limiter blocks further attempts according to policy | P0 | Security |
| AUTH-003 | Auth | Production environment | `NEXT_PUBLIC_ENABLE_MOCK=true` or mock login code enabled | Build/run production, inspect login behavior | Mock login must be disabled in production and cannot bypass API auth | P0 | Security |
| AUTH-004 | Auth | User has refresh token | Expired/rotated refresh token | Call `/api/auth/refresh` twice with same token | First valid refresh succeeds if token active; reused/expired token fails | P1 | Security |
| AUTH-005 | Auth | User logged in | Bearer token removed | Call protected API | API returns 401/403 and no sensitive data | P0 | Negative |
| URP-001 | User/Role/Permission | Admin logged in | New user with `SALES_VIEW` only | Create user, assign limited role, login as user | User sees only permitted modules/actions | P0 | Positive |
| URP-002 | User/Role/Permission | Non-admin logged in | User without `USER_MANAGE` | Call user creation API | API returns 403 | P0 | Security |
| URP-003 | User/Role/Permission | Admin logged in | Remove `INVENTORY_VIEW` from role | Update role permissions, login as affected user | Inventory endpoints and menu access are blocked | P0 | Security |
| URP-004 | User/Role/Permission | Admin logged in | Duplicate username/email | Create user with duplicate login identifier | API returns validation/business error; no duplicate account created | P1 | Negative |
| BR-001 | Branch | Admin logged in | Branch name, code, address | Create branch | Branch is saved, visible in branch list, can be assigned to users | P1 | Positive |
| BR-002 | Branch | Branch A user logged in | Existing data from Branch B | Call list/detail APIs with `branchId=B` | API returns 403 or scoped Branch A data only | P0 | Security |
| BR-003 | Branch | Admin logged in | Disable branch with active inventory | Attempt to deactivate/delete branch | Operation blocked or requires migration; inventory/orders remain intact | P1 | Edge case |
| PRD-001 | Product | Product manager logged in | Product with SKU, category, sale price, import price | Create product | Product is created and searchable | P1 | Positive |
| PRD-002 | Product | Product exists | Negative price or zero warranty months for vehicle | Save invalid product | API returns validation error | P1 | Negative |
| PRD-003 | Product | Product exists | Duplicate SKU/product code | Create second product with same code | API blocks duplicate code | P1 | Negative |
| SER-001 | Product Serial | Vehicle product exists | New serial number | Create serial/import stock | Serial is `IN_STOCK`, linked to product/branch/warehouse | P0 | Positive |
| SER-002 | Product Serial | Serial exists as `SOLD` | Sales order with sold serial | Create order using SOLD serial | Order creation fails; serial status and stock remain unchanged | P0 | Negative |
| SER-003 | Product Serial | Serial exists in Branch B | Branch A sales user | Attempt to sell Branch B serial | API returns error/403; no order created | P0 | Security |
| SER-004 | Product Serial | Serial exists | Duplicate serial number | Import duplicate serial | API returns validation/business error | P0 | Negative |
| INV-001 | Warehouse/Inventory | Product and warehouse exist | Import quantity `10` | Import stock | Stock increases by 10; inventory transaction is recorded | P0 | Positive |
| INV-002 | Warehouse/Inventory | Stock quantity `2` | Export quantity `3` | Export stock | API blocks export; stock remains 2 | P0 | Negative |
| INV-003 | Warehouse/Inventory | Branch A stock `5`, Branch B stock `1` | Transfer quantity `2` A to B | Create/confirm transfer | Branch A decreases by 2, Branch B increases by 2, movement transactions recorded | P0 | Positive |
| INV-004 | Warehouse/Inventory | Product has no stock row | Import quantity `1` | Import stock | Stock row is created, not lost due to missing initial row | P1 | Edge case |
| INV-005 | Warehouse/Inventory | Branch A user logged in | Branch B warehouse ID | Create transfer/export from Branch B | API returns 403; no inventory changes | P0 | Security |
| POS-001 | Sales/POS | Customer, product, stock exist | 2 normal products, unit prices, discount | Create order | Subtotal, discount, total, paid, amount due are exactly correct | P0 | Positive |
| POS-002 | Sales/POS | Product stock `1` | Order quantity `2` | Create/confirm order | API blocks sale over stock; no stock movement | P0 | Negative |
| POS-003 | Sales/POS | Vehicle serial `IN_STOCK` | Vehicle sale with serial | Create confirmed order + invoice | Serial becomes `SOLD`, stock decreases, warranty is created | P0 | Positive |
| POS-004 | Sales/POS | Vehicle serial `SOLD` | Vehicle sale with same serial | Create order | API rejects sale; no duplicate warranty or stock issue | P0 | Negative |
| POS-005 | Sales/POS | Order total `10,000,000` | Pay `3,000,000` | Create partial payment order | Payment status is `PARTIAL`; customer receivable/debt is created for remaining amount | P0 | Positive |
| POS-006 | Sales/POS | User lacks discount approval | Manual discount below sale price | Create discounted order | API returns 403/business error | P0 | Security |
| POS-007 | Sales/POS | Order delivered | Return one item | Create sales return | Returned quantity updates, refund recorded, stock/serial disposition follows return policy | P1 | Positive |
| CRM-001 | Customer CRM | CRM user logged in | New lead | Create lead | Lead saved with source/status and appears in lead list | P1 | Positive |
| CRM-002 | Customer CRM | Lead exists | Convert lead to customer | Convert lead | Customer is created once; duplicate phone is blocked | P1 | Positive |
| CRM-003 | Customer CRM | Branch A CRM user | Branch B customer ID | Open customer 360 | API blocks or scopes access to Branch A | P0 | Security |
| CRM-004 | Customer CRM | Customer exists | Care note + follow-up task | Add note and task | Note/task saved; report metrics update | P2 | Positive |
| WAR-001 | Warranty/Service | Vehicle sale completed | Sold vehicle serial | Check warranty | Warranty exists with correct customer, serial, start/end date | P0 | Positive |
| WAR-002 | Warranty/Service | Vehicle sold without invoice issue | Attempt warranty lookup | Check warranty | Warranty is absent or marked inactive according to business rule; no false warranty | P1 | Edge case |
| WAR-003 | Warranty/Service | Service ticket exists | Add labor/parts | Add repair items | Repair cost equals parts + labor; no negative cost | P0 | Positive |
| WAR-004 | Warranty/Service | Technician user logged in | Assign technician request | Technician assigns another technician | API returns 403 | P0 | Security |
| WAR-005 | Warranty/Service | Ticket in completed status | Add new item/status rollback | Attempt update | API blocks invalid lifecycle transition | P1 | Negative |
| SUP-001 | Supplier/Purchase | Supplier exists | Purchase order with items | Create purchase order | PO created with correct totals and status | P1 | Positive |
| SUP-002 | Supplier/Purchase | PO approved/received | Receive goods | Confirm receipt | Inventory increases; purchase payable created if unpaid | P0 | Positive |
| SUP-003 | Supplier/Purchase | PO exists | Receive quantity greater than ordered | Confirm over-receipt | API blocks or requires explicit approval | P1 | Edge case |
| ACC-001 | Accounting | Accounting user logged in | Balanced journal entry | Create and post journal entry | Total debit equals total credit; entry posts successfully | P0 | Positive |
| ACC-002 | Accounting | Accounting user logged in | Debit `1,000`, credit `900` | Post unbalanced journal entry | API rejects posting; ledger unchanged | P0 | Negative |
| ACC-003 | Accounting | Partial sales payment exists | Customer debt report | View customer debt | Remaining receivable equals order total minus paid amount | P0 | Positive |
| ACC-004 | Accounting | Supplier purchase debt exists | Partial supplier payment | Pay supplier partially | Payable balance decreases correctly; cash/bank balance decreases | P0 | Positive |
| ACC-005 | Accounting | User lacks accounting permission | Accounting report endpoint | Call report API | API returns 403 | P0 | Security |
| DASH-001 | Dashboard | Data exists in multiple branches | Admin user | Open dashboard | KPIs aggregate all permitted branches only | P1 | Positive |
| DASH-002 | Dashboard | Branch A user | Branch B sales data exists | Open dashboard with branch B filter | Branch B data is not visible | P0 | Security |
| DASH-003 | Dashboard | No data in selected range | Empty date range | Open dashboard | Shows zero/empty state; no crash or stale values | P2 | Edge case |
| REP-001 | Reports | Sales data exists | Date range with known orders | Open sales report | Revenue/order count matches source orders and excludes cancelled orders | P0 | Positive |
| REP-002 | Reports | User lacks `REPORT_EXPORT` | Export URL | Call `/api/reports/*/export` | API returns 403; no file generated | P0 | Security |
| REP-003 | Reports | Large date range | `fromDate` > allowed max | Request report | API rejects with clear message or recommends async export | P1 | Edge case |
| REP-004 | Reports | Branch A user | Branch B filter | Request report | Report is scoped; Branch B data not returned | P0 | Security |
| SET-001 | Settings | Admin logged in | Invoice template, warranty policy settings | Update settings | Settings persist and are used by invoice/warranty generation | P1 | Positive |
| SET-002 | Settings | Non-admin logged in | Settings update request | Call settings update API | API returns 403 | P0 | Security |
| SET-003 | Settings | Admin logged in | Invalid numeric threshold | Save settings | API returns validation error | P2 | Negative |
| MKT-001 | Marketing/Voucher | Active voucher exists | Valid date, min order met | Apply voucher to POS order | Discount is applied correctly; total is recalculated | P0 | Positive |
| MKT-002 | Marketing/Voucher | Voucher expired | Expired voucher code | Apply voucher | API rejects voucher; no discount applied | P0 | Negative |
| MKT-003 | Marketing/Voucher | Voucher branch limited to Branch B | Branch A order | Apply voucher | API rejects voucher for Branch A | P0 | Security |
| MKT-004 | Marketing/Voucher | Voucher usage limit reached | Used count equals limit | Apply voucher | API rejects voucher; used count not incremented | P0 | Edge case |
| AUD-001 | Audit Log | Audited action configured | Create/update/delete business object | Perform action | Audit log records user, action, module, entity, timestamp | P1 | Positive |
| AUD-002 | Audit Log | Branch A user logged in | Audit records from Branch B/user B | Search audit logs | API returns only authorized logs or 403 | P0 | Security |
| AUD-003 | Audit Log | Many logs exist | Date/user filter | Search logs with pagination | Results are paginated, sorted newest first, and filter correctly | P1 | Positive |
| AUD-004 | Audit Log | User lacks audit permission | Audit export endpoint | Call export | API returns 403 | P0 | Security |

## Manual QA Checklist

### Smoke Test

- Login as Admin, Branch Manager, Sales, Inventory, Accounting, Technician, CRM user.
- Verify each role sees only allowed modules.
- Create one end-to-end sale for a normal product.
- Create one end-to-end vehicle sale with serial and invoice.
- Verify warranty is created for vehicle sale.
- Verify stock and serial status after sale.
- Verify dashboard and sales report reflect the sale.
- Export one permitted report and verify file downloads.
- Attempt export as unauthorized user and verify 403.

### Branch Data Isolation

- Seed Branch A and Branch B customers, products, stocks, orders, warranties, reports.
- Login as Branch A user.
- Try URL/API filters with `branchId=BranchB`.
- Try direct detail URLs for Branch B objects.
- Verify no Branch B data appears in lists, detail, dashboard, reports, CRM 360, audit logs.

### Sales/POS Critical Flow

- Search products and customers.
- Add normal product; verify subtotal and total.
- Add vehicle product; verify serial is required.
- Try SOLD serial; expect rejection.
- Try quantity greater than stock; expect rejection.
- Apply valid voucher; verify discount.
- Apply expired/branch-limited/usage-limit voucher; expect rejection.
- Pay partially; verify payment status and receivable.
- Pay fully; verify no remaining debt.
- Issue invoice; verify invoice status, PDF, and warranty creation.
- Return item; verify refund, returned quantity, stock/serial handling.

### Inventory Critical Flow

- Import stock into empty stock row.
- Import stock into existing stock row.
- Export stock within available quantity.
- Export over available quantity; verify block.
- Transfer stock A to B; verify both sides.
- Transfer serial product; verify serial branch/warehouse changes only after valid transfer.
- Review inventory transaction history and report.

### Accounting Critical Flow

- Post balanced manual journal entry.
- Attempt unbalanced journal entry.
- Create sales payment; verify receivable and cash/bank.
- Create supplier purchase debt; verify payable.
- Pay supplier partially; verify remaining payable.
- Compare trial balance total debit/credit.
- Confirm accounting reports require permission.

### Reports/Dashboard

- Compare sales report totals against known seed orders.
- Verify cancelled orders are excluded.
- Verify branch filters scope data.
- Verify report pagination and date range limits.
- Verify large result warning/async export recommendation.
- Verify dashboard KPI matches report source.

### Production Safety

- Build frontend with production env.
- Confirm `NEXT_PUBLIC_ENABLE_MOCK` is absent or `false`.
- Confirm mock-auth cannot create a session in production.
- Confirm API base URL points to production API.
- Confirm CORS, CSP, secure headers are enabled.

## Backend Automation Suggestions - JUnit/MockMvc

Recommended structure:

```text
src/test/java/com/chuanphat/warranty/qa/
  AuthQaTest.java
  BranchIsolationQaTest.java
  SalesInventoryWarrantyQaTest.java
  AccountingQaTest.java
  ReportSecurityQaTest.java
  VoucherQaTest.java
```

### Priority JUnit Tests To Add

| Test class | Test method | What it validates |
|---|---|---|
| `BranchIsolationQaTest` | `branchUserCannotReadOtherBranchOrders()` | Branch A user cannot list/detail Branch B orders |
| `BranchIsolationQaTest` | `branchUserCannotReadOtherBranchCustomer360()` | Branch A user cannot access Branch B CRM/customer data |
| `SalesInventoryWarrantyQaTest` | `soldSerialCannotBeSoldAgain()` | SOLD serial cannot be reused |
| `SalesInventoryWarrantyQaTest` | `saleCannotExceedStock()` | Stock cannot go below zero |
| `SalesInventoryWarrantyQaTest` | `vehicleSaleCreatesWarrantyAndMarksSerialSold()` | Sale, serial, inventory, warranty consistency |
| `SalesInventoryWarrantyQaTest` | `partialPaymentCreatesReceivableDebt()` | Partial payment creates correct debt |
| `VoucherQaTest` | `expiredVoucherCannotBeApplied()` | Expired voucher is rejected |
| `VoucherQaTest` | `branchLimitedVoucherCannotBeUsedInAnotherBranch()` | Voucher branch rules enforced |
| `AccountingQaTest` | `unbalancedJournalEntryCannotBePosted()` | Debit/credit balance enforced |
| `ReportSecurityQaTest` | `reportExportRequiresExportPermission()` | Export API requires `REPORT_EXPORT` |
| `ReportSecurityQaTest` | `salesReportRevenueMatchesKnownOrders()` | Report total matches seeded sales |
| `AuthQaTest` | `wrongPasswordAttemptsLockOrThrottleLogin()` | Login brute-force protection |

### Example JUnit Pattern

```java
@SpringBootTest
@AutoConfigureMockMvc
class SalesInventoryWarrantyQaTest {
    @Autowired MockMvc mockMvc;

    @Test
    void soldSerialCannotBeSoldAgain() throws Exception {
        // Arrange: create product, serial, first confirmed vehicle sale.
        // Act: attempt second sale with the same serial.
        // Assert: 400/409, one order only, serial remains SOLD, stock is unchanged.
    }

    @Test
    void vehicleSaleCreatesWarrantyAndMarksSerialSold() throws Exception {
        // Arrange: product + IN_STOCK serial + customer.
        // Act: create confirmed order and issue invoice.
        // Assert: serial SOLD, stock decreased, warranty lookup by serial returns active warranty.
    }
}
```

Implementation notes:

- Prefer repository assertions after API calls for critical financial/inventory state.
- Use stable seed builders to create branches, users, products, customers, serials, and stock.
- For branch isolation, test both list endpoint filters and direct detail access by ID.
- For accounting, assert ledger rows and balances, not only HTTP status.
- Keep P0 tests independent; each test should set up its own data or cleanly isolate by unique codes.

## Frontend Automation Suggestions - Playwright

Playwright is not currently installed in `frontend/package.json`. Add it when ready:

```powershell
D:\ChuanPhat\.runtime\node-v22.13.1-win-x64\node.exe .\node_modules\npm\bin\npm-cli.js install -D @playwright/test
D:\ChuanPhat\.runtime\node-v22.13.1-win-x64\node.exe .\node_modules\@playwright\test\cli.js install chromium
```

Recommended structure:

```text
frontend/e2e/
  auth.spec.ts
  branch-isolation.spec.ts
  sales-pos.spec.ts
  inventory.spec.ts
  reports.spec.ts
  accounting.spec.ts
```

### Priority Playwright Tests

| Spec | Scenario |
|---|---|
| `auth.spec.ts` | Login success, wrong password lock/throttle, production mock login disabled |
| `branch-isolation.spec.ts` | Branch A user cannot see Branch B customers/orders/reports |
| `sales-pos.spec.ts` | Create normal product sale and verify totals |
| `sales-pos.spec.ts` | Block SOLD serial and over-stock sale |
| `sales-pos.spec.ts` | Partial payment displays remaining debt |
| `inventory.spec.ts` | Import stock updates table and history |
| `inventory.spec.ts` | Transfer stock updates source/destination |
| `reports.spec.ts` | Server-side pagination and date range error |
| `reports.spec.ts` | Unauthorized export button hidden/blocked |
| `accounting.spec.ts` | Unbalanced journal entry validation |

### Example Playwright Pattern

```ts
import { expect, test } from "@playwright/test";

test("expired voucher cannot be used in POS", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("sales-a@example.com");
  await page.getByLabel("Password").fill("ValidPassword123!");
  await page.getByRole("button", { name: /dang nhap/i }).click();

  await page.goto("/sales");
  await page.getByPlaceholder(/tim nhanh san pham/i).fill("CP-S1");
  await page.getByRole("button", { name: /CP-S1/i }).first().click();
  await page.getByPlaceholder(/voucher/i).fill("EXPIRED-2026");
  await page.getByRole("button", { name: /ap dung/i }).click();

  await expect(page.getByText(/voucher.*het han|khong hop le/i)).toBeVisible();
});
```

Automation notes:

- Use API setup fixtures for stable data instead of clicking through setup screens.
- Use distinct test data prefixes such as `QA-YYYYMMDD-*`.
- Run frontend E2E against a dedicated test backend/database.
- Capture screenshot/video on failure for P0 flows.
- Include one mobile viewport smoke run for POS and report screens.

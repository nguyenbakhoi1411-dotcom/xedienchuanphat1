# Chuan Phat ERP - Enterprise Transformation Blueprint

Ngay lap: 2026-06-13

Muc tieu: dua Chuan Phat ERP tu he thong quan ly showroom xe dien len nen tang ERP doanh nghiep gan MISA AMIS/Odoo Enterprise/SAP Business One SME/NetSuite SME, nhung khong pha vo cac module hien co.

## 1. ERP Gap Analysis

### Accounting

Existing features:
- Da co ChartOfAccount, JournalEntry, JournalEntryLine, General Ledger, Trial Balance, Balance Sheet, Profit & Loss, Cash Flow, AccountingPeriod.
- Da co auto journal cho sales, purchase, receipt, payment, return, warranty, service, expense, depreciation.
- Da co VAT input/output framework, tax invoice, tax declaration, fixed asset va expense integration muc co ban.

Missing features:
- FiscalYear rieng, opening balance chuan, period closing checklist, period reopen approval.
- Sub-ledger AR/AP theo doi tuong, reconciliation AR/AP, bank reconciliation day du.
- Recurring journal, journal reversal co lien ket goc, approval workflow cau hinh bang DB.
- Multi-currency, exchange rate gain/loss, tax declaration theo mau chuan Viet Nam.
- Cost center, department accounting, project accounting moi o muc thiet ke, chua thanh luong xu ly xuyen suot.

Architecture problems:
- Accounting service dang gom nhieu nghiep vu trong mot service lon.
- Auto-posting co hard-code account code 111/112/131/156/331/511/632/3331.
- Chua co accounting rule engine de map tai khoan theo loai giao dich/san pham/chi nhanh.

Security problems:
- Permission co nhieu nhom cu/moi song song: ACCOUNTING_VIEW, VIEW_ACCOUNTING, ACCOUNTING_REPORT.
- Chua co field-level permission cho so tien gia von/loi nhuan trong tat ca DTO.

Scalability/performance problems:
- Financial statement doc tu journal lines truc tiep; khi data lon can aggregate table theo ky/tai khoan/chi nhanh.
- Chua co archiving cho journal_entry_line.

Data integrity/accounting risks:
- Seed/test da tung loi NOT NULL, cho thay schema va demo data chua duoc quan tri bang migration chuan.
- Neu mot giao dich ban hang fail giua buoc kho, cong no va ke toan se de lai trang thai lech neu khong co transaction boundary/event outbox.

Refactoring recommendations:
- Tach AccountingPostingService, AccountingRuleService, FinancialStatementQueryService, ReconciliationService.
- Them bang accounting_rules, fiscal_years, opening_balances, period_close_tasks, bank_reconciliations, ar_ap_reconciliations.
- Moi posting phai idempotent theo source_type/source_id va debit = credit.

### Inventory

Existing features:
- Da co InventoryStock, InventoryTransaction, Warehouse, InventoryTransfer, InventoryCount/Stocktake, InventoryReservation, InventoryAverageCost, InventoryCostLayer.
- Da co serial tracking va lich su serial.
- Da co chong xuat am trong luong nghiep vu quan trong.

Missing features:
- FIFO/Weighted Average/Specific Cost chua duoc dong goi thanh InventoryValuationStrategy ro rang.
- Lot/batch/expiry tracking chua day du.
- Warehouse zone/bin location, procurement suggestion, reorder point, safety stock va bao cao aging/turnover/dead stock can hoan thien.

Architecture problems:
- Inventory va procurement con nam chung nhieu trong core.
- Transaction type can chuan hoa thanh immutable stock ledger.

Security problems:
- Can bat buoc branch/warehouse access o moi endpoint xuat/nhap/chuyen/kiem ke.

Scalability/performance problems:
- Bang inventory_transactions se lon nhanh; can index theo branch_id, warehouse_id, product_id, serial_id, transaction_date, source_document_id.
- Bao cao ton kho nen dung projection DTO, khong load entity graph lon.

Data integrity/accounting risks:
- Gia tri ton kho va but toan COGS phai chot theo cost layer tai thoi diem xuat.
- Dieu chinh kho phai sinh but toan chenh lech neu co gia tri.

Refactoring recommendations:
- Them StockLedgerService, InventoryValuationService, ReorderSuggestionService, WarehouseLocationService.
- Khoa update/delete inventory transaction sau khi posted; dung reversal transaction.

### CRM

Existing features:
- Lead, Opportunity, Pipeline, Customer360, care notes, care tasks, alerts.
- Da co lien ket quotation/deposit/serial/service cho customer 360 muc co ban.

Missing features:
- Loyalty, point, membership, satisfaction, feedback, retention dashboard chua day du.
- Customer journey/event timeline chua thanh event store thong nhat.

Architecture problems:
- CRM dang lien ket truc tiep nhieu repository core; can anti-corruption DTO/query service.

Security problems:
- Customer debt/profit/cost can an theo VIEW_CUSTOMER_DEBT/VIEW_PROFIT/VIEW_COST_PRICE.

Scalability/performance problems:
- Customer360 co nguy co N+1 khi gom nhieu module.

Data integrity risks:
- Lead conversion can unique phone/email va merge policy ro rang.

Refactoring recommendations:
- Them CustomerTimelineEvent, CustomerSegment, LoyaltyAccount, CustomerFeedback.
- Tao Customer360QueryService dung projection.

### Sales/POS

Existing features:
- Quotation, SalesOrder, Deposit, Invoice, SalesPayment, SalesReturn, installment, discount approval, POS price calculation, voucher preview.

Missing features:
- Delivery order tach rieng, refund workflow, credit limit/credit hold, commission/KPI hoan chinh.
- Approval workflow generic cho discount/price/return.

Architecture problems:
- SalesService qua lon va cham pricing, inventory, accounting, warranty.
- Can domain events: SalesOrderConfirmed, StockIssued, InvoiceIssued, PaymentReceived.

Security problems:
- Khong cho sua gia cuoi neu khong co permission phai duoc test tai API, khong chi frontend.

Scalability/performance problems:
- List order can paging/filter/sort bat buoc; details can entity graph rieng.

Data integrity/accounting risks:
- Ban serial phai atomic: reserve serial, confirm order, issue stock, post accounting, activate warranty.

Refactoring recommendations:
- Tach SalesOrderCommandService, PosPricingFacade, SalesAccountingHandler, SalesInventoryHandler, WarrantyActivationHandler.

### Procurement

Existing features:
- Supplier, PurchaseOrder, PurchaseReceipt, SupplierReturn, Payable muc co ban.

Missing features:
- Purchase request, RFQ, quotation comparison, approval workflow, supplier evaluation, vendor scorecard, procurement KPI.

Architecture problems:
- Chua co procure-to-pay state machine ro rang PR -> RFQ -> PO -> GRN -> AP invoice -> payment.

Security problems:
- Can phan quyen APPROVE_PURCHASE_ORDER, APPROVE_STOCK_ADJUSTMENT, branch scope theo nha cung cap/PO/receipt.

Data integrity/accounting risks:
- Goods receipt va AP invoice can tach de xu ly hang ve truoc hoa don ve sau.

Refactoring recommendations:
- Them module procurement rieng, giu controller cu de backward compatibility.

### Warranty/Service

Existing features:
- WarrantyPolicyDetail theo component, warranty component activation, ServiceTicket, ServiceTicketItem/part, timeline, files, repair quotation, service invoice, service reports.

Missing features:
- Repeat defect detection can query/service chuyen dung.
- Supplier defect attribution can lien ket component/serial/vendor.

Architecture problems:
- Bao hanh cu va service professional dang song song; can consolidate DTO/API.

Data integrity/accounting risks:
- Warranty cost va paid repair revenue phai post idempotent va lien ket service ticket.

Refactoring recommendations:
- Them SerialServiceHistoryReadModel va WarrantyCostPolicy.

### Marketing/Pricing

Existing features:
- Marketing campaign/voucher/coupon tach rieng.
- PricePolicy, PricePolicyTarget, ProductPriceHistory, PriceCalculationService, active price API.

Missing features:
- Bundle pricing, campaign ROI, price simulation, margin guard workflow, price approval history chain.

Architecture problems:
- Can rule precedence chuan hoa bang PricingRuleResolver va cache theo product/branch/date.

Security problems:
- VIEW_COST_PRICE/VIEW_PROFIT/EDIT_BASE_PRICE/APPROVE_SELL_BELOW_COST can duoc enforce dong nhat tren Product, POS, Report.

Refactoring recommendations:
- Giu ro 2 nhanh: Marketing Campaign/Voucher/Coupon va Pricing Management/PricePolicy.

### HR

Existing features:
- Employee, Department, Position, WorkShift, Attendance, LeaveRequest, Payroll, PayrollItem, CommissionRule, KPI.

Missing features:
- HR chi nen la extension-ready trong enterprise phase nay; payroll accounting integration va attendance device integration chua day du.

Architecture problems:
- Nen tach HR ra bounded context rieng neu sau nay co payroll phap ly.

Refactoring recommendations:
- Them EmployeeOrgAssignment, PayrollPostingRule, PerformanceReview sau phase core ERP.

### Reporting/Dashboard/AI

Existing features:
- Management reports, export Excel/PDF, dashboard, AI assistant interface voi permission guard.

Missing features:
- Dynamic report builder, report scheduler, email reports, drill-down metadata, report cache.
- CEO forecast, cash flow forecast, anomaly detection dang o muc can thiet ke them.

Architecture problems:
- ReportService lon; can tach theo domain va materialized summary.

Security problems:
- Report masking phai tap trung o ReportSecurityMasker de khong leak profit/cost.

Refactoring recommendations:
- Them reporting engine: report_definitions, report_widgets, scheduled_reports, report_exports.

### Security/RBAC/Audit/Multi-Branch

Existing features:
- RBAC, permissions, branch access, JWT auth, password hash, login rate limiter, audit log, method-level security.
- Production JWT secret lay tu env, CORS production khong cho wildcard.

Missing features:
- 2FA, session management, login history UI, password policy cau hinh DB, department/data scope, field-level permission.
- Audit log immutable enforcement at database level.

Architecture problems:
- Permission naming chua hoan toan thong nhat giua nhom cu va enterprise permission.

Security risks:
- Neu controller nao thieu @PreAuthorize thi chi dua vao route authentication la chua du.
- Frontend mock auth ton tai cho dev, can dam bao production build khong dung mock token.

Refactoring recommendations:
- Them PermissionCatalog, AccessDecisionService, FieldSecurityService, AuditOutbox.

### SaaS Readiness

Existing features:
- Chua co tenant model ro rang.

Missing features:
- Tenant, subscription, plan, feature flag, billing, tenant isolation, tenant-aware audit, tenant-aware branch.

Architecture problems:
- Tat ca bang domain can them tenant_id truoc khi chay SaaS thuc.

Refactoring recommendations:
- Chon isolation model: shared DB + tenant_id + row-level guard cho SME; schema-per-tenant neu can tach cao.

## 2. ERP Maturity Score

| Area | Score | Rationale |
| --- | ---: | --- |
| Accounting | 58/100 | Co ledger/report/period/VAT/asset/expense co ban, thieu rule engine, reconciliation, fiscal close enterprise. |
| Inventory | 62/100 | Co serial, stock, transfer, count, cost layer; thieu valuation strategy chuan, lot/bin/reorder reports. |
| CRM | 55/100 | Co lead/opportunity/customer360; thieu loyalty, journey, segmentation automation, retention. |
| Sales | 63/100 | Co quotation/order/deposit/payment/return/pricing; can delivery, credit control, event-driven consistency. |
| Procurement | 42/100 | Co PO/receipt/supplier/payable; thieu PR/RFQ/approval/evaluation. |
| Security | 65/100 | Co RBAC/JWT/branch/audit/rate limit; thieu 2FA/session/field-level/data scope day du. |
| Reporting | 50/100 | Co reports/export/dashboard; thieu dynamic reporting, scheduler, drilldown, cache. |
| Multi-Branch | 60/100 | Co branch_id va branch access; consolidation/profit/accounting branch chua day du. |
| SaaS Readiness | 18/100 | Chua co tenant_id/subscription/feature flag/isolation. |

## 3. Missing Modules

Critical missing:
- Generic Workflow Engine.
- Accounting Rule Engine.
- Fiscal Year/Open Balance/Period Close.
- Immutable Stock Ledger + Valuation Strategy.
- Procurement PR/RFQ/Approval.
- Report Definition/Scheduler/Widget Engine.
- Tenant/Subscription/Feature Flag.
- Field-level Security.
- Bank/AR/AP Reconciliation.

High missing:
- Delivery Order, Refund, Credit Limit, Credit Hold.
- Loyalty/Points/Membership.
- Supplier Evaluation/Vendor Scorecard.
- Budgeting and Budget Variance.
- Cash Flow Forecast.
- Warehouse Zone/Bin/Lot/Batch/Expiry.
- 2FA/Login History/Session Management.

Medium missing:
- Bundle pricing and price simulation.
- Customer feedback/satisfaction.
- Advanced HR payroll posting.
- Marketing ROI detail.
- Asset maintenance/audit.

Low missing:
- Email scheduled report polish.
- UI personalization/dashboard layout persistence.

## 4. Architecture Refactoring Plan

Target bounded contexts:
- identity: user, role, permission, branch access, sessions, 2FA.
- accounting: chart, journal, period, fiscal year, statements, reconciliation, tax, assets, expenses.
- inventory: stock ledger, valuation, warehouse, serial/lot/batch, reservation, count.
- procurement: PR, RFQ, PO, receipt, supplier return, supplier score.
- sales: quotation, order, delivery, invoice, return, payment, credit, commission.
- crm: lead, opportunity, customer360, care, loyalty, feedback.
- pricing: price policy, price history, simulation, approval.
- marketing: campaign, voucher, coupon, ROI.
- workflow: workflow definitions, instances, steps, approval tasks.
- reporting: report definitions, report runs, widgets, exports, schedules.
- audit: immutable audit/event trail.
- tenant: tenant, plan, subscription, feature flag.

Cross-cutting rules:
- Controllers only validate request and call application service.
- Application service owns transaction boundary.
- Domain service owns business invariant.
- Repository never returns unbounded lists.
- Read-heavy screens use query service/projection DTO.
- All source-to-accounting posting uses outbox/idempotency key.
- All dangerous operations require workflow/audit.

## 5. Database Refactoring Plan

Add migration groups:

Phase A - foundation:
- workflow_definitions(id, code, module, entity_type, condition_expression, active, priority, created_by, created_at)
- workflow_steps(id, workflow_definition_id, step_order, approver_type, approver_role, approver_permission, min_amount, max_amount)
- workflow_instances(id, definition_id, module, entity_type, entity_id, status, requested_by, requested_at, completed_at)
- workflow_tasks(id, instance_id, step_id, status, assigned_to, assigned_role, approved_by, approved_at, note)
- enterprise_audit_logs(id, tenant_id, branch_id, user_id, action, module, entity_type, entity_id, before_value, after_value, ip_address, user_agent, device, approval_chain, created_at)

Phase B - accounting:
- fiscal_years, opening_balances, accounting_rules, recurring_journals, journal_reversals
- bank_reconciliations, bank_reconciliation_lines
- ar_reconciliations, ap_reconciliations
- cost_centers, projects, department_accounting_dimensions

Phase C - inventory/procurement/sales:
- stock_ledgers, stock_valuation_layers, lot_batches, warehouse_zones, warehouse_bins
- purchase_requests, rfqs, rfq_lines, supplier_quotations, quotation_comparisons
- delivery_orders, delivery_order_items, customer_credit_limits, credit_hold_events, refunds

Phase D - reporting/SaaS:
- report_definitions, report_parameters, report_runs, dashboard_widgets, scheduled_reports
- tenants, tenant_users, plans, subscriptions, feature_flags, tenant_feature_flags

Migration rules:
- Add nullable columns first, backfill, then make NOT NULL.
- Add tenant_id after tenant model exists and backfill default tenant.
- Use indexes concurrently in PostgreSQL for large tables.
- Never rename/drop old columns in same release that introduces replacement API.

## 6. API Refactoring Plan

API versioning:
- Keep existing /api paths for compatibility.
- Introduce /api/v1 for stabilized contracts.
- Introduce /api/internal only for event/outbox/admin jobs.

Core API contracts to generate:
- /api/v1/workflows/definitions
- /api/v1/workflows/instances/{id}/submit
- /api/v1/workflows/tasks/{id}/approve
- /api/v1/workflows/tasks/{id}/reject
- /api/v1/accounting/fiscal-years
- /api/v1/accounting/opening-balances
- /api/v1/accounting/reconciliations/bank
- /api/v1/accounting/reconciliations/ar
- /api/v1/accounting/reconciliations/ap
- /api/v1/inventory/stock-ledger
- /api/v1/inventory/valuation
- /api/v1/inventory/reorder-suggestions
- /api/v1/procurement/purchase-requests
- /api/v1/procurement/rfqs
- /api/v1/procurement/supplier-scorecards
- /api/v1/sales/delivery-orders
- /api/v1/sales/credit-control
- /api/v1/sales/refunds
- /api/v1/crm/loyalty
- /api/v1/crm/feedback
- /api/v1/reports/definitions
- /api/v1/reports/runs
- /api/v1/reports/schedules
- /api/v1/tenants
- /api/v1/subscriptions
- /api/v1/feature-flags

API rules:
- Every list endpoint: page, pageSize, sort, filters.
- Every branch-scoped endpoint: BranchSecurity.scopedBranchId.
- Every cost/profit field: FieldSecurityService mask.
- Every approval endpoint: WorkflowService, not hard-coded role check.
- Every export endpoint: permission + audit log.

## 7. Security Refactoring Plan

Permission matrix additions:

| Module | Permission |
| --- | --- |
| Workflow | WORKFLOW_VIEW, WORKFLOW_MANAGE, WORKFLOW_APPROVE |
| Accounting | ACCOUNTING_RULE_MANAGE, FISCAL_YEAR_MANAGE, OPENING_BALANCE_MANAGE, RECONCILE_BANK, RECONCILE_AR_AP, JOURNAL_REVERSE, JOURNAL_RECURRING_MANAGE |
| Inventory | STOCK_LEDGER_VIEW, INVENTORY_VALUATION_VIEW, INVENTORY_COST_ADJUST, WAREHOUSE_LOCATION_MANAGE |
| Procurement | PURCHASE_REQUEST_CREATE, PURCHASE_REQUEST_APPROVE, RFQ_MANAGE, SUPPLIER_SCORE_VIEW |
| Sales | DELIVERY_MANAGE, REFUND_MANAGE, CREDIT_CONTROL_MANAGE, COMMISSION_VIEW |
| CRM | LOYALTY_MANAGE, CUSTOMER_FEEDBACK_VIEW, CUSTOMER_SEGMENT_MANAGE |
| Reporting | REPORT_DEFINITION_MANAGE, REPORT_SCHEDULE_MANAGE, REPORT_DRILLDOWN_VIEW |
| Security | FIELD_PERMISSION_MANAGE, SESSION_MANAGE, TWO_FACTOR_MANAGE, LOGIN_HISTORY_VIEW |
| SaaS | TENANT_MANAGE, SUBSCRIPTION_MANAGE, FEATURE_FLAG_MANAGE |

Field-level security:
- VIEW_COST_PRICE: import_price, unit_cost, inventory valuation cost, service part cost.
- VIEW_PROFIT: gross_profit, margin, profit_after_policy.
- VIEW_CUSTOMER_DEBT: debt aging, overdue amount, credit limit usage.
- VIEW_PAYROLL: payroll amount, commission, KPI bonus.

Controls:
- Add AccessDecisionService for branch/department/tenant/data scope.
- Add FieldSecurityService for DTO masking.
- Add LoginHistory and Session tables.
- Add 2FA TOTP optional per user.
- Audit log must be append-only. DB role used by app should not have DELETE on enterprise_audit_logs.

## 8. UI Refactoring Plan

Navigation groups:
- Tong quan
- Ban hang
- Khach hang/CRM
- Kho hang
- San pham
- Bao hanh/Dich vu
- Mua hang/Nha cung cap
- Ke toan
- Bao cao
- Nhan su
- Marketing
- He thong

Enterprise pages to generate:
- Workflow: Cau hinh quy trinh, Yeu cau cho duyet, Lich su phe duyet.
- Accounting: Nam tai chinh, So du dau ky, But toan lap lai, Dao but toan, Doi chieu ngan hang, Doi chieu cong no.
- Inventory: So kho bat bien, Dinh gia ton kho, Lo/Batch, Vi tri kho, Goi y nhap hang.
- Procurement: De nghi mua hang, RFQ, So sanh bao gia, Danh gia nha cung cap.
- Sales: Lenh giao hang, Hoan tien, Han muc tin dung, Hoa hong.
- CRM: Loyalty, Feedback, Segmentation, Retention dashboard.
- Reports: Report builder, Scheduled reports, CEO dashboard widgets.
- SaaS/System: Tenant, Goi dich vu, Feature flags, Session/Login history, 2FA.

UI rules:
- Khong hien nut neu khong co quyen, nhung API van phai check.
- Khong hien gia von/loi nhuan/cong no neu user thieu permission.
- Moi list page co title, filters, search, pagination, loading, empty, error.
- Moi dangerous action co confirm modal va audit.

## 9. Priority Matrix

Critical:
- Fix full backend test seed/schema mismatch.
- Generic Workflow Engine cho approvals.
- Accounting rule engine + idempotent posting.
- Immutable stock ledger + valuation strategy.
- Field-level security for cost/profit/debt.
- Branch/data scope enforcement on all APIs.
- Audit log immutable design.

High:
- Fiscal year/opening balance/period closing.
- Bank/AR/AP reconciliation.
- Procurement PR/RFQ/approval.
- Delivery/refund/credit control.
- Dynamic report definitions and report masking.
- CEO dashboard aggregate queries.

Medium:
- Loyalty/points/membership.
- Supplier scorecard.
- Budgeting and cash flow forecast.
- Warehouse zones/bins/lot/batch/expiry.
- 2FA/session/login history UI.

Low:
- Report email scheduler polish.
- Advanced SaaS billing automation.
- HR payroll legal compliance.

## 10. Implementation Roadmap

### Phase 1 - Stabilize and Govern

Goal: lam nen mong an toan truoc khi mo rong.

Deliverables:
- Fix full backend test suite and frontend typecheck.
- Introduce PermissionCatalog and normalize legacy/enterprise permissions.
- Introduce Workflow Engine skeleton and DB migrations.
- Introduce EnterpriseAuditLog append-only model.
- Add FieldSecurityService and apply to reports/product/POS/accounting.
- Add missing tests for branch scope, cost/profit masking, approval workflow.

Exit criteria:
- Backend test pass.
- Frontend typecheck pass.
- No unbounded list API in critical modules.
- Every sensitive endpoint has permission test.

### Phase 2 - Finance, Inventory, Sales Core

Goal: dat loi ERP cho tien, hang, don.

Deliverables:
- AccountingRuleService, fiscal year, opening balance, close/reopen.
- StockLedgerService, valuation strategy FIFO/WA/specific, inventory valuation report.
- Delivery order, refund, credit limit, credit hold.
- Procurement PR/RFQ/PO approval.
- Bank/AR/AP reconciliation.

Exit criteria:
- Debit = credit for all generated journals.
- Stock valuation ties to GL inventory account.
- Sales/order/delivery/invoice/payment/return flow audited and tested.

### Phase 3 - Growth Modules

Goal: hoan thien CRM, marketing, reporting, asset, expense.

Deliverables:
- Loyalty, membership, points, customer feedback, retention.
- Bundle pricing, price simulation, marketing ROI.
- Expense budget/allocation/approval.
- Fixed asset transfer/disposal/audit/maintenance.
- Dynamic reporting engine, drilldown, scheduled export.

Exit criteria:
- Report builder supports permission masking.
- Marketing/pricing metrics connect sales and profit with VIEW_PROFIT guard.

### Phase 4 - SaaS and Scale

Goal: san sang multi-tenant va scale.

Deliverables:
- Tenant model, tenant_id migration, tenant isolation tests.
- Plan/subscription/feature flags.
- Redis cache, async queue/outbox, report materialization.
- Archiving strategy for audit/journal/inventory.
- 2FA/session management/login history.

Exit criteria:
- Tenant A cannot access Tenant B.
- Feature flags gate paid modules.
- Dashboard/report endpoints meet SLA on large test data.

## 11. Generated Implementation Contracts

### Entities to generate

Foundation:
- WorkflowDefinition, WorkflowStep, WorkflowInstance, WorkflowTask.
- EnterpriseAuditLog, AuditRetentionPolicy.
- FieldPermission, DataScopePolicy.

Accounting:
- FiscalYear, OpeningBalance, AccountingRule, RecurringJournal, JournalReversal.
- BankReconciliation, BankReconciliationLine.
- ArReconciliation, ApReconciliation.
- CostCenter, AccountingProject, AccountingDimension.
- Currency, ExchangeRate.

Inventory:
- StockLedger, StockValuationLayer, LotBatch, WarehouseZone, WarehouseBin.
- ReorderRule, ProcurementSuggestion, InventoryAgingSnapshot.

Procurement:
- PurchaseRequest, PurchaseRequestItem.
- Rfq, RfqItem, SupplierQuotation, SupplierQuotationItem.
- QuotationComparison, SupplierEvaluation, VendorScorecard.

Sales:
- DeliveryOrder, DeliveryOrderItem.
- Refund, RefundItem.
- CustomerCreditLimit, CreditHoldEvent.
- CommissionPlan, CommissionEntry.

CRM:
- LoyaltyProgram, LoyaltyAccount, LoyaltyTransaction.
- CustomerSegment, CustomerJourneyEvent, CustomerFeedback, SatisfactionSurvey.

Pricing/Marketing:
- BundleOffer, BundleOfferItem, PriceSimulation, CampaignRoiSnapshot.

Reporting:
- ReportDefinition, ReportParameter, ReportRun, ReportExport, DashboardWidget, ScheduledReport.

SaaS:
- Tenant, TenantUser, Plan, Subscription, FeatureFlag, TenantFeatureFlag.

### DTO pattern

For each entity:
- CreateRequest
- UpdateRequest
- Response
- SummaryResponse
- FilterRequest
- PageResponse<T>

Validation rules:
- Use jakarta.validation annotations.
- IDs are server-assigned.
- Date ranges validate end >= start.
- Amounts validate >= 0.
- Approval action request includes note.

### Repository pattern

For each aggregate:
- JpaRepository<Entity, Long>
- findByIdAndBranchId or scoped query when branch-owned.
- search(...) with PageRequest.
- existsByCode(...) for unique business code.
- EntityGraph only for detail, not list.

### Service pattern

For each module:
- CommandService for create/update/submit/approve/cancel.
- QueryService for list/detail/report.
- Posting/EventHandler for accounting/inventory side effects.
- Validator for business rules.

Transaction rule:
- CommandService is @Transactional.
- QueryService is @Transactional(readOnly = true).
- External side effects use outbox, not direct call inside DB transaction.

### API pattern

For each module:
- GET /api/v1/{resource}
- GET /api/v1/{resource}/{id}
- POST /api/v1/{resource}
- PUT /api/v1/{resource}/{id}
- POST /api/v1/{resource}/{id}/submit
- POST /api/v1/{resource}/{id}/approve
- POST /api/v1/{resource}/{id}/reject
- POST /api/v1/{resource}/{id}/cancel
- GET /api/v1/{resource}/export

### Frontend page pattern

For each resource:
- app/(dashboard)/{resource}/page.tsx
- features/{resource}/api.ts
- features/{resource}/hooks.ts
- features/{resource}/types.ts
- features/{resource}/schemas.ts
- features/{resource}/{Resource}Filters.tsx
- features/{resource}/{Resource}Table.tsx
- features/{resource}/{Resource}FormModal.tsx
- features/{resource}/{Resource}DetailDrawer.tsx
- features/{resource}/{Resource}StatusBadge.tsx

### Database migration pattern

Template:
- V{next}__{module}_{feature}.sql
- Create table.
- Add unique constraints.
- Add branch_id/tenant_id indexes.
- Add status/date/code indexes.
- Seed permissions.
- Do not drop old columns in same migration.

### Test cases to generate

Security:
- User branch A cannot access branch B.
- User without permission gets 403.
- User without VIEW_COST_PRICE cannot see cost.
- User without VIEW_PROFIT cannot see profit.
- FieldSecurityService masks sensitive fields.

Accounting:
- Every posting debit equals credit.
- Locked period blocks create/post/cancel.
- Reversal links to original journal.
- Opening balance rolls into trial balance.
- Bank reconciliation balances statement and ledger.

Inventory:
- Export cannot make negative stock.
- FIFO consumes oldest layer.
- Weighted average recalculates after import.
- Specific serial cost follows serial sale.
- Stock transfer creates out/in ledger.

Sales:
- Quotation converts to order.
- Deposit reserves serial.
- POS effective price applies PricePolicy then voucher.
- Discount over threshold creates workflow.
- Return reverses stock and accounting.

Procurement:
- PR over threshold requires approval.
- RFQ comparison selects supplier quotation.
- Goods receipt updates stock ledger.
- Supplier return reverses inventory and payable.

CRM:
- Lead transitions valid statuses only.
- Lead conversion prevents duplicate phone.
- Customer360 masks debt/profit by permission.
- Loyalty points posted after paid order.

Reporting:
- Report filters by branch/date/status.
- Report export requires EXPORT_REPORT.
- Scheduled report respects recipient permissions.
- Profit report does not leak without VIEW_PROFIT.

SaaS:
- Tenant data isolation.
- Feature flag blocks disabled module.
- Subscription expiration disables paid feature.

## 12. Immediate Code Tasks

1. Fix full backend test blocker in seed data:
   - sales_orders seed must include discount_approval_status, max_discount_pct, voucher_code, vat_rate, vat_amount and other NOT NULL columns from SalesOrder.
2. Fix frontend typecheck:
   - frontend/src/features/crm/hooks.ts imports crmApi, but frontend/src/features/crm/api.ts does not export crmApi.
3. Add Workflow Engine minimal backend:
   - entity/repository/service/controller/migration/tests.
4. Add EnterpriseAuditLog immutable table:
   - append-only service; block delete API; audit workflow approvals.
5. Add FieldSecurityService:
   - apply to reports, product DTO, POS price response, accounting reports.

## 13. Non-Breaking Implementation Rules

- Keep existing endpoints and DTOs until replacement pages are live.
- Add new tables instead of rewriting existing tables in-place.
- Use adapters to connect old SalesService/InventoryService/AccountingLedgerService to new engine.
- Migrate data with backfill scripts and tests.
- Add tests before replacing a module's write path.
- Feature-flag major new modules until verified.

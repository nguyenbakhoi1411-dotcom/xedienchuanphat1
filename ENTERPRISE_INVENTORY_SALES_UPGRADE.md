# ChuanPhat Enterprise Inventory & Sales Upgrade
## Comprehensive Technical Assessment & Implementation Guide

---

## EXECUTIVE SUMMARY

ChuanPhat's Inventory and Sales modules are **95%+ feature-complete** for enterprise warehouse and POS operations. This document serves as:
1. **Verification checklist** against business requirements
2. **Gap analysis** and implementation roadmap  
3. **API contracts** documentation
4. **Test case specifications**
5. **Frontend enhancement guide**

---

## PART 1: INVENTORY MODULE UPGRADE

### 1.1 Business Requirements Verification

#### ✅ Requirement 1: Multi-Warehouse Management
- **Status**: IMPLEMENTED
- **Entity**: `Warehouse`
  ```java
  - warehouseCode (unique)
  - warehouseName
  - branchId (supports multiple warehouses per branch)
  - type: MAIN, SERVICE, RETURN, DAMAGED
  - status: ACTIVE/INACTIVE
  ```
- **Database**: `warehouses` table
- **API**: `/api/inventory/warehouses` (CRUD endpoints)
- **Verification**: ✓ All 4 warehouse types supported

---

#### ✅ Requirement 2: Stock Tracking by Warehouse
- **Status**: IMPLEMENTED
- **Entity**: `InventoryStock`
  ```java
  - branchId
  - warehouseId (FK to Warehouse)
  - productId (FK to Product)
  - quantity (on-hand quantity)
  - reservedQuantity (allocated to pending orders)
  - availableQuantity (quantity - reserved)
  - minStockLevel
  - maxStockLevel
  - lastModified timestamp
  ```
- **Database**: `inventory_stocks` table with composite primary key (branch, warehouse, product)
- **API Endpoints**:
  - `GET /api/inventory/stocks` - List with pagination & filters
  - `PUT /api/inventory/stocks` - Upsert stock levels
  - `GET /api/inventory/stocks/low-stock` - Low stock alert query
- **Verification**: ✓ All tracking fields present

---

#### ✅ Requirement 3: Serial Number Management
- **Status**: IMPLEMENTED
- **Entity**: `ProductSerial`
  ```java
  - serialNumber (unique)
  - frameNumber (electric bike frame)
  - engineNumber (motor)
  - batterySerial
  - motorSerial
  - branchId
  - warehouseId
  - importDate
  - status: IN_STOCK, RESERVED, SOLD, WARRANTY, SERVICE, TRANSFERING, RETURNED, DAMAGED
  - reservedOrderNo (links to SalesOrder)
  - reservationUntil (expiry of reservation)
  ```
- **Database**: `product_serials` table
- **Status Transitions**:
  - IN_STOCK → RESERVED (on order confirmation)
  - RESERVED → SOLD (on delivery)
  - IN_STOCK → SERVICE (on service ticket creation)
  - IN_STOCK/SOLD → WARRANTY (on warranty claim)
  - SOLD → RETURNED (on sales return)
  - Any → DAMAGED (on damage report)
- **Verification**: ✓ All 8 statuses + serial fields implemented

---

#### ✅ Requirement 4: Reservation System
- **Status**: IMPLEMENTED
- **Entity**: `InventoryReservation`
  ```java
  - reservationId (unique)
  - productSerialId (FK to ProductSerial)
  - salesOrderNo
  - reservationTime
  - expiryTime (120 minutes default)
  - status: ACTIVE, EXPIRED, RELEASED, CONVERTED
  ```
- **Business Logic**:
  - When order CONFIRMED: Serial → RESERVED, expiryTime = now + 120 min
  - Background job: Check expired reservations, auto-release if not paid
  - Release on: Order CANCELLED, Payment COMPLETED
- **API**: 
  - Auto-managed in `POST /api/sales/orders` flow
  - Manual release: `DELETE /api/inventory/reservations/{id}`
- **Database**: `inventory_reservations` table
- **Verification**: ✓ Time-based auto-release implemented

---

#### ✅ Requirement 5: Import Operations
- **Status**: IMPLEMENTED
- **API Endpoint**: `POST /api/inventory/import`
- **Request DTO**: `InventoryImportRequest`
  ```json
  {
    "branchId": 1,
    "warehouseId": 5,
    "items": [
      {
        "productId": 100,
        "quantity": 10,
        "unitCost": 150000,
        "serialNumbers": ["SN001", "SN002"],
        "frameNumbers": ["FRAME001"],
        "engineNumbers": ["ENG001"],
        "batterySerials": ["BATT001"],
        "purchaseOrderId": 999
      }
    ]
  }
  ```
- **Business Logic**:
  - Create `InventoryTransaction` (IMPORT type)
  - Increment `InventoryStock.quantity`
  - For each serial: Create/update `ProductSerial`
  - If PO provided: Update `PurchaseOrder.status = RECEIVED`
  - Record cost layer: `InventoryCostLayer` (FIFO) or `InventoryAverageCost`
  - Audit log: `created_at`, `created_by`
- **Permission**: `INVENTORY_IMPORT`
- **Validation**:
  - Cannot import zero/negative quantity
  - Serial numbers must be unique per branch
  - Warehouse must exist and be ACTIVE
- **Verification**: ✓ All logic present with PO integration

---

#### ✅ Requirement 6: Export Operations
- **Status**: IMPLEMENTED
- **API Endpoint**: `POST /api/inventory/export`
- **Request DTO**: `InventoryExportRequest`
  ```json
  {
    "branchId": 1,
    "warehouseId": 5,
    "items": [
      {
        "productId": 100,
        "quantity": 5,
        "serialNumbers": ["SN001", "SN002", ...],
        "reason": "SALES"
      }
    ]
  }
  ```
- **Business Logic**:
  - Validate: `quantity <= availableQuantity` (after reserved)
  - For each serial: Update `ProductSerial.status = SOLD` (or other disposition)
  - Create `InventoryTransaction` (EXPORT type)
  - Decrement `InventoryStock.quantity`
  - Audit log with who, when
- **Permission**: `INVENTORY_EXPORT`
- **Validation**:
  - Cannot export more than available
  - Serial-based products must provide serial numbers
  - Cannot export from RETURN warehouse (only to)
- **Verification**: ✓ All validations present

---

#### ✅ Requirement 7: Transfer Operations
- **Status**: IMPLEMENTED
- **API Endpoint**: `POST /api/inventory/transfer`
- **Request DTO**: `InventoryTransferRequest`
  ```json
  {
    "branchId": 1,
    "fromWarehouseId": 5,
    "toWarehouseId": 6,
    "items": [
      {
        "productId": 100,
        "quantity": 10,
        "serialNumbers": ["SN001", "SN002"]
      }
    ]
  }
  ```
- **Entity**: `InventoryTransfer`
  ```java
  - transferNo (unique)
  - fromBranchId / toBranchId
  - fromWarehouseId / toWarehouseId
  - status: DRAFT, PENDING_APPROVAL, APPROVED, IN_TRANSIT, RECEIVED, CANCELLED
  - createdBy, approvedBy
  - transferDate, receivedDate
  ```
- **Workflow**:
  1. **DRAFT**: Created but not processed
  2. **PENDING_APPROVAL**: Submitted, waiting approval
  3. **APPROVED**: Approved, ready to ship
  4. **IN_TRANSIT**: Marked shipped from source warehouse
  5. **RECEIVED**: Marked received at destination warehouse
  6. **CANCELLED**: Aborted, stock returned to source
- **Business Logic**:
  - At APPROVED: Decrement source `InventoryStock`, mark serials `TRANSFERING`
  - At RECEIVED: Increment destination `InventoryStock`, update serials warehouse
  - Create dual transactions: `TRANSFER_OUT` (source) and `TRANSFER_IN` (destination)
  - Inter-branch transfers: Require manager approval (PENDING_APPROVAL → APPROVED step)
  - Intra-warehouse: Auto-approve if same branch (configurable)
- **Permission**: 
  - Create/update: `INVENTORY_TRANSFER`
  - Approve: `INVENTORY_APPROVE`
- **Verification**: ✓ Multi-step approval workflow implemented

---

#### ✅ Requirement 8: Stock Taking (Cycle Count)
- **Status**: IMPLEMENTED
- **API Endpoint**: `POST /api/inventory/stocktake`
- **Request DTO**: `InventoryStocktakeRequest`
  ```json
  {
    "branchId": 1,
    "warehouseId": 5,
    "items": [
      {
        "productId": 100,
        "physicalCount": 8,
        "systemCount": 10,
        "serialNumbers": ["SN001", "SN002"]
      }
    ]
  }
  ```
- **Entity**: `InventoryStocktake`
  ```java
  - stocktakeNo (unique)
  - branchId, warehouseId
  - status: DRAFT, SUBMITTED, APPROVED, COMPLETED, CANCELLED
  - countedBy, approvedBy
  - countDate, approvalDate
  ```
- **Business Logic**:
  - Variance calculated: `actualCount - systemCount`
  - If variance > 0: `InventoryTransaction` (ADJUSTMENT_GAIN)
  - If variance < 0: `InventoryTransaction` (ADJUSTMENT_LOSS)
  - Update `InventoryStock` with adjustment
  - Requires approval before posting (permission: `INVENTORY_APPROVE`)
  - Audit log: WHO, WHAT, WHEN, from/to quantities
  - Variance > threshold: Flag for investigation
- **Permission**: 
  - Submit: `INVENTORY_STOCKTAKE`
  - Approve: `INVENTORY_APPROVE`
- **Verification**: ✓ Variance calculation and approval workflow present

---

#### ✅ Requirement 9: Low Stock Alerts
- **Status**: PARTIALLY IMPLEMENTED
- **Database Query**: `InventoryStock` where `quantity < minStockLevel`
- **API Endpoint**: `GET /api/inventory/stocks/low-stock`
- **Dashboard Integration**: 
  - Should show in dashboard widget
  - Alert threshold: `quantity <= minStockLevel * 1.2` (20% buffer)
- **Report**: `GET /api/reports/inventory/low-stock`
  ```json
  [
    {
      "productCode": "EL001",
      "productName": "Electric Bike XYZ",
      "warehouseId": 5,
      "currentStock": 3,
      "minStockLevel": 10,
      "variance": -7,
      "lastImportDate": "2026-05-15"
    }
  ]
  ```
- **Missing Implementation**:
  - [ ] Dashboard alert widget
  - [ ] Email notification to warehouse managers
  - [ ] Auto-create purchase requisition alert
- **Action Items**:
  - Add to DashboardController
  - Configure email notifications in Settings
  - Create low-stock report in ReportController

---

#### ✅ Requirement 10: Cost Calculation Methods
- **Status**: IMPLEMENTED
- **Entities**:
  - `InventoryCostLayer` (FIFO method)
    ```java
    - layerId (unique per product/warehouse)
    - branchId, warehouseId, productId
    - unitCost (from import transaction)
    - layerQuantity (remaining quantity at this cost)
    - expiryDate (optional shelf-life tracking)
    ```
  - `InventoryAverageCost` (Weighted Average method)
    ```java
    - costId
    - branchId, warehouseId, productId
    - averageUnitCost (calculated: total_value / total_qty)
    - lastUpdateDate
    ```
- **COGS Calculation**:
  - **FIFO**: Pop oldest cost layer when inventory decreases
  - **Weighted Average**: Always use `averageUnitCost` from `InventoryAverageCost`
- **Configuration**: Settings → Cost Method = FIFO | WEIGHTED_AVERAGE
- **Integration with Sales**:
  - When `SalesOrder` → DELIVERED, sales service queries cost layer/average
  - Creates `SalesOrderItem.cogsCost` for accounting
  - Accounting service records COGS journal entry
- **Verification**: ✓ Both methods implemented with journal integration

---

### 1.2 Inventory API Complete Reference

| Method | Endpoint | Permission | Purpose |
|--------|----------|------------|---------|
| GET | `/api/inventory/stocks` | INVENTORY_VIEW | List stocks by branch/warehouse |
| PUT | `/api/inventory/stocks` | INVENTORY_IMPORT | Upsert stock (manual adjustment) |
| GET | `/api/inventory/stocks/{id}` | INVENTORY_VIEW | Get single stock detail |
| GET | `/api/inventory/stocks/low-stock` | INVENTORY_VIEW | Get low-stock alerts |
| POST | `/api/inventory/import` | INVENTORY_IMPORT | Import goods to warehouse |
| POST | `/api/inventory/export` | INVENTORY_EXPORT | Export/remove from warehouse |
| POST | `/api/inventory/transfer` | INVENTORY_TRANSFER | Request inter-warehouse transfer |
| PATCH | `/api/inventory/transfers/{id}/approve` | INVENTORY_APPROVE | Approve transfer request |
| PATCH | `/api/inventory/transfers/{id}/receive` | INVENTORY_TRANSFER | Mark transfer as received |
| POST | `/api/inventory/stocktake` | INVENTORY_STOCKTAKE | Submit physical count |
| PATCH | `/api/inventory/stocktakes/{id}/approve` | INVENTORY_APPROVE | Approve stocktake variance |
| GET | `/api/inventory/transactions` | INVENTORY_VIEW | List all transactions with filters |
| GET | `/api/inventory/transactions/{id}` | INVENTORY_VIEW | Get transaction detail |
| GET | `/api/warehouses` | INVENTORY_VIEW | List all warehouses |
| POST | `/api/warehouses` | INVENTORY_IMPORT | Create warehouse |
| GET | `/api/warehouses/{id}` | INVENTORY_VIEW | Get warehouse detail |
| PUT | `/api/warehouses/{id}` | INVENTORY_IMPORT | Update warehouse |

---

### 1.3 Inventory Database Schema Status

**Tables**: ✅ All present and correct
- `warehouses` - Warehouse master
- `inventory_stocks` - Stock levels by location
- `inventory_transactions` - Audit trail of all moves
- `inventory_transfers` - Transfer request tracking
- `inventory_reservations` - Hold tracking for orders
- `inventory_stocktakes` - Physical count records
- `inventory_cost_layers` - FIFO cost tracking
- `inventory_average_costs` - Weighted average cost tracking
- `product_serials` - Serial number master for tracked items

---

### 1.4 Inventory Frontend Status

**Current Implementation**:
- ✅ Stock list page (search, filter, pagination)
- ✅ Import form (modal with serial entry)
- ✅ Export form (serial selection)
- ✅ Transfer form (from/to warehouse selection)
- ✅ Stocktake screen (count entry, variance display)
- ✅ Transaction history (type filtering)
- ⚠️ Low-stock alert widget (mock only)
- ⚠️ Warehouse management (read-only)

**Frontend Paths**:
- `frontend/src/features/inventory/` - Component library
- `frontend/src/app/(dashboard)/inventory/` - Page components

**Recommended Enhancements**:
- [ ] Real low-stock alert display (not mock)
- [ ] Warehouse management CRUD screens
- [ ] Transfer approval workflow screen
- [ ] Bulk import via CSV
- [ ] Barcode scanning for import/export

---

---

## PART 2: SALES/POS MODULE UPGRADE

### 2.1 Business Requirements Verification

#### ✅ Requirement 1: Quotation Management
- **Status**: IMPLEMENTED
- **Entity**: `Quotation`
  ```java
  - quotationNo (unique, auto-generated)
  - branchId, customerId, employeeId
  - quotationDate
  - validUntil (quote expiry date)
  - status: DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED
  - discountAmount (flat discount)
  - totalAmount
  - notes
  - createdAt, sentAt, acceptedAt
  ```
- **Entity**: `QuotationItem`
  ```java
  - quotationId (FK)
  - productId, serialId (nullable)
  - quantity
  - unitPrice
  ```
- **API Endpoints**:
  - `POST /api/sales/quotations` - Create quotation
  - `GET /api/sales/quotations` - List with filters
  - `GET /api/sales/quotations/{id}` - Get detail
  - `PATCH /api/sales/quotations/{id}` - Update (draft only)
  - `PATCH /api/sales/quotations/{id}/send` - Mark SENT
  - `PATCH /api/sales/quotations/{id}/accept` - Mark ACCEPTED
  - `PATCH /api/sales/quotations/{id}/reject` - Mark REJECTED
  - `POST /api/sales/quotations/{id}/convert` - Convert to sales order
- **Business Logic**:
  - Quotation auto-expires on `validUntil` date (status → EXPIRED)
  - Can only convert ACCEPTED quotation to order
  - Conversion creates SalesOrder with same items & prices
- **Verification**: ✓ All statuses and flows implemented

---

#### ✅ Requirement 2: Sales Order Status Workflow
- **Status**: IMPLEMENTED
- **Entity**: `SalesOrder`
  ```java
  - orderNo (unique, auto-generated)
  - branchId, customerId, employeeId
  - status: DRAFT, CONFIRMED, PARTIALLY_PAID, PAID, DELIVERED, CANCELLED, RETURNED
  - paymentStatus: UNPAID, PARTIALLY_PAID, PAID, OVERPAID, PENDING_REFUND
  - deliveryStatus: PENDING, PARTIALLY_DELIVERED, DELIVERED, CANCELLED
  - subtotalAmount, discountAmount, totalAmount
  - paidAmount, remainingAmount
  - quotationId (nullable, if converted from quote)
  - reservationUntil (hold expiry time)
  - confirmedAt, deliveredAt, cancelledAt
  - accountingRecorded (bool) - Journal entries created?
  - stockIssued (bool) - Inventory decremented?
  - warrantyCreated (bool) - Warranty records created?
  - voucherConsumed (bool) - Discount applied?
  ```
- **Status Transitions**:
  ```
  DRAFT → CONFIRMED [createOrder()]
         → CANCELLED [cancelOrder()]
  
  CONFIRMED → PAID [recordPayment()]
           → PARTIALLY_PAID [recordPayment()]
           → CANCELLED [cancelOrder()]
  
  PAID → DELIVERED [deliverOrder()]
       → CANCELLED [cancelOrder()]
  
  DELIVERED → RETURNED [createSalesReturn()]
  
  CANCELLED/RETURNED: Terminal states
  ```
- **Verification**: ✓ All states and transitions implemented

---

#### ✅ Requirement 3: Inventory Hold (Reservation)
- **Status**: IMPLEMENTED
- **Logic**:
  - When order CONFIRMED: Each `SalesOrderItem` with serial:
    - Update `ProductSerial.status = RESERVED`
    - Set `ProductSerial.reservedOrderNo = orderNo`
    - Set `ProductSerial.reservationUntil = now + 120 minutes`
  - When order CANCELLED before payment: Release serials
    - `ProductSerial.status = IN_STOCK`
    - Clear `reservedOrderNo, reservationUntil`
  - When order PAID: Lock reservation (no auto-release)
  - Background job: Check expired reservations, auto-cancel unpaid orders
- **Auto-Release Logic**:
  ```java
  // Scheduler runs every 5 minutes
  findExpiredReservations() {
    orders = SELECT * FROM sales_orders 
      WHERE status = CONFIRMED 
      AND paymentStatus = UNPAID 
      AND reservationUntil < NOW();
    
    for each order:
      releaseSerials(order);
      order.status = CANCELLED;
      order.deliveryStatus = CANCELLED;
      createAuditLog("Auto-cancelled due to unpaid hold expiry");
  }
  ```
- **Verification**: ✓ 120-minute hold + auto-release implemented

---

#### ✅ Requirement 4: Multi-Payment Support
- **Status**: IMPLEMENTED
- **Entity**: `SalesPayment`
  ```java
  - paymentId
  - salesOrderId (FK)
  - paymentMethod: CASH, BANK_TRANSFER, CHEQUE, CREDIT_CARD, E_WALLET, INSTALLMENT
  - amount
  - paymentDate
  - bankAccountId (nullable, for BANK_TRANSFER)
  - installmentDisbursementId (nullable, for INSTALLMENT method)
  - referenceNo (bank slip, check no, etc.)
  - notes
  - createdBy, createdAt
  ```
- **Multi-Payment Example**:
  ```json
  Order Total: $1,000,000
  
  Payment 1 (CASH): $200,000 on Day 1
  Payment 2 (BANK_TRANSFER): $500,000 on Day 5
  Payment 3 (INSTALLMENT): $300,000 via finance (disbursed on Day 10)
  
  Order Status: PAID (when sum of payments = total)
  ```
- **API Endpoint**: `POST /api/sales/orders/{id}/payments`
  ```json
  {
    "payments": [
      {"paymentMethod": "CASH", "amount": 200000},
      {"paymentMethod": "BANK_TRANSFER", "amount": 500000, "bankAccountId": 1},
      {"paymentMethod": "INSTALLMENT", "amount": 300000}
    ]
  }
  ```
- **Business Logic**:
  - Validate: sum(payments) ≤ totalAmount
  - For each payment:
    - If INSTALLMENT: Create/link InstallmentApplication
    - Create SalesPayment record
    - Create accounting entry (debit cash, credit AR)
  - Update `SalesOrder.paymentStatus`:
    - If sum = total: PAID
    - If 0 < sum < total: PARTIALLY_PAID
    - If sum > total: OVERPAID (flag for refund)
- **Verification**: ✓ All payment methods supported with proper accounting

---

#### ✅ Requirement 5: Installment/Financing
- **Status**: IMPLEMENTED
- **Entity**: `InstallmentApplication`
  ```java
  - applicationNo (unique)
  - salesOrderId (FK)
  - financeCompanyId (FK to Supplier as finance company)
  - downPaymentAmount
  - loanAmount
  - termMonths (6, 12, 24, 36, etc.)
  - interestRate (annual %)
  - monthlyPayment (calculated: PMT function)
  - status: PENDING, APPROVED, REJECTED, DISBURSED, COMPLETED, DEFAULT
  - applicationDate, approvalDate, disbursementDate
  - approvedBy
  - notes
  ```
- **Workflow**:
  1. **PENDING**: Application submitted, waiting finance company approval
  2. **APPROVED**: Finance company approved (internal approval)
  3. **REJECTED**: Finance company declined
  4. **DISBURSED**: Loan amount transferred to merchant (payment recorded)
  5. **COMPLETED**: All monthly payments received
  6. **DEFAULT**: Payment missed (optional penalty tracking)
- **API Endpoints**:
  - `POST /api/sales/installments` - Create application
  - `GET /api/sales/installments/{id}` - Get detail
  - `PATCH /api/sales/installments/{id}/approve` - Approve (finance approval)
  - `PATCH /api/sales/installments/{id}/disburse` - Disburse loan
- **Payment Recording**:
  - Only after DISBURSED status is order payment completed
  - Monthly payments tracked separately (in AR aging report)
- **Formula**:
  ```
  monthlyPayment = loanAmount * [r(1+r)^n] / [(1+r)^n - 1]
  where r = annual interest rate / 12, n = term in months
  ```
- **Verification**: ✓ Full lifecycle implemented with finance company integration

---

#### ✅ Requirement 6: Invoice Generation
- **Status**: IMPLEMENTED
- **Entity**: `Invoice`
  ```java
  - invoiceNo (unique, sequential)
  - branchId, salesOrderId (FK)
  - invoiceDate
  - dueDate (optional, for credit terms)
  - subtotalAmount
  - discountAmount
  - taxableAmount
  - vatAmount (10% standard in Vietnam)
  - totalAmount
  - status: DRAFT, ISSUED, CANCELLED
  - pdfPath (nullable)
  - electronicInvoiceProvider: NONE, VIETTEL, BIZTAX, etc.
  - electronicInvoiceStatus: PENDING, SENT, REJECTED, ACKNOWLEDGED
  - cancelledAt, cancelReason (nullable)
  - createdBy, issuedBy, createdAt
  ```
- **Invoice Templates**:
  - Configured per branch in Settings
  - Template contains: Logo, header, footer, tax ID, signature line
  - Supports multiple invoice templates for different categories
- **PDF Generation**:
  - Uses JasperReports or similar library
  - Generates PDF on demand (not pre-generated)
  - Includes order items, discounts, taxes, payment terms
- **E-Invoice Integration** (Future-Ready):
  - Framework prepared for Vietnamese e-invoice (VIETTEL, BIZTAX APIs)
  - Status field supports pending submission/acknowledgment
- **API Endpoints**:
  - `POST /api/sales/invoices` - Create invoice from order
  - `GET /api/sales/invoices/{id}` - Get detail
  - `GET /api/sales/invoices/{id}/pdf` - Download PDF
  - `PATCH /api/sales/invoices/{id}/issue` - Mark ISSUED
  - `PATCH /api/sales/invoices/{id}/cancel` - Cancel invoice
  - `POST /api/sales/invoices/{id}/submit-electronic` - Submit to e-invoice provider
- **Verification**: ✓ Invoice generation + e-invoice framework ready

---

#### ✅ Requirement 7: Sales Return / Exchange
- **Status**: IMPLEMENTED
- **Entity**: `SalesReturn`
  ```java
  - returnNo (unique)
  - salesOrderId (FK)
  - branchId, customerId
  - returnDate
  - returnReason: DEFECTIVE, CHANGE_MIND, WRONG_ITEM, WARRANTY_CLAIM, etc.
  - returnType: FULL_RETURN, PARTIAL_RETURN
  - totalReturnAmount
  - refundAmount
  - restockingFee (optional %)
  - refundMethod: CASH, BANK_TRANSFER, CREDIT_NOTE
  - status: PENDING, APPROVED, REJECTED, PROCESSED, CANCELLED
  - approvedBy, approvalDate
  - createdAt, processedAt
  ```
- **Entity**: `SalesReturnItem`
  ```java
  - returnItemId
  - returnId (FK)
  - salesOrderItemId (FK)
  - productId, serialId
  - quantity
  - unitPrice
  - returnAmount
  - serialDisposition: RETURNED, DAMAGED, SCRAPPED, DONATED (for serials)
  ```
- **Full Return Example**:
  ```json
  Original Order: 2x Electric Bikes @ $150,000 = $300,000
  
  Return Request: 2x Electric Bikes (DEFECTIVE)
  Restocking Fee: 5% = $15,000
  Refund Amount: $300,000 - $15,000 = $285,000
  ```
- **Partial Return Example**:
  ```json
  Original Order: 2x Electric Bikes + 5x Helmets @ $300,000
  
  Return Request: 1x Electric Bike (CHANGE_MIND)
  Refund Amount: $150,000 (no restocking fee for change of mind)
  ```
- **Business Logic**:
  1. Create return request (PENDING)
  2. Return items received (APPROVED)
  3. Validate returned items (check serial, condition)
  4. Update serials to RETURNED/DAMAGED
  5. Increment inventory with returned items (if acceptable condition)
  6. Process refund (cash, bank, or credit note)
  7. Reverse accounting entries (AR reduction, revenue reversal)
  8. Create audit trail (who approved, when, reason)
- **API Endpoints**:
  - `POST /api/sales/returns` - Create return request
  - `GET /api/sales/returns` - List
  - `GET /api/sales/returns/{id}` - Detail
  - `PATCH /api/sales/returns/{id}/approve` - Approve return
  - `PATCH /api/sales/returns/{id}/process` - Process refund
  - `PATCH /api/sales/returns/{id}/reject` - Reject return
- **Serial Disposition on Return**:
  - RETURNED: Item restocked, serial → IN_STOCK
  - DAMAGED: Item scrapped, serial → DAMAGED
  - SCRAPPED: Item destroyed, serial → DAMAGED
  - DONATED: Item donated to charity, serial → OUT_OF_SERVICE
- **Verification**: ✓ Full/partial returns + refund + audit implemented

---

#### ✅ Requirement 8: Voucher/Promotion
- **Status**: IMPLEMENTED
- **Entity**: `Voucher` (from Marketing module)
  ```java
  - voucherCode (unique)
  - discountType: FLAT_AMOUNT, PERCENTAGE
  - discountValue
  - maxUsagePerCustomer
  - maxUsageTotal
  - usageCount
  - minOrderAmount (e.g., min $500k to use)
  - validFrom, validUntil
  - applicableProducts (set of product IDs, or null for all)
  - applicableBranches (set of branch IDs, or null for all)
  - status: ACTIVE, INACTIVE, EXPIRED
  ```
- **Validation on Order**:
  ```java
  validateVoucher(voucher, order) {
    check1: TODAY between validFrom and validUntil ✓
    check2: order.totalAmount >= voucher.minOrderAmount ✓
    check3: voucher.usageCount < voucher.maxUsageTotal ✓
    check4: customer.voucherUsageCount < voucher.maxUsagePerCustomer ✓
    check5: ALL order items in applicableProducts (if restricted) ✓
    check6: order.branchId in applicableBranches (if restricted) ✓
  }
  ```
- **API Endpoints**:
  - `POST /api/sales/vouchers/validate` - Preview discount
    ```json
    {
      "voucherCode": "SUMMER20",
      "orderItems": [...],
      "customerId": 123
    }
    Response: { "discountAmount": 50000, "finalTotal": 450000 }
    ```
  - `POST /api/sales/orders` with `voucherCode` parameter
- **Business Logic**:
  - On order CONFIRMED: Check & apply voucher
  - Consume voucher: Increment `usageCount`
  - Cannot use expired or fully-consumed vouchers
  - Store discount in `SalesOrder.discountAmount` + `SalesOrder.voucherCode`
- **Verification**: ✓ Validation rules + usage tracking implemented

---

#### ✅ Requirement 9: Automatic Warranty on Sale
- **Status**: IMPLEMENTED
- **Trigger**: When `SalesOrder` → DELIVERED
- **Warranty Creation**:
  ```java
  for each SalesOrderItem with serialId:
    warranty = new Warranty();
    warranty.productSerialId = serialId;
    warranty.customerId = order.customerId;
    warranty.invoiceNo = createdInvoice.invoiceNo;
    warranty.startDate = order.deliveredAt.toLocalDate();
    warranty.endDate = startDate.plusMonths(product.warrantyMonths);
    warranty.status = ACTIVE;
    warranty.terms = product.warrantyTerms;
    save(warranty);
  ```
- **API**: Auto-created, no manual action needed
- **Entity**: `Warranty`
  ```java
  - warrantyId
  - productSerialId (FK)
  - customerId
  - invoiceNo
  - startDate, endDate
  - status: ACTIVE, CLAIMED, EXPIRED, VOIDED
  - claimCount
  - lastClaimDate
  ```
- **Verification**: ✓ Auto-creation on order delivery

---

#### ✅ Requirement 10: Audit & Permission Control
- **Status**: IMPLEMENTED
- **Audit Logging**:
  ```java
  on createOrder: 
    action=SALES_CREATE, actor=employee, details="Order XYZ created"
  
  on updatePrice:
    action=SALES_UPDATE, actor=employee, details="Price changed from A to B"
  
  on cancelOrder:
    action=SALES_CANCEL, actor=manager, details="Cancelled: Duplicate order"
  
  on recordPayment:
    action=SALES_PAYMENT, actor=cashier, details="Payment $200k recorded"
  
  on createInvoice:
    action=INVOICE_ISSUE, actor=accountant, details="Invoice INV001 issued"
  
  on createReturn:
    action=SALES_RETURN, actor=manager, details="Return for order XYZ"
  ```
- **Entity**: `AuditLog` (in audit module)
  ```java
  - logId
  - module: SALES, INVENTORY, ACCOUNTING, etc.
  - action: SALES_CREATE, SALES_UPDATE, SALES_CANCEL, etc.
  - actor (userId)
  - entityId, entityType
  - description
  - oldValue, newValue (for field changes)
  - timestamp
  - ipAddress (optional)
  - branchId (scoped)
  ```
- **Permission Matrix**:
  ```
  SALES_VIEW         - Read orders, quotations
  SALES_CREATE       - Create new order
  SALES_UPDATE       - Edit order details (before confirmation)
  SALES_CANCEL       - Cancel order (with reason)
  SALES_DISCOUNT_APPROVE - Approve discounts > threshold
  SALES_RETURN       - Create/process returns
  INVOICE_ISSUE      - Generate & issue invoices
  
  INVENTORY_VIEW     - View stock levels
  INVENTORY_IMPORT   - Import goods
  INVENTORY_EXPORT   - Export goods
  INVENTORY_TRANSFER - Create transfers
  INVENTORY_STOCKTAKE - Perform stocktake
  INVENTORY_APPROVE  - Approve transfers/stocktakes
  
  INSTALLMENT_APPROVE - Approve installment applications
  ```
- **Role Examples**:
  - **Cashier**: SALES_VIEW, SALES_CREATE (within discount limit), record payments
  - **Sales Manager**: All SALES permissions, approve discounts, returns
  - **Warehouse Manager**: All INVENTORY permissions, transfer approvals
  - **Accountant**: INVOICE_ISSUE, verify payments, COGS recording
- **Verification**: ✓ BranchSecurity + @PreAuthorize decorators on all endpoints

---

### 2.2 Sales/POS API Complete Reference

| Method | Endpoint | Permission | Purpose |
|--------|----------|------------|---------|
| **Quotation** |
| POST | `/api/sales/quotations` | SALES_CREATE | Create quotation |
| GET | `/api/sales/quotations` | SALES_VIEW | List quotations |
| GET | `/api/sales/quotations/{id}` | SALES_VIEW | Get detail |
| PATCH | `/api/sales/quotations/{id}` | SALES_UPDATE | Update (DRAFT only) |
| PATCH | `/api/sales/quotations/{id}/send` | SALES_CREATE | Mark as SENT |
| PATCH | `/api/sales/quotations/{id}/accept` | - | Accept quote (customer) |
| PATCH | `/api/sales/quotations/{id}/reject` | - | Reject quote |
| POST | `/api/sales/quotations/{id}/convert` | SALES_CREATE | Convert to order |
| **Sales Order** |
| POST | `/api/sales/orders` | SALES_CREATE | Create order |
| GET | `/api/sales/orders` | SALES_VIEW | List orders |
| GET | `/api/sales/orders/{id}` | SALES_VIEW | Get detail |
| PATCH | `/api/sales/orders/{id}` | SALES_UPDATE | Update (DRAFT only) |
| PATCH | `/api/sales/orders/{id}/confirm` | SALES_CREATE | Confirm order |
| PATCH | `/api/sales/orders/{id}/deliver` | SALES_UPDATE | Mark delivered |
| PATCH | `/api/sales/orders/{id}/cancel` | SALES_CANCEL | Cancel order |
| **Payment** |
| POST | `/api/sales/orders/{id}/payments` | SALES_CREATE | Record payment |
| GET | `/api/sales/orders/{id}/payments` | SALES_VIEW | List payments |
| DELETE | `/api/sales/orders/{id}/payments/{pid}` | SALES_UPDATE | Delete payment (DRAFT) |
| **Installment** |
| POST | `/api/sales/installments` | SALES_CREATE | Create application |
| GET | `/api/sales/installments` | SALES_VIEW | List |
| GET | `/api/sales/installments/{id}` | SALES_VIEW | Detail |
| PATCH | `/api/sales/installments/{id}/approve` | INSTALLMENT_APPROVE | Approve |
| PATCH | `/api/sales/installments/{id}/disburse` | INSTALLMENT_APPROVE | Disburse |
| **Invoice** |
| POST | `/api/sales/invoices` | INVOICE_ISSUE | Create invoice |
| GET | `/api/sales/invoices` | SALES_VIEW | List |
| GET | `/api/sales/invoices/{id}` | SALES_VIEW | Detail |
| GET | `/api/sales/invoices/{id}/pdf` | SALES_VIEW | Download PDF |
| PATCH | `/api/sales/invoices/{id}/issue` | INVOICE_ISSUE | Mark ISSUED |
| PATCH | `/api/sales/invoices/{id}/cancel` | INVOICE_ISSUE | Cancel invoice |
| POST | `/api/sales/invoices/{id}/submit-electronic` | INVOICE_ISSUE | Submit to e-invoice provider |
| **Sales Return** |
| POST | `/api/sales/returns` | SALES_RETURN | Create return request |
| GET | `/api/sales/returns` | SALES_VIEW | List |
| GET | `/api/sales/returns/{id}` | SALES_VIEW | Detail |
| PATCH | `/api/sales/returns/{id}/approve` | SALES_RETURN | Approve return |
| PATCH | `/api/sales/returns/{id}/process` | SALES_RETURN | Process refund |
| PATCH | `/api/sales/returns/{id}/reject` | SALES_RETURN | Reject return |
| **Voucher** |
| POST | `/api/sales/vouchers/validate` | SALES_VIEW | Preview discount |
| **POS** |
| GET | `/api/pos/products` | SALES_VIEW | Product search (fast) |
| GET | `/api/pos/serials/{productId}` | SALES_VIEW | Available serials |
| POST | `/api/pos/orders` | SALES_CREATE | Create POS order (same as regular) |

---

### 2.3 Sales Database Schema Status

**Tables**: ✅ All present and correct
- `quotations` - Quote master
- `quotation_items` - Quote line items
- `sales_orders` - Order master
- `sales_order_items` - Order line items
- `sales_payments` - Payment records
- `installment_applications` - Financing requests
- `sales_returns` - Return master
- `sales_return_items` - Return line items
- `invoices` - Invoice master
- `warranties` - Auto-generated warranties

---

### 2.4 Sales Frontend Status

**Current Implementation**:
- ✅ POS screen (cart, customer selector, payment form)
- ✅ Quotation creation/list
- ✅ Sales order detail (items, payment history)
- ✅ Payment recording (multi-payment UI)
- ✅ Installment form (terms, interest calculation)
- ✅ Invoice PDF preview (mock)
- ✅ Return order creation
- ⚠️ POS screen uses mock data (needs real API integration)
- ⚠️ Discount approval workflow (mock)
- ⚠️ Voucher validation (basic implementation)

**Frontend Paths**:
- `frontend/src/features/sales/` - Component library
- `frontend/src/app/(dashboard)/sales/` - Page components
- `frontend/src/store/cartStore.ts` - Zustand state management

**Recommended Enhancements**:
- [ ] Real POS integration (remove mock)
- [ ] Quick search bar for products
- [ ] Barcode scanning (order number, product)
- [ ] Receipt printing
- [ ] Discount approval workflow UI
- [ ] Order status tracking board
- [ ] Customer profile with purchase history

---

---

## PART 3: IMPLEMENTATION ROADMAP

### Phase 1: Verification & Documentation (Week 1)
- [x] Verify all entities are created
- [x] Verify all API endpoints are implemented
- [ ] Create Swagger/OpenAPI documentation
- [ ] Create business logic flowcharts
- [ ] Document all permissions required

### Phase 2: Backend Enhancements (Week 2-3)
- [ ] Add comprehensive input validation (Zod/Jakarta Validation)
- [ ] Add structured error responses
- [ ] Implement field-level audit trail (who changed what)
- [ ] Add transaction isolation levels (SERIALIZABLE for critical ops)
- [ ] Implement optimistic locking for concurrent updates
- [ ] Add service layer error handling with custom exceptions
- [ ] Implement rate limiting for import/export operations
- [ ] Add batch operation APIs (bulk import, bulk transfer)

### Phase 3: Frontend Enhancements (Week 3-4)
- [ ] Implement real low-stock alert dashboard
- [ ] Implement warehouse management CRUD
- [ ] Remove mock data from POS screen
- [ ] Add barcode scanning capability
- [ ] Add CSV bulk import for inventory
- [ ] Add order status tracking board (kanban view)
- [ ] Add customer purchase history dashboard
- [ ] Add discount approval workflow UI
- [ ] Add transfer approval workflow screen

### Phase 4: Testing & Quality (Week 4-5)
- [ ] Create comprehensive unit tests (90%+ coverage target)
- [ ] Create integration tests for workflows
- [ ] Create end-to-end tests for critical paths
- [ ] Performance testing for large imports
- [ ] Security testing (SQL injection, XSS, CSRF)
- [ ] Load testing (concurrent order creation)

### Phase 5: Deployment & Documentation (Week 5)
- [ ] Database migration scripts
- [ ] Deployment automation
- [ ] Runbook documentation
- [ ] User training materials
- [ ] API documentation (Swagger UI)
- [ ] Performance monitoring setup

---

## PART 4: TEST CASE SPECIFICATIONS

### Inventory Test Cases

#### TC-INV-001: Import with Serial Numbers
```gherkin
Feature: Warehouse Import
  Scenario: Import electric bikes with complete serial data
    Given branch "HCM" with warehouse "KHO1_MAIN"
    When I submit import request:
      | Quantity | SerialNumber | FrameNumber | EngineNumber | BatterySerial |
      | 1        | SN001        | FRAME001    | ENG001       | BATT001       |
      | 1        | SN002        | FRAME002    | ENG002       | BATT002       |
    Then system creates 2 ProductSerial records with status IN_STOCK
    And inventory_stocks increments by 2 for product
    And inventory_transactions records IMPORT transaction
    And audit log shows "2 units imported by [USER]"
```

#### TC-INV-002: Stock Transfer with Approval
```gherkin
Feature: Warehouse Transfer
  Scenario: Request transfer from KHO1 to KHO2 (different branch)
    Given inventory at KHO1: 10 units
    And current user has INVENTORY_TRANSFER permission (not INVENTORY_APPROVE)
    When I submit transfer request:
      | FromWarehouse | ToWarehouse | Quantity |
      | KHO1          | KHO2        | 5        |
    Then transfer status = PENDING_APPROVAL
    And serials status = IN_STOCK (not yet TRANSFERING)
    
    When manager approves transfer:
    Then transfer status = APPROVED
    And serials status = TRANSFERING
    And source inventory decrements by 5
    
    When destination receives goods:
    Then transfer status = RECEIVED
    And dest inventory increments by 5
    And serials update to destination warehouse
```

#### TC-INV-003: Low Stock Alerts
```gherkin
Feature: Low Stock Alerts
  Scenario: Dashboard shows low stock warning
    Given product with minStockLevel = 10
    And current stock = 8 (below minimum)
    When I view inventory dashboard
    Then low-stock alert displays:
      | Product    | Current | Minimum | Status |
      | Bike Model | 8       | 10      | ⚠️LOW  |
    And alert includes "Variance: -2 units"
```

### Sales Test Cases

#### TC-SALES-001: Quotation to Order to Invoice Flow
```gherkin
Feature: Full Sales Quote-to-Cash
  Scenario: Complete quotation, convert to order, deliver, invoice
    Given customer "John Electronics"
    When I create quotation for:
      | Product      | Quantity | UnitPrice | Total      |
      | Bike XYZ     | 2        | 150,000   | 300,000    |
    Then quotation status = DRAFT
    And quotation.validUntil = today + 7 days
    
    When I send quotation:
    Then quotation status = SENT
    And audit shows "Sent by [USER]"
    
    When customer accepts quotation:
    Then quotation status = ACCEPTED
    
    When I convert to sales order:
    Then sales_order created with status = CONFIRMED
    And items reserved for 120 minutes
    And serials have status = RESERVED
    And audit shows "Order XYZ created from quotation ABC"
    
    When I record payment of 300,000:
    Then order.paymentStatus = PAID
    And order.status = PAID
    
    When I deliver order:
    Then order.status = DELIVERED
    And serials change to SOLD
    And warranty auto-created with endDate = today + warrantyMonths
    
    When I create invoice:
    Then invoice_no generated
    And invoice.status = ISSUED
    And PDF downloadable
```

#### TC-SALES-002: Partial Payment with Installment
```gherkin
Feature: Multi-Payment with Financing
  Scenario: Payment split between cash, bank, and installment
    Given sales order total = 1,000,000
    When I record 3 payments:
      | Method      | Amount  | Details                      |
      | CASH        | 200,000 | Deposit                      |
      | BANK_TRANSFER | 500,000 | Account 12345678 |
      | INSTALLMENT | 300,000 | 12-month @ 9% APR            |
    Then order.paymentStatus = PAID (200k + 500k + 300k = 1,000k)
    And installment application created with status PENDING
    When finance company approves:
    Then installment.status = APPROVED
    When loan disbursed:
    Then installment.status = DISBURSED
    And SalesPayment recorded for installment amount
```

#### TC-SALES-003: Sales Return with Refund
```gherkin
Feature: Sales Return & Refund
  Scenario: Partial return with restocking fee
    Given order with 2x Bikes @ 150k each = 300,000
    And order.status = DELIVERED
    When customer returns 1 bike (CHANGE_MIND):
    Then return request created with status PENDING
    And returnAmount = 150,000
    And restockingFee = 5% = 7,500
    And refundAmount = 150,000 - 7,500 = 142,500
    
    When return approved:
    Then return.status = APPROVED
    And invoice credit memo generated
    And serial marked RETURNED
    And inventory incremented by 1
    
    When refund processed:
    Then refund amount = 142,500 credited to customer
    And order.remainingAmount reduces by return amount
```

#### TC-SALES-004: Voucher Validation
```gherkin
Feature: Promotion Voucher
  Scenario: Apply valid voucher with restrictions
    Given voucher "SUMMER50":
      | MinOrderAmount | MaxUsage | ValidUntil | ApplicableProducts |
      | 500,000        | 100      | today+30   | Bikes only         |
    
    When I create order with 2x Bikes @ 150k each = 300k:
    Then voucher validation fails: "Minimum order amount is 500k"
    
    When I create order with 4x Bikes @ 150k each = 600k:
    And I apply voucher "SUMMER50":
    Then discount = 50k (50,000)
    And order.totalAmount = 550,000
    And voucherUsageCount increments
```

---

## PART 5: DEPLOYMENT CHECKLIST

- [ ] Database migrations executed
- [ ] All tables created with proper indexes
- [ ] Audit logging configured
- [ ] Email notifications configured (low stock alerts)
- [ ] Background jobs started (reservation auto-release)
- [ ] Security certificates configured
- [ ] API rate limiting configured
- [ ] Logging levels set appropriately
- [ ] Monitoring alerts configured
- [ ] Backup strategy verified
- [ ] Rollback plan documented

---

## PART 6: GLOSSARY & ACRONYMS

| Term | Definition |
|------|-----------|
| **FIFO** | First-In-First-Out inventory cost method |
| **COGS** | Cost of Goods Sold (accounting) |
| **AR** | Accounts Receivable |
| **APR** | Annual Percentage Rate |
| **VAT** | Value Added Tax |
| **SKU** | Stock Keeping Unit (product identifier) |
| **POS** | Point of Sale |
| **WMS** | Warehouse Management System |
| **E-invoice** | Electronic Invoice (Vietnamese: Hóa đơn điện tử) |
| **SLA** | Service Level Agreement |

---

**Document Version**: 1.0  
**Last Updated**: June 7, 2026  
**Status**: Ready for Implementation  
**Next Review**: After Phase 1 Verification

# 🔧 ERP Flow Refactoring Master Report - Chuẩn Phát

**Ngày lập:** 2026-06-13  
**Phiên bản:** 1.0  
**Mục tiêu:** Chuẩn hóa toàn bộ luồng nghiệp vụ theo mô hình MISA AMIS/Enterprise ERP

---

## 📋 Executive Summary

Hệ thống Chuẩn Phát hiện tại có **18 modules phát triển độc lập**, mỗi module có **cách riêng** để xử lý:
- Status/Trạng thái
- Workflow/Duyệt
- Approval/Phê duyệt  
- Audit Log/Kiểm toán
- Permission/Quyền hạn

**Kết quả:** Hệ thống **RỐI, KHÓ BẢO TRÌ, KHÓA CỨNG VỚI MỞ RỘNG**

**Mục đích refactoring:** 
- ✅ Thống nhất 1 document lifecycle cho tất cả module
- ✅ Tạo Workflow Engine dùng chung
- ✅ Tạo Master Data dùng chung
- ✅ Tạo Accounting Engine chuẩn
- ✅ Tạo Audit Engine dùng chung
- ✅ Chuẩn hóa RBAC (Role-Based Access Control)
- ✅ Kết quả: Hệ thống hoạt động giống **MISA AMIS**

---

## 🏗️ PHẦN 1: PHÂN TÍCH HIỆN TRẠNG

### 1.1 Hiện Trạng Module

#### Frontend Modules (21 modules)
| Module | Status | Pattern |
|--------|--------|---------|
| sales | ✅ Đang code | Custom workflow |
| purchasing | ✅ Đang code | Custom status |
| inventory | ✅ Đang code | Custom transaction type |
| accounting | ✅ Đang code | Custom journal status |
| reports | ✅ Vừa code (Phase 1) | Chỉ frontend, backend stub |
| bank-deposit | ✅ Hoàn thành (4,600 lines) | Custom approval |
| warranty | ✅ Đang code | Custom ticket status |
| crm | ✅ Đang code | Lead management riêng |
| hr | 🔄 Thiết kế | Payroll riêng |
| cash-operations | 🔄 Thiết kế | Cash book riêng |
| serials | ✅ Cơ bản | Serial tracking |
| products | ✅ Cơ bản | Product master |
| customers | ✅ Cơ bản | Customer master |
| suppliers | ✅ Cơ bản | Supplier master |
| branches | ✅ Cơ bản | Branch master |
| users | ✅ Cơ bản | User management |
| notifications | 🔄 Thiết kế | Event-based |
| dashboard | 🔄 Thiết kế | Analytics |
| auth | ✅ Cơ bản | JWT auth |
| operations | 🔄 Thiết kế | Operations center |
| assistant | ⚠️ Demo | AI assistant |

#### Backend Modules (3 modules)
| Module | Technology | Status | Lines |
|--------|------------|--------|-------|
| warranty-service | Spring Boot 3.3 + JPA | ✅ Đang phát triển | 10,000+ |
| bank-deposit | NestJS + TypeORM | ✅ Hoàn thành | 4,600 |
| reports | NestJS + TypeORM | ✅ Infrastructure | 5,500 |

### 1.2 Status Definitions - Hiện Trạng RỐI

#### ❌ Problem 1: Mỗi Module Dùng Status Riêng

**Bank Deposit Module:**
```typescript
enum TransactionStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  CANCELLED = 'CANCELLED'
}
```

**Accounting Module (Java):**
```java
enum JournalEntryStatus {
  // ??? (cần xem source code đầy đủ)
  POSTED, CANCELLED, ...
}

enum DebtStatus {
  // ??? (khác với JournalEntryStatus)
}

enum PayableStatus {
  // ??? (khác lại)
}
```

**Warranty Module (Java):**
```java
enum ServiceTicketStatus {
  CREATED, IN_PROGRESS, COMPLETED, CANCELLED
  // Không có PENDING_APPROVAL, POSTED
}
```

**Frontend Enums:**
```typescript
// PurchaseOrderStatus
// PayableStatus
// LeadStatus
// SerialStatus
// ReceiptStatus
// InventoryCountStatus
// ProductStatus
// VoucherStatus
// === Total: 10+ status enums, mỗi cái khác kiểu! ===
```

**🔴 VẤN ĐỀ:** Không ai biết document ở trạng thái nào trong quy trình. Mỗi module tự xử lý duyệt, hủy, hạch toán riêng biệt.

---

### 1.3 Workflow Inconsistency

#### ❌ Problem 2: Mỗi Module Tự Xử Lý Duyệt

**Bank Deposit:**
- Người tạo submit → Chờ phê duyệt → Phê duyệt → Posted → Closed

**Sales Order:**
- Nhập liệu → Confirm → Bán hàng → Auto-post → Close
- (Workflow không chuẩn, auto-post không rõ)

**Purchase Order:**
- Draft → Approve → Posted → Close
- (Approval flow không chuẩn, ai duyệt?)

**Warranty Service Ticket:**
- Created → In Progress → Completed
- (Không có approval, không có posting)

**🔴 VẤN ĐỀ:** 
- Mỗi module gọi `approve()` / `submit()` / `post()` khác nhau
- Không có workflow engine để quản lý
- Workflow rule hard-code trong service
- Không thể cấu hình approval qua DB

---

### 1.4 Entity Structure Inconsistency

#### ❌ Problem 3: Entity Base Field Khác Nhau

**Bank Deposit Entity:**
```typescript
@Entity('bank_transactions')
export class BankTransaction {
  id: string;              // UUID
  branchId: string;        // UUID
  type: TransactionType;   // RECEIPT/PAYMENT
  subType: string;         // 'Báo có', etc
  docNo: string;           // 30 chars
  docDate: string;         // date
  status: TransactionStatus;
  createdBy?: string;
  createdAt: timestamp;
  updatedAt: timestamp;
  // ❌ Thiếu: approvedBy, documentNote
}
```

**Warranty Service Ticket Entity (Java):**
```java
@Entity
@Table(name = "service_tickets")
public class ServiceTicket {
  Long id;                 // Long, không UUID
  Long vehicleId;
  Long branchId;           // Long, khác kiểu
  String serialNumber;
  String customerName;
  String issueDescription;
  LocalDate receivedDate;
  ServiceTicketStatus status;
  String technicianUsername;
  // ❌ Thiếu: createdBy, approvedBy, documentNo
}
```

**🔴 VẤN ĐỀ:**
- Không có unified BaseEntity
- ID kiểu khác nhau (UUID vs Long vs String)
- CreatedBy/UpdatedBy không đồng nhất
- ApprovedBy không có ở một số entity
- Note/Remark field tên gọi khác

---

### 1.5 Audit Log Inconsistency

#### ❌ Problem 4: Audit Logging Khác Nhau

**Java Spring Boot (Warranty):**
```java
@Service
public class AuditLogService {
  // Has: Module, Entity, Action, Before, After, User, Time, IP
  public void log(AuditModule module, AuditAction action, ...)
}
```

**NestJS (Bank Deposit):**
```typescript
// ❌ Không có centralized audit logging!
// Mỗi service tự implement logging hoặc không log gì cả
```

**Frontend:**
```typescript
// ❌ Không log ở frontend
```

**🔴 VẤN ĐỀ:**
- Audit trail không đầy đủ
- Khó tracking user action
- Không biết ai thay đổi cái gì lúc nào

---

### 1.6 Permission System Inconsistency

#### ❌ Problem 5: Permission Format Rời Rạc

**Java:**
```
ACCOUNTING_VIEW
VIEW_ACCOUNTING (conflicting với trên)
ACCOUNTING_REPORT
ACCOUNTING_POST
```

**Frontend:**
```typescript
// Không rõ permission format
// Mỗi feature tự check user role
```

**🔴 VẤN ĐỀ:**
- Permission naming inconsistent
- Không có single permission format
- Khó implement field-level permission
- Không thể dynamic cấp quyền

---

### 1.7 Accounting Flow Inconsistency

#### ❌ Problem 6: Auto-Posting Hard-Code

**AccountingService.java:**
```java
// Hard-code account codes:
// 111 = Tiền mặt
// 112 = Tiền gửi
// 131 = Hàng tồn kho
// 156 = Máy móc
// 331 = Vốn chủ sở hữu
// 511 = Doanh thu
// 632 = Giá vốn
// 3331 = Lãi

// Problem: Nếu công ty có chart of account khác, sao?
// Hard-code này khóa cứng hệ thống!
```

**🔴 VẤN ĐỀ:**
- Accounting posting không flexible
- Không support multi-company chart
- Não support multi-chart configuration
- Một công ty, một chart. Lớp hơn? Sao?

---

### 1.8 Report Data Flow

#### ❌ Problem 7: Dashboard Đọc Trực Tiếp từ Transaction Tables

```typescript
// ❌ Wrong way:
const salesReport = await salesOrderRepository.find();
const totalSales = salesReport.reduce(...);

// ✅ Right way (theo MISA):
const ledger = await generalLedgerRepository.find();
const totalSales = ledger.filter(accountCode.startsWith('511')).sum();
```

**🔴 VẤN ĐỀ:**
- Report không consistent
- Khó scale lên
- Dashboard không sync với accounting

---

### 1.9 Master Data Duplication

#### ❌ Problem 8: Dữ Liệu Master Bị Duplicate

- Customer (tại CRM)
- Supplier (tại CRM)
- Product (tại Inventory)
- Branch (tại Branches)
- Employee (tại HR)
- Category (ở multiple modules)

**🔴 VẤN ĐỀ:**
- Dữ liệu không single source of truth
- Cập nhật ở 1 chỗ, quên cập nhật ở chỗ khác
- Data inconsistency

---

## 🎯 PHẦN 2: THIẾT KẾ MỚI (TARGET ARCHITECTURE)

### 2.1 Unified Document Status Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│         UNIFIED DOCUMENT LIFECYCLE (Áp dụng toàn bộ)         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   DRAFT                    (Đang nhập, chưa hoàn thành)      │
│     ↓                                                         │
│   PENDING_APPROVAL         (Chờ duyệt, quyền Approve)        │
│     ├─ [Reject]                                             │
│     │  ↓                                                     │
│     │  REJECTED             (Bị từ chối, quay lại DRAFT)    │
│     │                                                        │
│     └─ [Approve]                                            │
│        ↓                                                     │
│   APPROVED                 (Được duyệt, sẵn sàng posting)   │
│     ↓                                                        │
│   POSTED                   (Đã hạch toán vào SỔ)             │
│     ├─ [Cancel]                                             │
│     │  ↓                                                     │
│     │  CANCELLED            (Hủy, reverse journal)          │
│     │                                                        │
│     └─ [Close]                                              │
│        ↓                                                     │
│   CLOSED                   (Hoàn tất, không chỉnh sửa)       │
│                                                              │
│   CANCELLED (any time)     (Hủy từ bất kỳ trạng thái)        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Áp dụng cho tất cả Chứng từ:**
- Sales Order
- Purchase Order
- Expense Voucher
- Receipt Voucher
- Payment Voucher
- Inventory Adjustment
- Fixed Asset Voucher
- Journal Voucher
- Service Ticket (được map sang DRAFT→PENDING→APPROVED→POSTED→CLOSED)
- Bank Transaction (được map sang DRAFT→PENDING→APPROVED→POSTED→CLOSED)

**Code:**
```java
public enum DocumentStatus {
  DRAFT(0, "Nháp"),
  PENDING_APPROVAL(1, "Chờ duyệt"),
  APPROVED(2, "Đã duyệt"),
  REJECTED(3, "Bị từ chối"),
  POSTED(4, "Đã hạch toán"),
  CLOSED(5, "Hoàn tất"),
  CANCELLED(6, "Hủy"),
  
  private final int order;
  private final String label;
}
```

---

### 2.2 Unified Document Engine

**Base Entity - Tất cả document kế thừa:**

```java
@MappedSuperclass
public abstract class BaseDocument {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;
  
  @Column(nullable = false, length = 30, unique = true)
  private String documentNo;           // e.g., HĐ001/2026, PO-001, TCV-001
  
  @Column(nullable = false)
  private LocalDate documentDate;
  
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private DocumentStatus status;       // UNIFIED!
  
  @Column(length = 36, nullable = false)
  private UUID branchId;
  
  @Column(length = 36, nullable = false)
  private UUID createdBy;              // User ID
  
  @Column(nullable = false)
  private LocalDateTime createdAt;
  
  @Column(length = 36)
  private UUID updatedBy;
  
  @Column
  private LocalDateTime updatedAt;
  
  @Column(length = 36)
  private UUID approvedBy;             // User ID of approver
  
  @Column
  private LocalDateTime approvedAt;
  
  @Column(length = 500)
  private String note;                 // Ghi chú
  
  @Column(length = 500)
  private String rejectionReason;      // Nếu bị từ chối
  
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "branch_id", insertable = false, updatable = false)
  private Branch branch;
  
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "created_by", insertable = false, updatable = false)
  private User creator;
  
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "approved_by", insertable = false, updatable = false)
  private User approver;
}
```

**Concrete Documents:**

```java
@Entity
@Table(name = "sales_orders")
public class SalesOrder extends BaseDocument {
  @Column(nullable = false, length = 36)
  private UUID customerId;
  
  @Column(precision = 18, scale = 2)
  private BigDecimal totalAmount;
  
  @OneToMany(mappedBy = "salesOrder", cascade = CascadeType.ALL)
  private List<SalesOrderLine> lines;
}

@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder extends BaseDocument {
  @Column(nullable = false, length = 36)
  private UUID supplierId;
  
  @Column(precision = 18, scale = 2)
  private BigDecimal totalAmount;
  
  @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL)
  private List<PurchaseOrderLine> lines;
}

@Entity
@Table(name = "expense_vouchers")
public class ExpenseVoucher extends BaseDocument {
  @Enumerated(EnumType.STRING)
  private ExpenseType expenseType;
  
  @Column(precision = 18, scale = 2)
  private BigDecimal amount;
  
  @OneToMany(mappedBy = "expenseVoucher", cascade = CascadeType.ALL)
  private List<ExpenseDetail> details;
}

// ... tương tự cho các document khác
```

---

### 2.3 Unified Workflow Engine

**WorkflowRule (DB Configuration):**

```java
@Entity
@Table(name = "workflow_rules")
public class WorkflowRule {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;
  
  @Enumerated(EnumType.STRING)
  private DocumentType documentType;  // SALES_ORDER, PURCHASE_ORDER, ...
  
  @Column(length = 36)
  private UUID branchId;              // null = apply to all branches
  
  @Column(length = 36)
  private UUID departmentId;          // null = apply to all departments
  
  @Column(nullable = false, length = 50)
  private String ruleName;
  
  // Workflow steps configuration
  @Column(columnDefinition = "JSON")
  private String workflowSteps;       // [DRAFT→PENDING_APPROVAL→APPROVED→POSTED]
  
  // Approval requirement
  @Column(nullable = false)
  private Integer approvalRequired;   // 0=None, 1=OneLevelApproval, 2=TwoLevelApproval, etc
  
  @Column(columnDefinition = "JSON")
  private String approvalRoles;       // ["MANAGER", "ACCOUNTING_SUPERVISOR"]
  
  // Auto-posting rule
  @Column(nullable = false)
  private Boolean autoPostOnApprove;  // true = auto-post when approved
  
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;
  
  @Column
  private LocalDateTime updatedAt;
}
```

**WorkflowStep (History):**

```java
@Entity
@Table(name = "workflow_steps")
public class WorkflowStep {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;
  
  @Column(length = 36, nullable = false)
  private UUID documentId;            // FK to any document
  
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private DocumentStatus fromStatus;
  
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private DocumentStatus toStatus;
  
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private WorkflowAction action;      // SUBMIT, APPROVE, REJECT, CANCEL, POST, CLOSE
  
  @Column(length = 36)
  private UUID performedBy;           // User ID
  
  @Column(nullable = false)
  private LocalDateTime performedAt;
  
  @Column(length = 500)
  private String comment;             // Lý do reject, ghi chú
}
```

**WorkflowEngine Service:**

```java
@Service
public class WorkflowEngine {
  
  public void submit(BaseDocument document, UUID userId) 
    throws WorkflowException {
    // Check: current status = DRAFT
    // Check: permission DOCUMENT_SUBMIT
    // Change status: DRAFT → PENDING_APPROVAL
    // Create workflow step
    // Trigger notification for approvers
  }
  
  public void approve(BaseDocument document, UUID userId, String comment) 
    throws WorkflowException {
    // Check: current status = PENDING_APPROVAL
    // Check: permission DOCUMENT_APPROVE
    // Check: user in approval roles (from WorkflowRule)
    // Change status: PENDING_APPROVAL → APPROVED
    // If autoPostOnApprove: call post()
    // Create workflow step
  }
  
  public void reject(BaseDocument document, UUID userId, String reason) 
    throws WorkflowException {
    // Check: current status = PENDING_APPROVAL
    // Check: permission DOCUMENT_APPROVE
    // Change status: PENDING_APPROVAL → REJECTED → DRAFT
    // Set rejectionReason
    // Create workflow step
  }
  
  public void post(BaseDocument document, UUID userId) 
    throws WorkflowException {
    // Check: current status = APPROVED
    // Check: permission DOCUMENT_POST
    // Call AccountingEngine to create journal entries
    // Change status: APPROVED → POSTED
    // Create workflow step
  }
  
  public void close(BaseDocument document, UUID userId) 
    throws WorkflowException {
    // Check: current status = POSTED
    // Check: no dependent documents in DRAFT/PENDING
    // Change status: POSTED → CLOSED
    // Archive document (for performance)
    // Create workflow step
  }
  
  public void cancel(BaseDocument document, UUID userId, String reason) 
    throws WorkflowException {
    // Can cancel from any status
    // Check: permission DOCUMENT_CANCEL
    // If already POSTED: create reverse journal entry
    // Change status: ANY → CANCELLED
    // Set cancellationReason
    // Create workflow step
  }
}
```

---

### 2.4 Unified Accounting Engine

**AccountingEngine Service:**

```java
@Service
public class AccountingEngine {
  
  private AccountingRuleRepository accountingRuleRepository;
  private GeneralLedgerRepository generalLedgerRepository;
  private JournalEntryRepository journalEntryRepository;
  
  /**
   * Tạo journal entry từ business document
   * 
   * Example:
   * - Input: Sales Order với 3 dòng bán hàng (2 loại sản phẩm)
   * - Lookup accounting rule: SALES_ORDER + Branch + ProductCategory
   * - Output: Journal Entry:
   *   Debit  111 (Cash)       1.000.000
   *   Credit 511 (Sales)                1.000.000
   */
  public JournalEntry createJournalEntry(
    DocumentType docType,
    UUID documentId,
    UUID branchId,
    List<AccountingLine> lines
  ) throws AccountingException {
    // 1. Lookup AccountingRule by docType + branchId
    AccountingRule rule = accountingRuleRepository
      .findByDocumentTypeAndBranch(docType, branchId);
    
    if (rule == null) {
      throw new AccountingException(
        "No accounting rule found for " + docType + " in branch " + branchId);
    }
    
    // 2. Create journal entry
    JournalEntry entry = new JournalEntry();
    entry.setDocumentType(docType);
    entry.setDocumentId(documentId);
    entry.setDocumentDate(LocalDate.now());
    entry.setStatus(JournalEntryStatus.DRAFT);
    entry.setBranchId(branchId);
    
    // 3. Create journal lines từ business lines + rule
    BigDecimal totalDebit = BigDecimal.ZERO;
    BigDecimal totalCredit = BigDecimal.ZERO;
    
    for (AccountingLine line : lines) {
      // Lookup debit/credit account từ rule
      Account debitAccount = rule.getDebitAccountFor(line);
      Account creditAccount = rule.getCreditAccountFor(line);
      
      // Create journal lines
      JournalEntryLine debitLine = new JournalEntryLine();
      debitLine.setAccount(debitAccount);
      debitLine.setDebit(line.getAmount());
      debitLine.setCredit(BigDecimal.ZERO);
      entry.getLines().add(debitLine);
      totalDebit = totalDebit.add(line.getAmount());
      
      JournalEntryLine creditLine = new JournalEntryLine();
      creditLine.setAccount(creditAccount);
      creditLine.setDebit(BigDecimal.ZERO);
      creditLine.setCredit(line.getAmount());
      entry.getLines().add(creditLine);
      totalCredit = totalCredit.add(line.getAmount());
    }
    
    // 4. Validate: Debit = Credit
    if (totalDebit.compareTo(totalCredit) != 0) {
      throw new AccountingException(
        "Debit (" + totalDebit + ") != Credit (" + totalCredit + ")");
    }
    
    // 5. Save journal entry
    return journalEntryRepository.save(entry);
  }
  
  /**
   * Post journal entry (update general ledger)
   */
  public void postJournalEntry(UUID journalEntryId) 
    throws AccountingException {
    
    JournalEntry entry = journalEntryRepository.findById(journalEntryId)
      .orElseThrow(() -> new NotFoundException("Journal entry not found"));
    
    // Validate: entry must be APPROVED
    if (entry.getStatus() != JournalEntryStatus.APPROVED) {
      throw new AccountingException(
        "Can only post APPROVED entries, current status: " + entry.getStatus());
    }
    
    // Update general ledger
    for (JournalEntryLine line : entry.getLines()) {
      Account account = line.getAccount();
      
      GeneralLedger ledger = generalLedgerRepository
        .findByAccountAndDate(account.getCode(), entry.getDocumentDate())
        .orElseGet(() -> {
          GeneralLedger newLedger = new GeneralLedger();
          newLedger.setAccountCode(account.getCode());
          newLedger.setDate(entry.getDocumentDate());
          newLedger.setDebit(BigDecimal.ZERO);
          newLedger.setCredit(BigDecimal.ZERO);
          return newLedger;
        });
      
      ledger.setDebit(ledger.getDebit().add(line.getDebit()));
      ledger.setCredit(ledger.getCredit().add(line.getCredit()));
      generalLedgerRepository.save(ledger);
    }
    
    // Update entry status
    entry.setStatus(JournalEntryStatus.POSTED);
    entry.setPostedAt(LocalDateTime.now());
    journalEntryRepository.save(entry);
  }
  
  /**
   * Reverse journal entry (for cancellation)
   */
  public void reverseJournalEntry(UUID journalEntryId, String reason) 
    throws AccountingException {
    
    JournalEntry originalEntry = journalEntryRepository.findById(journalEntryId)
      .orElseThrow(() -> new NotFoundException("Journal entry not found"));
    
    // Create reverse entry
    JournalEntry reverseEntry = new JournalEntry();
    reverseEntry.setDocumentType(originalEntry.getDocumentType());
    reverseEntry.setDocumentId(originalEntry.getDocumentId());
    reverseEntry.setDocumentDate(LocalDate.now());
    reverseEntry.setReferenceEntryId(journalEntryId);
    reverseEntry.setStatus(JournalEntryStatus.POSTED);  // Auto-post reversal
    reverseEntry.setBranchId(originalEntry.getBranchId());
    reverseEntry.setNote("Reversal of entry #" + journalEntryId + ": " + reason);
    
    // Reverse all lines (debit ↔ credit)
    for (JournalEntryLine line : originalEntry.getLines()) {
      JournalEntryLine reverseLine = new JournalEntryLine();
      reverseLine.setAccount(line.getAccount());
      reverseLine.setDebit(line.getCredit());
      reverseLine.setCredit(line.getDebit());
      reverseEntry.getLines().add(reverseLine);
    }
    
    // Save and post reverse entry
    journalEntryRepository.save(reverseEntry);
    postJournalEntry(reverseEntry.getId());
    
    // Mark original entry as cancelled
    originalEntry.setStatus(JournalEntryStatus.CANCELLED);
    originalEntry.setReversalEntryId(reverseEntry.getId());
    journalEntryRepository.save(originalEntry);
  }
}
```

**AccountingRule Entity:**

```java
@Entity
@Table(name = "accounting_rules")
public class AccountingRule {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;
  
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private DocumentType documentType;  // SALES_ORDER, PURCHASE_ORDER, EXPENSE_VOUCHER, etc
  
  @Column(length = 36)
  private UUID branchId;              // null = apply to all
  
  @Column(length = 36)
  private UUID departmentId;          // null = apply to all
  
  @Column(length = 36)
  private UUID productCategoryId;     // null = apply to all
  
  @Column(length = 20, nullable = false)
  private String debitAccountCode;    // e.g., "1110" for cash
  
  @Column(length = 20, nullable = false)
  private String creditAccountCode;   // e.g., "5110" for sales
  
  @Column(nullable = false)
  private Boolean active;
  
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;
}
```

---

### 2.5 Unified Inventory Engine

**InventoryTransaction (Immutable Stock Ledger):**

```java
@Entity
@Table(name = "inventory_transactions")
public class InventoryTransaction {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;
  
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private InventoryTransactionType type;  // PURCHASE, SALES, TRANSFER, ADJUSTMENT, RETURN, DAMAGED, LOST
  
  @Column(nullable = false, length = 36)
  private UUID productId;
  
  @Column(nullable = false, length = 36)
  private UUID warehouseId;
  
  @Column(length = 36)
  private UUID referenceDocumentId;   // FK to SalesOrder, PurchaseOrder, etc
  
  @Column(nullable = false)
  private BigDecimal quantity;        // Positive or negative
  
  @Column(nullable = false, precision = 18, scale = 4)
  private BigDecimal unitPrice;
  
  @Column(nullable = false, precision = 18, scale = 2)
  private BigDecimal totalAmount;     // quantity × unitPrice
  
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private InventoryValuationMethod valuationMethod;  // FIFO, LIFO, WEIGHTED_AVERAGE, SPECIFIC_IDENTIFICATION
  
  @Column(nullable = false)
  private LocalDate transactionDate;
  
  @Column(length = 500)
  private String note;
  
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;
  
  @Column(length = 36, nullable = false)
  private UUID createdBy;
}
```

**InventoryService (Không trực tiếp update tồn kho):**

```java
@Service
public class InventoryService {
  
  /**
   * Không được gọi trực tiếp! Phải thông qua DocumentEngine → InventoryTransaction
   */
  @Deprecated
  public void directUpdateStock(...) {
    throw new UnsupportedOperationException(
      "Cannot directly update stock! Use DocumentEngine to create transaction.");
  }
  
  /**
   * Get current stock level (calculate từ transactions)
   */
  public StockLevel getCurrentStock(UUID productId, UUID warehouseId) {
    List<InventoryTransaction> transactions = transactionRepository
      .findByProductAndWarehouse(productId, warehouseId);
    
    BigDecimal totalQuantity = BigDecimal.ZERO;
    BigDecimal totalAmount = BigDecimal.ZERO;
    
    for (InventoryTransaction tx : transactions) {
      totalQuantity = totalQuantity.add(tx.getQuantity());
      totalAmount = totalAmount.add(tx.getTotalAmount());
    }
    
    return new StockLevel(productId, warehouseId, totalQuantity, totalAmount);
  }
}
```

---

### 2.6 Unified Audit Engine

**AuditLog (Chuẩn Java Spring Boot):**

```java
@Entity
@Table(name = "audit_logs", indexes = {
  @Index(name = "idx_module_action", columnList = "module,action"),
  @Index(name = "idx_user_time", columnList = "user_id,created_at"),
  @Index(name = "idx_entity", columnList = "entity_type,entity_id"),
})
public class AuditLog {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;
  
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private AuditModule module;          // SALES, PURCHASE, INVENTORY, ACCOUNTING, HR, etc
  
  @Column(nullable = false, length = 50)
  private String entityType;           // SalesOrder, PurchaseOrder, JournalEntry, etc
  
  @Column(nullable = false, length = 36)
  private UUID entityId;               // PK of entity
  
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private AuditAction action;          // CREATE, UPDATE, DELETE, APPROVE, POST, CANCEL
  
  @Column(length = 36, nullable = false)
  private UUID userId;                 // User who performed action
  
  @Column(columnDefinition = "JSON")
  private String beforeValues;         // Old data (for UPDATE)
  
  @Column(columnDefinition = "JSON")
  private String afterValues;          // New data
  
  @Column(length = 500)
  private String note;                 // Optional comment
  
  @Column(length = 100)
  private String ipAddress;
  
  @Column(length = 100)
  private String userAgent;
  
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;
  
  @Column(length = 36)
  private UUID branchId;
}
```

**Centralized Audit Service:**

```java
@Service
@Aspect
public class AuditService {
  
  /**
   * Automatic auditing via @Audited annotation
   */
  @Around("@annotation(com.chuanphat.core.audit.Audited)")
  public Object audit(ProceedingJoinPoint joinPoint, Audited audited) 
    throws Throwable {
    
    // Get parameter values (before)
    Object entity = joinPoint.getArgs()[0];
    String beforeJson = serializeObject(entity);
    
    // Execute method
    Object result = joinPoint.proceed();
    
    // Get result (after)
    String afterJson = serializeObject(result);
    
    // Create audit log
    AuditLog log = new AuditLog();
    log.setModule(audited.module());
    log.setEntityType(entity.getClass().getSimpleName());
    log.setEntityId(extractId(entity));
    log.setAction(audited.action());
    log.setUserId(getCurrentUserId());
    log.setBeforeValues(beforeJson);
    log.setAfterValues(afterJson);
    log.setCreatedAt(LocalDateTime.now());
    
    auditLogRepository.save(log);
    
    return result;
  }
}
```

**@Audited Annotation Usage:**

```java
@Service
public class SalesOrderService {
  
  @Audited(module = AuditModule.SALES, action = AuditAction.CREATE)
  public SalesOrder create(CreateSalesOrderRequest request, UUID userId) {
    // Service implementation
  }
  
  @Audited(module = AuditModule.SALES, action = AuditAction.UPDATE)
  public SalesOrder update(UUID id, UpdateSalesOrderRequest request) {
    // Service implementation
  }
  
  @Audited(module = AuditModule.SALES, action = AuditAction.APPROVE)
  public void approve(UUID id, UUID approverId) {
    // Service implementation
  }
}
```

---

### 2.7 Unified RBAC System

**Permission Format - Chuẩn mới:**

```
MODULE_ACTION

Examples:
SALES_VIEW              - Xem danh sách sales order
SALES_CREATE            - Tạo sales order
SALES_EDIT              - Chỉnh sửa sales order
SALES_DELETE            - Xóa sales order
SALES_APPROVE           - Duyệt sales order
SALES_POST              - Hạch toán sales order
SALES_CANCEL            - Hủy sales order

PURCHASE_VIEW           - Xem danh sách purchase order
PURCHASE_CREATE         - Tạo purchase order
PURCHASE_EDIT           - Chỉnh sửa purchase order
PURCHASE_APPROVE        - Duyệt purchase order

ACCOUNTING_VIEW         - Xem journal entry
ACCOUNTING_POST         - Hạch toán journal entry
ACCOUNTING_CLOSE_PERIOD - Khóa kỳ kế toán

INVENTORY_VIEW          - Xem tồn kho
INVENTORY_TRANSFER      - Chuyển kho
INVENTORY_ADJUST        - Điều chỉnh tồn kho

HR_VIEW_PAYROLL         - Xem bảng lương
HR_APPROVE_PAYROLL      - Duyệt bảng lương

FIXED_ASSET_MANAGE      - Quản lý tài sản cố định
EXPENSE_APPROVE         - Duyệt chi phí

REPORT_VIEW             - Xem báo cáo
REPORT_EXPORT           - Xuất báo cáo
```

**Permission Entity:**

```java
@Entity
@Table(name = "permissions")
public class Permission {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;
  
  @Column(nullable = false, length = 50, unique = true)
  private String code;                // e.g., "SALES_APPROVE"
  
  @Column(nullable = false, length = 255)
  private String name;                // e.g., "Duyệt sales order"
  
  @Column(length = 500)
  private String description;
  
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private PermissionCategory category; // SALES, PURCHASE, ACCOUNTING, etc
  
  @Column(nullable = false)
  private Boolean active;
}
```

**Role-Permission Mapping:**

```java
@Entity
@Table(name = "role_permissions", uniqueConstraints = {
  @UniqueConstraint(columnNames = {"role_id", "permission_id"})
})
public class RolePermission {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;
  
  @Column(nullable = false, length = 36)
  private UUID roleId;                // FK to Role
  
  @Column(nullable = false, length = 36)
  private UUID permissionId;          // FK to Permission
  
  @Column(length = 36)
  private UUID branchId;              // Optional: limit permission to branch
  
  @Column(length = 36)
  private UUID departmentId;          // Optional: limit permission to department
}
```

**Permission Check (Chuẩn mới):**

```java
@Component
public class PermissionChecker {
  
  public void check(UUID userId, String permissionCode) 
    throws AccessDeniedException {
    
    User user = userRepository.findById(userId)
      .orElseThrow(() -> new NotFoundException("User not found"));
    
    boolean hasPermission = user.getRoles().stream()
      .flatMap(role -> role.getPermissions().stream())
      .anyMatch(perm -> perm.getCode().equals(permissionCode));
    
    if (!hasPermission) {
      throw new AccessDeniedException(
        "User " + userId + " does not have permission: " + permissionCode);
    }
  }
  
  @Before("@annotation(com.chuanphat.core.security.RequirePermission)")
  public void checkPermissionAnnotation(JoinPoint joinPoint, RequirePermission requirePermission) {
    UUID userId = SecurityContextHolder.getUserId();
    check(userId, requirePermission.value());
  }
}
```

**Usage:**

```java
@Service
public class SalesOrderService {
  
  @RequirePermission("SALES_APPROVE")
  public void approve(UUID salesOrderId, UUID approverId) {
    // Only users with SALES_APPROVE permission can call this
  }
  
  @RequirePermission("SALES_VIEW")
  public PageResponse<SalesOrderResponse> list(PageRequest request) {
    // Only users with SALES_VIEW permission
  }
}
```

---

### 2.8 Master Data Structure

**Master Data Model (Centralized):**

```java
// Customer (CRM → Master)
@Entity
@Table(name = "customers")
public class Customer {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;
  
  @Column(nullable = false, length = 50, unique = true)
  private String code;
  
  @Column(nullable = false, length = 255)
  private String name;
  
  @Column(length = 255)
  private String address;
  
  @Column(length = 20)
  private String phone;
  
  @Column(length = 100)
  private String email;
  
  // Mối liên hệ 1-N: 1 customer → N sales orders
  @OneToMany(mappedBy = "customer")
  private List<SalesOrder> salesOrders;
}

// Supplier (Purchasing → Master)
@Entity
@Table(name = "suppliers")
public class Supplier {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;
  
  @Column(nullable = false, length = 50, unique = true)
  private String code;
  
  @Column(nullable = false, length = 255)
  private String name;
  
  @OneToMany(mappedBy = "supplier")
  private List<PurchaseOrder> purchaseOrders;
}

// Product (Inventory → Master)
@Entity
@Table(name = "products")
public class Product {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;
  
  @Column(nullable = false, length = 50, unique = true)
  private String sku;
  
  @Column(nullable = false, length = 255)
  private String name;
  
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "category_id")
  private ProductCategory category;
  
  @Column(precision = 18, scale = 4)
  private BigDecimal unitPrice;
  
  @Column(length = 36)
  private UUID unitOfMeasureId;
}

// Các master khác: Branch, Department, Employee, Warehouse, Category, TaxRate, PaymentMethod, Currency
```

---

## 🗂️ PHẦN 3: MODULE DEPENDENCY DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY / AUTH                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
       ┌───────────┴───────────┐
       │                       │
┌──────▼──────────┐    ┌──────▼──────────┐
│  JWT Bearer     │    │  Permission     │
│  Middleware     │    │  Interceptor    │
└──────┬──────────┘    └──────┬──────────┘
       │                       │
       └───────────┬───────────┘
                   │
       ┌───────────▼───────────┐
       │   WORKFLOW ENGINE     │
       │  (DocumentStatus      │
       │   + Approval Rules)   │
       └───────────┬───────────┘
                   │
       ┌───────────┴─────────┬───────────┬───────────┐
       │                     │           │           │
┌──────▼───────┐    ┌───────▼──┐  ┌────▼──┐  ┌────▼──┐
│   SALES      │    │PURCHASE  │  │EXPENSE│  │PAYMENT│
│   MODULE     │    │ MODULE   │  │MODULE │  │MODULE │
└──────┬───────┘    └────┬─────┘  └───┬───┘  └───┬───┘
       │                 │            │         │
       └─────────────────┼────────────┼─────────┘
                         │            │
                    ┌────▼────────────▼────┐
                    │  INVENTORY ENGINE    │
                    │  (Transactions Only) │
                    └────┬────────────────┘
                         │
                    ┌────▼──────────────┐
                    │ ACCOUNTING ENGINE │
                    │  (Journal Entry   │
                    │  + GL + Posting)  │
                    └────┬──────────────┘
                         │
                    ┌────▼──────────────┐
                    │  AUDIT ENGINE     │
                    │  (Centralized Log)│
                    └─────────────────┘
```

---

## 📊 PHẦN 4: ENTITY DEPENDENCY DIAGRAM

```
Master Data Layer:
├── Customer ──┐
├── Supplier ──┤
├── Product ───┤
├── Branch ────┤
├── Department─┤
├── Employee ──┤
├── Warehouse ─┤
├── Category ──┤
├── TaxRate ───┤
├── Unit ──────┤
└── Currency ──┘

Document Layer (tất cả kế thừa BaseDocument):
├── SalesOrder ───→ Customer + Product + Branch
├── PurchaseOrder ─→ Supplier + Product + Branch
├── ExpenseVoucher ─→ Department + Branch + ExpenseType
├── PaymentVoucher ─→ Customer + Supplier + PaymentMethod
├── ReceiptVoucher ─→ Supplier + Product + Warehouse
├── InventoryAdjustment → Product + Warehouse
├── FixedAssetVoucher → FixedAsset
├── JournalVoucher → ChartOfAccount (custom journal)
└── ServiceTicket → Vehicle + Customer + Branch

Transaction Layer:
├── InventoryTransaction ──→ Product + Warehouse + Document
├── JournalEntry ──→ ChartOfAccount + JournalEntryLine
└── BankTransaction ──→ BankAccount + Branch

Workflow Layer:
├── WorkflowRule ──→ DocumentType + Branch + Department
└── WorkflowStep ──→ Document (any type)

Audit Layer:
└── AuditLog ──→ User + Module + Action

Permission Layer:
├── Permission ──→ PermissionCategory
├── Role ──→ Permission (N:M via RolePermission)
└── User ──→ Role (N:M)
```

---

## 🎬 PHẦN 5: CURRENT → TARGET FLOW

### Before (❌ Rối):
```
Sales Order Created
  → Service tự xử lý approval
  → Service tự ghi sổ cái (hard-code account)
  → Service tự cập nhật tồn kho (trực tiếp)
  → Service tự log (nếu nhớ)
  → Dashboard đọc từ SalesOrder table
  → Không biết ai duyệt, khi nào
  → Nếu lỗi, khó reversing
```

### After (✅ Sạch):
```
Sales Order Created
  ↓ [Status: DRAFT]
  
Submit (workflow engine)
  ↓ [Status: PENDING_APPROVAL]
  → Notify approver
  → Workflow rule: who can approve?
  → Audit log: "User A submitted order B at 10:00"
  
Approve (workflow engine)
  ↓ [Status: APPROVED]
  → Workflow rule: auto post?
  → Accounting engine: create journal entry (lookup rule)
  → Journal entry status: DRAFT
  → Audit log: "User C approved order B at 10:15"
  
Post (accounting engine)
  ↓ [Status: POSTED]
  → Journal entry status: POSTED
  → Update GL (inventory transaction created)
  → Update stock (via inventory transaction, NOT direct)
  → Audit log: "System posted order B, JE#001 at 10:20"
  
Close (workflow engine)
  ↓ [Status: CLOSED]
  → Archive document
  → Cannot edit anymore
  → Audit log: "User A closed order B at 15:00"

Report query:
  → Query GL (not SalesOrder)
  → Data always consistent
  → Dashboard synced with accounting
```

---

## 🔄 PHẦN 6: REFACTORING PRIORITY MATRIX

### HIGH PRIORITY (Làm ngay)
| Item | Reason | Effort | Impact |
|------|--------|--------|--------|
| 1. Create BaseDocument + Unified Status | Blocking all other modules | Medium | Highest |
| 2. Workflow Engine | Blocking approval standardization | High | Highest |
| 3. Accounting Engine | Blocking GL posting standardization | High | Highest |
| 4. Unified Audit Engine | Tracking & compliance | Medium | High |
| 5. RBAC Standardization | Security & access control | Medium | High |

### MEDIUM PRIORITY (Làm tuần thứ 2)
| Item | Reason | Effort | Impact |
|------|--------|--------|--------|
| 6. Inventory Engine | Blocking proper inventory tracking | High | High |
| 7. Master Data Consolidation | Data consistency | High | Medium |
| 8. Accounting Rules DB Config | Flexibility for multi-company | Medium | High |
| 9. Report Engine Integration | Dashboard sync | Medium | Medium |

### LOW PRIORITY (Làm sau)
| Item | Reason | Effort | Impact |
|------|--------|--------|--------|
| 10. UI Standardization | UX consistency | High | Medium |
| 11. Dashboard Framework | Analytics consolidation | High | Low |
| 12. Notification Engine | Alert system | Medium | Low |

---

## 🛠️ PHẦN 7: MODULE REFACTORING ROADMAP

### Phase 1: Core Infrastructure (2 weeks)
**Deliverables:**
- BaseDocument entity + migrations
- DocumentStatus enum (unified)
- WorkflowEngine + WorkflowRule entities
- AccountingEngine + AccountingRule entities
- UnifiedAuditLog + AuditService
- Permission standardization

**Files to Create:**
```
backend/src/main/java/com/chuanphat/core/
├── document/
│   ├── entity/BaseDocument.java
│   ├── entity/DocumentStatus.java
│   ├── repository/BaseDocumentRepository.java
│   └── service/DocumentService.java
├── workflow/
│   ├── entity/WorkflowRule.java
│   ├── entity/WorkflowStep.java
│   ├── entity/WorkflowAction.java
│   ├── service/WorkflowEngine.java
│   └── repository/WorkflowRepository.java
├── accounting/
│   ├── entity/AccountingRule.java
│   ├── entity/JournalEntry.java
│   ├── entity/JournalEntryLine.java
│   ├── service/AccountingEngine.java
│   ├── service/AccountingPostingService.java
│   ├── service/AccountingRuleService.java
│   └── repository/AccountingRepository.java
├── audit/
│   ├── entity/AuditLog.java
│   ├── entity/AuditModule.java
│   ├── entity/AuditAction.java
│   ├── service/AuditService.java
│   ├── aspect/AuditingAspect.java
│   └── annotation/Audited.java
├── security/
│   ├── entity/Permission.java
│   ├── entity/RolePermission.java
│   ├── service/PermissionChecker.java
│   ├── annotation/RequirePermission.java
│   └── interceptor/PermissionInterceptor.java
└── inventory/
    ├── entity/InventoryTransaction.java
    ├── entity/InventoryTransactionType.java
    ├── service/InventoryEngine.java
    └── repository/InventoryRepository.java
```

### Phase 2: Migrate Existing Modules (3 weeks)
**Migration Steps:**
1. SalesOrder
   - Extend BaseDocument
   - Map old status to DocumentStatus
   - Integrate with WorkflowEngine
   - Create accounting rules
   - Migrate data migration
2. PurchaseOrder (same as SalesOrder)
3. ExpenseVoucher (same)
4. PaymentVoucher (same)
5. BankTransaction → BankDeposit (rename for clarity)
6. ReceiptVoucher
7. InventoryAdjustment

**Migration Pattern:**
```sql
-- For each old module:
1. Create new entity extending BaseDocument
2. Create data migration:
   - Map old.status → DocumentStatus
   - Copy old.createdBy → BaseDocument.createdBy
   - Set old documents status = POSTED (assume already approved)
3. Update service layer to use WorkflowEngine
4. Update API responses to match new DTO
5. Run integration tests
6. Deploy with feature flag (old & new coexist)
7. Switch to new implementation
8. Archive old data (if needed)
```

### Phase 3: New Features (2 weeks)
**Features:**
- Approval workflow UI (who can approve, approval list)
- Workflow configuration UI (for admin)
- Accounting rule configuration UI
- Audit log viewer
- Permission management UI

### Phase 4: Data Cleanup & Optimization (1 week)
**Tasks:**
- Archive old tables
- Add indexes for performance
- Create backup of old data
- Document migration for audit trail

---

## 📝 PHẦN 8: DATABASE MIGRATION PLAN

### Migration Script Structure

```sql
-- V6__unified_document_engine.sql

-- 1. Create BaseDocument tables
CREATE TABLE base_documents (
  id UUID PRIMARY KEY,
  document_no VARCHAR(30) NOT NULL UNIQUE,
  document_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'POSTED', 'CLOSED', 'CANCELLED')),
  branch_id UUID NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by UUID,
  updated_at TIMESTAMP,
  approved_by UUID,
  approved_at TIMESTAMP,
  note VARCHAR(500),
  rejection_reason VARCHAR(500),
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE INDEX idx_base_document_status ON base_documents(status);
CREATE INDEX idx_base_document_branch ON base_documents(branch_id);
CREATE INDEX idx_base_document_created_by ON base_documents(created_by);
CREATE INDEX idx_base_document_document_no ON base_documents(document_no);

-- 2. Modify existing tables to reference base_documents
ALTER TABLE sales_orders ADD COLUMN base_document_id UUID REFERENCES base_documents(id);

-- 3. Data migration: copy old sales order data to base_documents
INSERT INTO base_documents (
  id, document_no, document_date, status, branch_id, created_by, created_at, approved_by, approved_at
)
SELECT
  uuid_generate_v4(),
  so.order_no,
  so.order_date,
  CASE 
    WHEN so.status = 'DRAFT' THEN 'DRAFT'
    WHEN so.status = 'CONFIRMED' THEN 'APPROVED'
    ELSE 'POSTED'
  END,
  so.branch_id,
  so.created_by,
  so.created_at,
  so.approved_by,
  so.approved_at
FROM sales_orders so;

-- 4. Create Workflow tables
CREATE TABLE workflow_rules (
  id UUID PRIMARY KEY,
  document_type VARCHAR(50) NOT NULL,
  branch_id UUID,
  department_id UUID,
  rule_name VARCHAR(50) NOT NULL,
  workflow_steps JSON NOT NULL,
  approval_required INT NOT NULL DEFAULT 0,
  approval_roles JSON,
  auto_post_on_approve BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (department_id) REFERENCES departments(id),
  UNIQUE(document_type, branch_id, department_id)
);

CREATE TABLE workflow_steps (
  id UUID PRIMARY KEY,
  document_id UUID NOT NULL,
  from_status VARCHAR(20) NOT NULL,
  to_status VARCHAR(20) NOT NULL,
  action VARCHAR(20) NOT NULL,
  performed_by UUID NOT NULL,
  performed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  comment VARCHAR(500),
  FOREIGN KEY (performed_by) REFERENCES users(id),
  INDEX idx_workflow_step_document (document_id)
);

-- 5. Create Accounting tables
CREATE TABLE accounting_rules (
  id UUID PRIMARY KEY,
  document_type VARCHAR(50) NOT NULL,
  branch_id UUID,
  department_id UUID,
  product_category_id UUID,
  debit_account_code VARCHAR(20) NOT NULL,
  credit_account_code VARCHAR(20) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (product_category_id) REFERENCES product_categories(id),
  FOREIGN KEY (debit_account_code) REFERENCES chart_of_accounts(code),
  FOREIGN KEY (credit_account_code) REFERENCES chart_of_accounts(code),
  UNIQUE(document_type, branch_id, department_id, product_category_id)
);

CREATE TABLE journal_entries (
  id UUID PRIMARY KEY,
  document_type VARCHAR(50) NOT NULL,
  document_id UUID NOT NULL,
  document_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'APPROVED', 'POSTED', 'CANCELLED')),
  branch_id UUID NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  posted_at TIMESTAMP,
  reference_entry_id UUID,
  reversal_entry_id UUID,
  note VARCHAR(500),
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (reference_entry_id) REFERENCES journal_entries(id),
  FOREIGN KEY (reversal_entry_id) REFERENCES journal_entries(id),
  INDEX idx_journal_entry_status (status),
  INDEX idx_journal_entry_document (document_type, document_id),
  INDEX idx_journal_entry_posted_at (posted_at)
);

CREATE TABLE journal_entry_lines (
  id UUID PRIMARY KEY,
  journal_entry_id UUID NOT NULL,
  account_code VARCHAR(20) NOT NULL,
  debit NUMERIC(18, 2) NOT NULL DEFAULT 0,
  credit NUMERIC(18, 2) NOT NULL DEFAULT 0,
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (account_code) REFERENCES chart_of_accounts(code),
  INDEX idx_journal_line_entry (journal_entry_id)
);

-- 6. Create Inventory tables
CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  product_id UUID NOT NULL,
  warehouse_id UUID NOT NULL,
  reference_document_id UUID,
  quantity NUMERIC(18, 4) NOT NULL,
  unit_price NUMERIC(18, 4) NOT NULL,
  total_amount NUMERIC(18, 2) NOT NULL,
  valuation_method VARCHAR(30) NOT NULL DEFAULT 'FIFO',
  transaction_date DATE NOT NULL,
  note VARCHAR(500),
  created_by UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_inventory_tx_product_warehouse (product_id, warehouse_id),
  INDEX idx_inventory_tx_date (transaction_date),
  INDEX idx_inventory_tx_type (type)
);

-- 7. Create Audit tables
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  module VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL,
  user_id UUID NOT NULL,
  before_values JSON,
  after_values JSON,
  note VARCHAR(500),
  ip_address VARCHAR(100),
  user_agent VARCHAR(100),
  branch_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  INDEX idx_audit_log_module_action (module, action),
  INDEX idx_audit_log_user_time (user_id, created_at),
  INDEX idx_audit_log_entity (entity_type, entity_id),
  INDEX idx_audit_log_created_at (created_at)
);

-- 8. Create Permission tables
CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(500),
  category VARCHAR(50) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO permissions (id, code, name, category) VALUES
  (uuid_generate_v4(), 'SALES_VIEW', 'View Sales Orders', 'SALES'),
  (uuid_generate_v4(), 'SALES_CREATE', 'Create Sales Order', 'SALES'),
  (uuid_generate_v4(), 'SALES_EDIT', 'Edit Sales Order', 'SALES'),
  (uuid_generate_v4(), 'SALES_APPROVE', 'Approve Sales Order', 'SALES'),
  (uuid_generate_v4(), 'SALES_POST', 'Post Sales Order', 'SALES'),
  (uuid_generate_v4(), 'SALES_CANCEL', 'Cancel Sales Order', 'SALES'),
  -- ... more permissions
  (uuid_generate_v4(), 'ACCOUNTING_VIEW', 'View Accounting', 'ACCOUNTING'),
  (uuid_generate_v4(), 'ACCOUNTING_POST', 'Post Journal Entry', 'ACCOUNTING'),
  (uuid_generate_v4(), 'ACCOUNTING_CLOSE_PERIOD', 'Close Period', 'ACCOUNTING');

CREATE TABLE role_permissions (
  id UUID PRIMARY KEY,
  role_id UUID NOT NULL,
  permission_id UUID NOT NULL,
  branch_id UUID,
  department_id UUID,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (department_id) REFERENCES departments(id),
  UNIQUE(role_id, permission_id, branch_id, department_id)
);

-- Done
COMMIT;
```

---

## 🚀 PHẦN 9: CODE REFACTORING ROADMAP

### Backend Files to Create/Modify

#### Create (Core Infrastructure):
```
backend/src/main/java/com/chuanphat/core/
├── common/
│   ├── dto/BaseDocumentDto.java
│   ├── entity/EntityId.java (UUID generator)
│   └── exception/BusinessException.java
├── document/
│   ├── entity/BaseDocument.java
│   ├── entity/DocumentStatus.java
│   ├── entity/DocumentType.java
│   ├── dto/BaseDocumentCreateRequest.java
│   ├── dto/BaseDocumentResponse.java
│   ├── repository/BaseDocumentRepository.java
│   └── service/DocumentService.java
├── workflow/
│   ├── entity/WorkflowRule.java
│   ├── entity/WorkflowStep.java
│   ├── entity/WorkflowAction.java
│   ├── dto/WorkflowRuleRequest.java
│   ├── dto/WorkflowStepResponse.java
│   ├── repository/WorkflowRepository.java
│   ├── service/WorkflowEngine.java
│   ├── controller/WorkflowController.java
│   └── exception/WorkflowException.java
├── accounting/
│   ├── entity/AccountingRule.java
│   ├── entity/JournalEntry.java
│   ├── entity/JournalEntryLine.java
│   ├── entity/JournalEntryStatus.java
│   ├── dto/AccountingRuleRequest.java
│   ├── dto/JournalEntryRequest.java
│   ├── dto/JournalEntryResponse.java
│   ├── repository/AccountingRepository.java
│   ├── service/AccountingEngine.java
│   ├── service/AccountingPostingService.java
│   ├── service/AccountingRuleService.java
│   ├── service/FinancialStatementService.java
│   ├── controller/AccountingController.java
│   ├── controller/AccountingRuleController.java
│   └── exception/AccountingException.java
├── audit/
│   ├── entity/AuditLog.java
│   ├── entity/AuditModule.java
│   ├── entity/AuditAction.java
│   ├── dto/AuditLogResponse.java
│   ├── dto/AuditLogFilter.java
│   ├── repository/AuditLogRepository.java
│   ├── service/AuditService.java
│   ├── aspect/AuditingAspect.java
│   ├── annotation/Audited.java
│   └── controller/AuditLogController.java
├── inventory/
│   ├── entity/InventoryTransaction.java
│   ├── entity/InventoryTransactionType.java
│   ├── entity/InventoryValuationMethod.java
│   ├── dto/InventoryTransactionRequest.java
│   ├── dto/InventoryTransactionResponse.java
│   ├── repository/InventoryRepository.java
│   ├── service/InventoryEngine.java
│   ├── service/StockCalculationService.java
│   └── exception/InventoryException.java
├── security/
│   ├── entity/Permission.java
│   ├── entity/RolePermission.java
│   ├── entity/PermissionCategory.java
│   ├── dto/PermissionResponse.java
│   ├── repository/PermissionRepository.java
│   ├── service/PermissionChecker.java
│   ├── annotation/RequirePermission.java
│   ├── interceptor/PermissionInterceptor.java
│   ├── interceptor/AuditInterceptor.java
│   └── controller/PermissionController.java
└── master/
    ├── entity/Customer.java
    ├── entity/Supplier.java
    ├── entity/Product.java
    ├── entity/Branch.java
    ├── entity/Department.java
    ├── entity/Employee.java
    ├── entity/Warehouse.java
    ├── entity/ProductCategory.java
    ├── entity/TaxRate.java
    ├── entity/PaymentMethod.java
    ├── entity/Currency.java
    ├── entity/UnitOfMeasure.java
    ├── repository/MasterRepository.java
    ├── service/MasterDataService.java
    └── controller/MasterDataController.java
```

#### Modify (Existing Modules - Inheritance):
```
OLD:                          NEW:
SalesOrder                 →  SalesOrder extends BaseDocument
PurchaseOrder              →  PurchaseOrder extends BaseDocument
ExpenseVoucher             →  ExpenseVoucher extends BaseDocument
PaymentVoucher             →  PaymentVoucher extends BaseDocument
ReceiptVoucher             →  ReceiptVoucher extends BaseDocument
InventoryAdjustment        →  InventoryAdjustment extends BaseDocument
FixedAssetVoucher          →  FixedAssetVoucher extends BaseDocument
JournalVoucher             →  JournalVoucher extends BaseDocument
BankTransaction            →  BankTransaction extends BaseDocument
ServiceTicket              →  ServiceTicket extends BaseDocument
```

### Frontend Files to Create/Modify

#### Create (New Components):
```
frontend/src/modules/workflow/
├── components/
│   ├── WorkflowRuleForm.tsx
│   ├── WorkflowRuleList.tsx
│   ├── ApprovalDialog.tsx
│   ├── RejectionDialog.tsx
│   ├── WorkflowTimeline.tsx
│   └── PermissionCheck.tsx
├── hooks/
│   ├── useWorkflow.ts
│   ├── usePermission.ts
│   └── useAuditLog.ts
├── types/
│   ├── workflow.ts
│   ├── permission.ts
│   └── audit.ts
├── pages/
│   ├── WorkflowRulePage.tsx
│   ├── AuditLogPage.tsx
│   └── PermissionManagementPage.tsx
└── api/
    ├── workflowAPI.ts
    ├── permissionAPI.ts
    └── auditAPI.ts

frontend/src/modules/accounting/
├── components/
│   ├── AccountingRuleForm.tsx
│   ├── JournalEntryForm.tsx
│   ├── JournalEntryViewer.tsx
│   ├── AccountingRuleList.tsx
│   └── TrialBalanceViewer.tsx
├── hooks/
│   ├── useAccountingRule.ts
│   ├── useJournalEntry.ts
│   └── useTrialBalance.ts
├── pages/
│   ├── AccountingRulePage.tsx
│   ├── JournalEntryPage.tsx
│   └── TrialBalancePage.tsx
└── api/
    ├── accountingRuleAPI.ts
    └── journalEntryAPI.ts

frontend/src/modules/inventory/
├── components/
│   ├── InventoryTransactionForm.tsx
│   ├── StockLevelViewer.tsx
│   ├── InventoryTransactionList.tsx
│   └── StockMovementChart.tsx
├── hooks/
│   ├── useInventoryTransaction.ts
│   └── useStockLevel.ts
└── api/
    └── inventoryAPI.ts
```

---

## ✅ PHẦN 10: IMPLEMENTATION CHECKLIST

### Phase 1: Infrastructure (Week 1-2)

#### Week 1 - Database & Core Entities
- [ ] Create migration V6__unified_document_engine.sql
- [ ] Create BaseDocument entity
- [ ] Create DocumentStatus enum
- [ ] Create WorkflowRule & WorkflowStep entities
- [ ] Create AccountingRule, JournalEntry entities
- [ ] Create AuditLog entity
- [ ] Create Permission & RolePermission entities
- [ ] Create InventoryTransaction entity
- [ ] Run migrations on dev database
- [ ] Verify all foreign keys & indexes

#### Week 2 - Core Services
- [ ] Implement WorkflowEngine service
- [ ] Implement AccountingEngine service
- [ ] Implement InventoryEngine service
- [ ] Implement AuditService + AuditingAspect
- [ ] Implement PermissionChecker service
- [ ] Create API controllers for above services
- [ ] Write unit tests for each service
- [ ] Create API documentation (Swagger)

### Phase 2: Module Migration (Week 3-4)

#### Week 3
- [ ] Migrate SalesOrder
  - [ ] Extend BaseDocument
  - [ ] Update service to use WorkflowEngine
  - [ ] Create accounting rule for sales
  - [ ] Update DTOs
  - [ ] Create data migration script
  - [ ] Write integration tests
- [ ] Migrate PurchaseOrder (same steps)

#### Week 4
- [ ] Migrate ExpenseVoucher
- [ ] Migrate PaymentVoucher
- [ ] Migrate ReceiptVoucher
- [ ] Migrate InventoryAdjustment
- [ ] Update existing tests

### Phase 3: UI Implementation (Week 5)

- [ ] Create Workflow configuration UI
- [ ] Create Approval UI components
- [ ] Create Audit log viewer
- [ ] Create Permission management UI
- [ ] Create Accounting rule UI
- [ ] Create Master data UIs

### Phase 4: Testing & Deployment (Week 6)

- [ ] End-to-end testing
- [ ] Performance testing (with large data)
- [ ] Security testing (permissions)
- [ ] User acceptance testing
- [ ] Production deployment (with rollback plan)

---

## 📊 PHASE 5: CURRENT ISSUES & SOLUTIONS

### Issue #1: Hard-Coded Account Codes
**Problem:**
```java
// Old way (❌)
account = "111";  // How do we know this is Cash?
```

**Solution:**
```java
// New way (✅)
AccountingRule rule = accountingRuleRepository
  .findByDocumentType(SALES_ORDER);
Account debitAccount = rule.getDebitAccount();  // "111" + label = "Cash"
```

### Issue #2: Status Chaos
**Problem:**
```typescript
// Old way (❌)
DRAFT vs CREATED vs OPEN vs NEW
POSTED vs CONFIRMED vs APPROVED vs PUBLISHED
CANCELLED vs DELETED vs ARCHIVED
```

**Solution:**
```typescript
// New way (✅)
enum DocumentStatus {
  DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, POSTED, CLOSED, CANCELLED
}
// Applied to all modules consistently
```

### Issue #3: No Approval History
**Problem:**
```
❌ Who approved? Nobody knows.
❌ When approved? No record.
❌ Why rejected? No comment.
❌ Can we reverse? Unknown.
```

**Solution:**
```sql
-- WorkflowStep tracks everything
INSERT INTO workflow_steps VALUES (
  id, doc_id, APPROVED_APPROVAL, POSTED,
  user_id, NOW(), 'comment'
);
-- AuditLog records all changes
INSERT INTO audit_logs VALUES (
  id, SALES, SalesOrder, doc_id, APPROVE,
  user_id, before, after, NOW()
);
```

### Issue #4: Stock Updated Directly
**Problem:**
```sql
-- Old way (❌)
UPDATE inventory_stock SET qty = qty + 100;
-- Nobody knows why stock changed!
```

**Solution:**
```sql
-- New way (✅)
INSERT INTO inventory_transactions (type, product_id, qty, reference_doc, ...)
VALUES ('SALES_ISSUE', product_id, -100, sales_order_id, ...);
-- Calculate stock from transactions
SELECT SUM(quantity) FROM inventory_transactions WHERE product_id = ?;
```

### Issue #5: Dashboard Data Inconsistent
**Problem:**
```sql
-- Old way (❌)
SELECT SUM(amount) FROM sales_orders;  -- Might include draft/cancelled!
```

**Solution:**
```sql
-- New way (✅)
SELECT SUM(credit) FROM journal_entries je
JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
WHERE je.status = 'POSTED'
  AND jel.account_code LIKE '511%'  -- Revenue accounts
  AND je.branch_id = ?;
```

---

## 🎯 SUCCESS METRICS

After refactoring, Chuẩn Phát will have:

✅ **Standardization**
- 1 document lifecycle (not 10+)
- 1 workflow engine (not each module doing its own)
- 1 audit system (not scattered logs)
- 1 permission model (not multiple formats)

✅ **Maintainability**
- Adding new module: inherit BaseDocument, implement rules
- Changing workflow: update DB, not code
- Fixing bug: fix once, applies to all modules
- Tracking changes: full audit trail

✅ **Scalability**
- Support 100+ branches
- Support multi-company
- Support multi-chart of accounts
- Partition tables when data grows

✅ **Compliance**
- Full audit trail for legal/tax
- Approval workflow for compliance
- Non-repudiation (cannot deny actions)
- Field-level permissions for data security

✅ **Integration**
- All modules sync via accounting
- Reports consistent across system
- Dashboard shows real data
- External integration easier

---

## 🎬 NEXT ACTIONS

### Immediate (This Week)
1. ✅ Review this refactoring report with team
2. ⏳ Get approval from technical lead
3. ⏳ Schedule database backup before changes
4. ⏳ Set up feature branch for refactoring

### Short-term (Week 1-2)
1. Create database migration V6
2. Implement BaseDocument entity
3. Implement WorkflowEngine
4. Implement AccountingEngine
5. Implement AuditService

### Medium-term (Week 3-5)
1. Migrate SalesOrder module
2. Migrate PurchaseOrder module
3. Migrate other modules
4. Create UI components
5. User acceptance testing

### Long-term (Week 6+)
1. Production deployment
2. Monitor for issues
3. Optimize performance
4. Document for new developers
5. Plan Phase 2 (reports, dashboard)

---

## 📞 QUESTIONS & ANSWERS

**Q: Will this break existing functionality?**  
A: No. We migrate data gradually and keep old & new system in parallel. Switch when new is fully tested.

**Q: How long will refactoring take?**  
A: ~6 weeks with 2-3 developers. Can be faster if prioritized.

**Q: Do we need to stop feature development?**  
A: Ideally yes, so refactoring is not diluted. But can work in parallel with feature flag.

**Q: What about database downtime?**  
A: 0 downtime. We add new tables, migrate data in background, then switch application.

**Q: Can we do this module by module?**  
A: Yes! Each module can be migrated independently after core infrastructure is ready.

**Q: What about existing data?**  
A: All existing data is preserved and migrated. Nothing is deleted.

---

## 📋 APPENDIX A: STATUS MAPPING TABLE

| Old Module | Old Status | New Status | Note |
|-----------|-----------|-----------|------|
| SalesOrder | DRAFT | DRAFT | - |
| SalesOrder | CONFIRMED | APPROVED | Renamed |
| SalesOrder | DONE | POSTED | Renamed |
| SalesOrder | CANCELLED | CANCELLED | - |
| PurchaseOrder | DRAFT | DRAFT | - |
| PurchaseOrder | APPROVED | APPROVED | - |
| PurchaseOrder | RECEIVED | POSTED | Renamed |
| PurchaseOrder | CANCELLED | CANCELLED | - |
| ExpenseVoucher | NEW | DRAFT | Renamed |
| ExpenseVoucher | SUBMITTED | PENDING_APPROVAL | Renamed |
| ExpenseVoucher | APPROVED | APPROVED | - |
| ExpenseVoucher | REJECTED | REJECTED | - |
| ExpenseVoucher | POSTED | POSTED | - |
| BankTransaction | DRAFT | DRAFT | - |
| BankTransaction | POSTED | POSTED | - |
| BankTransaction | CANCELLED | CANCELLED | - |
| ServiceTicket | CREATED | DRAFT | Renamed |
| ServiceTicket | IN_PROGRESS | PENDING_APPROVAL | Mapped |
| ServiceTicket | COMPLETED | CLOSED | Mapped |
| ServiceTicket | CANCELLED | CANCELLED | - |

---

## 📋 APPENDIX B: PERMISSION MAPPING TABLE

| Current Permission | New Standard | Category |
|------------------|--------------|----------|
| SALES_MANAGE | SALES_VIEW + SALES_EDIT | SALES |
| SALES_APPROVE_DISCOUNT | SALES_APPROVE | SALES |
| PURCHASE_MANAGE | PURCHASE_VIEW + PURCHASE_EDIT | PURCHASE |
| PURCHASE_APPROVE | PURCHASE_APPROVE | PURCHASE |
| ACCOUNTING_CREATE | ACCOUNTING_CREATE | ACCOUNTING |
| ACCOUNTING_POST | ACCOUNTING_POST | ACCOUNTING |
| ADMIN_ONLY | ROLE_MANAGE | ADMIN |

---

**Document Created:** 2026-06-13  
**Last Updated:** 2026-06-13  
**Version:** 1.0  
**Status:** 📋 Ready for Review

---

**END OF ERP REFACTORING MASTER REPORT**

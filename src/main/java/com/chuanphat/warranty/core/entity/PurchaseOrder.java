package com.chuanphat.warranty.core.entity;

import com.chuanphat.warranty.core.enums.PurchaseOrderStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Don mua hang.
 * V20: status machine day du, approval workflow, expected delivery.
 *
 * Luong: DRAFT -> submit() -> SUBMITTED -> approve() -> APPROVED -> createReceipt()
 *        APPROVED -> PurchaseReceipt.confirm() -> PARTIALLY_RECEIVED -> RECEIVED
 */
@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String purchaseOrderNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(nullable = false)
    private Long branchId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PurchaseOrderStatus status = PurchaseOrderStatus.DRAFT;

    @Column(nullable = false)
    private LocalDate purchaseDate;

    private LocalDate expectedDelivery;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    /** Nguong phan quyen duyet; tat ca PO sau submit deu can maker-checker. */
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal approvalThreshold = new BigDecimal("50000000");

    @Column(length = 500)
    private String note;

    // Audit fields
    @Column(length = 120)
    private String createdBy;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    private OffsetDateTime submittedAt;
    @Column(length = 120)
    private String submittedBy;

    private OffsetDateTime approvedAt;
    @Column(length = 120)
    private String approvedBy;

    private OffsetDateTime rejectedAt;
    @Column(length = 120)
    private String rejectedBy;
    @Column(length = 500)
    private String rejectReason;

    private OffsetDateTime cancelledAt;
    @Column(length = 120)
    private String cancelledBy;
    @Column(length = 500)
    private String cancelReason;

    // Workflow flags
    @Column(nullable = false)
    private boolean accountingRecorded = false;

    @Column(nullable = false)
    private boolean stockReceived = false;

    @Column(nullable = false)
    private boolean serialsCreated = false;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseOrderItem> items = new ArrayList<>();

    // ── Helpers ──────────────────────────────────────────────────
    public void addItem(PurchaseOrderItem item) { items.add(item); item.setPurchaseOrder(this); }

    /** True neu don nay can duyet (vuot nguong approval) */
    public boolean requiresApproval() {
        return totalAmount.compareTo(approvalThreshold) > 0;
    }

    // ── Getters & Setters ─────────────────────────────────────────
    public Long getId() { return id; }
    public String getPurchaseOrderNo() { return purchaseOrderNo; }
    public void setPurchaseOrderNo(String purchaseOrderNo) { this.purchaseOrderNo = purchaseOrderNo; }
    // Backward-compatible aliases for the purchase PR1 spec names; canonical columns keep existing names.
    public String getPoCode() { return purchaseOrderNo; }
    public void setPoCode(String poCode) { this.purchaseOrderNo = poCode; }
    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }
    public Long getWarehouseId() { return warehouse != null ? warehouse.getId() : null; }
    public PurchaseOrderStatus getStatus() { return status; }
    public void setStatus(PurchaseOrderStatus status) { this.status = status; }
    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }
    // Backward-compatible aliases for the purchase PR1 spec names; canonical columns keep existing names.
    public LocalDate getOrderDate() { return purchaseDate; }
    public void setOrderDate(LocalDate orderDate) { this.purchaseDate = orderDate; }
    public LocalDate getExpectedDelivery() { return expectedDelivery; }
    public void setExpectedDelivery(LocalDate expectedDelivery) { this.expectedDelivery = expectedDelivery; }
    public LocalDate getExpectedDeliveryDate() { return expectedDelivery; }
    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) { this.expectedDelivery = expectedDeliveryDate; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getPaidAmount() { return paidAmount; }
    public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }
    public BigDecimal getApprovalThreshold() { return approvalThreshold; }
    public void setApprovalThreshold(BigDecimal approvalThreshold) { this.approvalThreshold = approvalThreshold; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(OffsetDateTime submittedAt) { this.submittedAt = submittedAt; }
    public String getSubmittedBy() { return submittedBy; }
    public void setSubmittedBy(String submittedBy) { this.submittedBy = submittedBy; }
    public OffsetDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(OffsetDateTime approvedAt) { this.approvedAt = approvedAt; }
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    public OffsetDateTime getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(OffsetDateTime rejectedAt) { this.rejectedAt = rejectedAt; }
    public String getRejectedBy() { return rejectedBy; }
    public void setRejectedBy(String rejectedBy) { this.rejectedBy = rejectedBy; }
    public String getRejectReason() { return rejectReason; }
    public void setRejectReason(String rejectReason) { this.rejectReason = rejectReason; }
    public OffsetDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(OffsetDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
    public String getCancelledBy() { return cancelledBy; }
    public void setCancelledBy(String cancelledBy) { this.cancelledBy = cancelledBy; }
    public String getCancelReason() { return cancelReason; }
    public void setCancelReason(String cancelReason) { this.cancelReason = cancelReason; }
    public boolean isAccountingRecorded() { return accountingRecorded; }
    public void setAccountingRecorded(boolean accountingRecorded) { this.accountingRecorded = accountingRecorded; }
    public boolean isStockReceived() { return stockReceived; }
    public void setStockReceived(boolean stockReceived) { this.stockReceived = stockReceived; }
    public boolean isSerialsCreated() { return serialsCreated; }
    public void setSerialsCreated(boolean serialsCreated) { this.serialsCreated = serialsCreated; }
    public List<PurchaseOrderItem> getItems() { return items; }
}

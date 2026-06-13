package com.chuanphat.warranty.core.entity;

import com.chuanphat.warranty.core.enums.PayableStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Cong no phai tra nha cung cap.
 *
 * Moi lan nhap hang (PurchaseReceipt.confirm) sinh 1 Payable.
 * Moi lan thanh toan sinh 1 PayablePayment va tru remainingAmount.
 * Moi lan tra hang (DEDUCT_PAYABLE) tru remainingAmount.
 */
@Entity
@Table(name = "payables")
public class Payable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String payableCode;            // VD: CN-00001

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(nullable = false)
    private Long branchId;

    // Nguon phat sinh
    @Column(nullable = false, length = 40)
    private String sourceType;             // PURCHASE_RECEIPT | MANUAL | PURCHASE_RETURN_REFUND

    private Long sourceId;

    @Column(length = 80)
    private String sourceNo;

    // So tien
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal originalAmount;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal remainingAmount;

    // Thoi han
    @Column(nullable = false)
    private LocalDate invoiceDate = LocalDate.now();

    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PayableStatus status = PayableStatus.OPEN;

    @Column(length = 500)
    private String note;

    @Column(length = 120)
    private String createdBy;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @OneToMany(mappedBy = "payable", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PayablePayment> payments = new ArrayList<>();

    // ── Helpers ──────────────────────────────────────────────────
    public void addPayment(PayablePayment payment) {
        payments.add(payment);
        payment.setPayable(this);
    }

    /** Ap dung mot khoan thanh toan, tra ve so tien thuc su duoc ap dung */
    public BigDecimal applyPayment(BigDecimal amount) {
        BigDecimal applied = amount.min(remainingAmount);
        paidAmount = paidAmount.add(applied);
        remainingAmount = remainingAmount.subtract(applied);
        updatedAt = OffsetDateTime.now();
        if (remainingAmount.compareTo(BigDecimal.ZERO) == 0) {
            status = PayableStatus.PAID;
        } else if (paidAmount.compareTo(BigDecimal.ZERO) > 0) {
            status = PayableStatus.PARTIAL;
        }
        return applied;
    }

    /** Hoan tac khoan thanh toan (huy phieu) */
    public void reversePayment(BigDecimal amount) {
        paidAmount = paidAmount.subtract(amount).max(BigDecimal.ZERO);
        remainingAmount = originalAmount.subtract(paidAmount);
        updatedAt = OffsetDateTime.now();
        if (paidAmount.compareTo(BigDecimal.ZERO) == 0) {
            status = PayableStatus.OPEN;
        } else {
            status = PayableStatus.PARTIAL;
        }
    }

    // ── Getters & Setters ─────────────────────────────────────────
    public Long getId() { return id; }
    public String getPayableCode() { return payableCode; }
    public void setPayableCode(String payableCode) { this.payableCode = payableCode; }
    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }
    public Long getSourceId() { return sourceId; }
    public void setSourceId(Long sourceId) { this.sourceId = sourceId; }
    public String getSourceNo() { return sourceNo; }
    public void setSourceNo(String sourceNo) { this.sourceNo = sourceNo; }
    public BigDecimal getOriginalAmount() { return originalAmount; }
    public void setOriginalAmount(BigDecimal originalAmount) {
        this.originalAmount = originalAmount;
        this.remainingAmount = originalAmount.subtract(paidAmount);
    }
    public BigDecimal getPaidAmount() { return paidAmount; }
    public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }
    public BigDecimal getRemainingAmount() { return remainingAmount; }
    public void setRemainingAmount(BigDecimal remainingAmount) { this.remainingAmount = remainingAmount; }
    public LocalDate getInvoiceDate() { return invoiceDate; }
    public void setInvoiceDate(LocalDate invoiceDate) { this.invoiceDate = invoiceDate; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public PayableStatus getStatus() { return status; }
    public void setStatus(PayableStatus status) { this.status = status; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public List<PayablePayment> getPayments() { return payments; }
}

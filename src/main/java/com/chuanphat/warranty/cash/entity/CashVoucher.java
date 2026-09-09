package com.chuanphat.warranty.cash.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cash_vouchers")
public class CashVoucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "voucher_no", nullable = false, unique = true, length = 30)
    private String voucherNo;

    @Enumerated(EnumType.STRING)
    @Column(name = "voucher_type", nullable = false, length = 10)
    private CashVoucherType voucherType;

    @Column(name = "voucher_date", nullable = false)
    private LocalDate voucherDate;

    @Column(name = "reference_no", length = 80)
    private String referenceNo;

    @Enumerated(EnumType.STRING)
    @Column(name = "object_type", length = 20)
    private ObjectType objectType;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(length = 500)
    private String description;

    @Column(name = "total_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "cash_account_code", nullable = false, length = 20)
    private String cashAccountCode = "111";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CashVoucherStatus status = CashVoucherStatus.DRAFT;

    @Column(name = "branch_id", nullable = false)
    private Long branchId;

    @Column(name = "journal_entry_id")
    private Long journalEntryId;

    @Column(name = "created_by", nullable = false, length = 120)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "posted_at")
    private OffsetDateTime postedAt;

    @Column(name = "cancelled_at")
    private OffsetDateTime cancelledAt;

    @OneToMany(mappedBy = "cashVoucher", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CashVoucherLine> lines = new ArrayList<>();

    // Helpers
    public void addLine(CashVoucherLine line) {
        lines.add(line);
        line.setCashVoucher(this);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getVoucherNo() {
        return voucherNo;
    }

    public void setVoucherNo(String voucherNo) {
        this.voucherNo = voucherNo;
    }

    public CashVoucherType getVoucherType() {
        return voucherType;
    }

    public void setVoucherType(CashVoucherType voucherType) {
        this.voucherType = voucherType;
    }

    public LocalDate getVoucherDate() {
        return voucherDate;
    }

    public void setVoucherDate(LocalDate voucherDate) {
        this.voucherDate = voucherDate;
    }

    public String getReferenceNo() {
        return referenceNo;
    }

    public void setReferenceNo(String referenceNo) {
        this.referenceNo = referenceNo;
    }

    public ObjectType getObjectType() {
        return objectType;
    }

    public void setObjectType(ObjectType objectType) {
        this.objectType = objectType;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Long supplierId) {
        this.supplierId = supplierId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getCashAccountCode() {
        return cashAccountCode;
    }

    public void setCashAccountCode(String cashAccountCode) {
        this.cashAccountCode = cashAccountCode;
    }

    public CashVoucherStatus getStatus() {
        return status;
    }

    public void setStatus(CashVoucherStatus status) {
        this.status = status;
    }

    public Long getBranchId() {
        return branchId;
    }

    public void setBranchId(Long branchId) {
        this.branchId = branchId;
    }

    public Long getJournalEntryId() {
        return journalEntryId;
    }

    public void setJournalEntryId(Long journalEntryId) {
        this.journalEntryId = journalEntryId;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getPostedAt() {
        return postedAt;
    }

    public void setPostedAt(OffsetDateTime postedAt) {
        this.postedAt = postedAt;
    }

    public OffsetDateTime getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(OffsetDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public List<CashVoucherLine> getLines() {
        return lines;
    }

    public void setLines(List<CashVoucherLine> lines) {
        this.lines = lines;
    }
}

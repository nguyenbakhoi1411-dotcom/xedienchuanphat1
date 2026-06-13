package com.chuanphat.warranty.core.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_returns")
public class PurchaseReturn {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String returnCode;

    @Column(nullable = false)
    private Long supplierId;

    @Column(nullable = false)
    private Long branchId;

    private Long purchaseOrderId;

    @Column(nullable = false)
    private LocalDate returnDate = LocalDate.now();

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(length = 20)
    private String status = "DRAFT";

    @Column(length = 30)
    private String refundMethod;   // DEDUCT_PAYABLE | CASH_REFUND

    @Column(length = 500)
    private String reason;

    @Column(length = 500)
    private String note;

    // V20: workflow flags
    @Column(nullable = false)
    private boolean stockReturned = false;

    @Column(nullable = false)
    private boolean payableAdjusted = false;

    @Column(nullable = false)
    private boolean accountingRecorded = false;

    private Long payableId;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(nullable = false, length = 120)
    private String createdBy;

    @OneToMany(mappedBy = "purchaseReturn", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PurchaseReturnItem> items = new ArrayList<>();

    // Getters and Setters
    public Long getId() { return id; }
    public String getReturnCode() { return returnCode; }
    public void setReturnCode(String returnCode) { this.returnCode = returnCode; }
    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public Long getPurchaseOrderId() { return purchaseOrderId; }
    public void setPurchaseOrderId(Long purchaseOrderId) { this.purchaseOrderId = purchaseOrderId; }
    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRefundMethod() { return refundMethod; }
    public void setRefundMethod(String refundMethod) { this.refundMethod = refundMethod; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public boolean isStockReturned() { return stockReturned; }
    public void setStockReturned(boolean stockReturned) { this.stockReturned = stockReturned; }
    public boolean isPayableAdjusted() { return payableAdjusted; }
    public void setPayableAdjusted(boolean payableAdjusted) { this.payableAdjusted = payableAdjusted; }
    public boolean isAccountingRecorded() { return accountingRecorded; }
    public void setAccountingRecorded(boolean accountingRecorded) { this.accountingRecorded = accountingRecorded; }
    public Long getPayableId() { return payableId; }
    public void setPayableId(Long payableId) { this.payableId = payableId; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public List<PurchaseReturnItem> getItems() { return items; }
    public void addItem(PurchaseReturnItem item) { items.add(item); item.setPurchaseReturn(this); }
}

package com.chuanphat.warranty.core.entity;

import com.chuanphat.warranty.core.enums.SalesReturnStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales_returns")
public class SalesReturn {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String returnNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private SalesOrder order;

    @Column(nullable = false)
    private Long branchId;

    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false)
    private LocalDate returnDate = LocalDate.now();

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal returnAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal refundAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SalesReturnStatus status = SalesReturnStatus.COMPLETED;

    @Column(length = 500)
    private String reason;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(length = 255)
    private String createdBy;

    private LocalDate accountingDate;

    @Column(name = "voucher_id")
    private Long voucherId;

    @Column(name = "invoice_id")
    private Long invoiceId;

    @Column(precision = 18, scale = 2)
    private BigDecimal totalTaxAmount = BigDecimal.ZERO;

    @Column(length = 50)
    private String refundMethod = "CASH";

    /** Đã đảo bút toán doanh thu/giá vốn chưa — chống ghi trùng */
    @Column(nullable = false)
    private boolean accountingReversed = false;

    @Column(length = 80)
    private String reversalEntryNo;

    @OneToMany(mappedBy = "salesReturn", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SalesReturnItem> items = new ArrayList<>();

    public Long getId() { return id; }
    public String getReturnNo() { return returnNo; }
    public void setReturnNo(String returnNo) { this.returnNo = returnNo; }
    public SalesOrder getOrder() { return order; }
    public void setOrder(SalesOrder order) { this.order = order; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }
    public BigDecimal getReturnAmount() { return returnAmount; }
    public void setReturnAmount(BigDecimal returnAmount) { this.returnAmount = returnAmount; }
    public BigDecimal getRefundAmount() { return refundAmount; }
    public void setRefundAmount(BigDecimal refundAmount) { this.refundAmount = refundAmount; }
    public SalesReturnStatus getStatus() { return status; }
    public void setStatus(SalesReturnStatus status) { this.status = status; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public boolean isAccountingReversed() { return accountingReversed; }
    public void setAccountingReversed(boolean accountingReversed) { this.accountingReversed = accountingReversed; }
    public String getReversalEntryNo() { return reversalEntryNo; }
    public void setReversalEntryNo(String reversalEntryNo) { this.reversalEntryNo = reversalEntryNo; }
    public List<SalesReturnItem> getItems() { return items; }
    public void addItem(SalesReturnItem item) { items.add(item); item.setSalesReturn(this); }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDate getAccountingDate() { return accountingDate; }
    public void setAccountingDate(LocalDate accountingDate) { this.accountingDate = accountingDate; }
    public Long getVoucherId() { return voucherId; }
    public void setVoucherId(Long voucherId) { this.voucherId = voucherId; }
    public Long getInvoiceId() { return invoiceId; }
    public void setInvoiceId(Long invoiceId) { this.invoiceId = invoiceId; }
    public BigDecimal getTotalTaxAmount() { return totalTaxAmount; }
    public void setTotalTaxAmount(BigDecimal totalTaxAmount) { this.totalTaxAmount = totalTaxAmount; }
    public String getRefundMethod() { return refundMethod; }
    public void setRefundMethod(String refundMethod) { this.refundMethod = refundMethod; }
}

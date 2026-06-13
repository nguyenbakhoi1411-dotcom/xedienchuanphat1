package com.chuanphat.warranty.core.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "deposits")
public class Deposit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String depositCode; // VD: DC2025-001

    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false)
    private Long branchId;

    private Long productId; // Sản phẩm muốn đặt cọc

    private Long serialId; // Serial cụ thể (nếu chọn xe cụ thể)

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount; // Số tiền cọc

    @Column(nullable = false)
    private LocalDate depositDate = LocalDate.now();

    private LocalDate expiredAt; // Ngày hết hiệu lực đặt cọc

    @Column(length = 30)
    private String paymentMethod; // CASH, BANK_TRANSFER, MOMO, etc.

    @Column(length = 20, nullable = false)
    private String status = "ACTIVE"; // ACTIVE, CONVERTED, REFUNDED, FORFEITED, EXPIRED

    private Long convertedToOrderId; // Đơn hàng được tạo từ cọc này

    private OffsetDateTime convertedAt;

    @Column(length = 120)
    private String convertedBy;

    @Column(length = 120)
    private String refundedBy;

    private OffsetDateTime refundedAt;

    @Column(precision = 14, scale = 2)
    private BigDecimal refundAmount; // Số tiền hoàn cọc

    @Column(length = 500)
    private String note;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(nullable = false, length = 120)
    private String createdBy;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean deleted = false;

    /** Đã ghi kế toán chưa — chống sinh phiếu thu trùng */
    @Column(nullable = false)
    private boolean accountingRecorded = false;

    /** Số bút toán phiếu thu tương ứng */
    @Column(length = 80)
    private String journalEntryNo;

    // Getters and Setters
    public Long getId() { return id; }
    public String getDepositCode() { return depositCode; }
    public void setDepositCode(String depositCode) { this.depositCode = depositCode; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Long getSerialId() { return serialId; }
    public void setSerialId(Long serialId) { this.serialId = serialId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getDepositDate() { return depositDate; }
    public void setDepositDate(LocalDate depositDate) { this.depositDate = depositDate; }
    public LocalDate getExpiredAt() { return expiredAt; }
    public void setExpiredAt(LocalDate expiredAt) { this.expiredAt = expiredAt; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getConvertedToOrderId() { return convertedToOrderId; }
    public void setConvertedToOrderId(Long convertedToOrderId) { this.convertedToOrderId = convertedToOrderId; }
    public OffsetDateTime getConvertedAt() { return convertedAt; }
    public void setConvertedAt(OffsetDateTime convertedAt) { this.convertedAt = convertedAt; }
    public String getConvertedBy() { return convertedBy; }
    public void setConvertedBy(String convertedBy) { this.convertedBy = convertedBy; }
    public String getRefundedBy() { return refundedBy; }
    public void setRefundedBy(String refundedBy) { this.refundedBy = refundedBy; }
    public OffsetDateTime getRefundedAt() { return refundedAt; }
    public void setRefundedAt(OffsetDateTime refundedAt) { this.refundedAt = refundedAt; }
    public BigDecimal getRefundAmount() { return refundAmount; }
    public void setRefundAmount(BigDecimal refundAmount) { this.refundAmount = refundAmount; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }
    public boolean isAccountingRecorded() { return accountingRecorded; }
    public void setAccountingRecorded(boolean accountingRecorded) { this.accountingRecorded = accountingRecorded; }
    public String getJournalEntryNo() { return journalEntryNo; }
    public void setJournalEntryNo(String journalEntryNo) { this.journalEntryNo = journalEntryNo; }
}

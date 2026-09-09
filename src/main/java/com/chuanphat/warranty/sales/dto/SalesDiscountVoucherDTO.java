package com.chuanphat.warranty.sales.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

public class SalesDiscountVoucherDTO {
    private Long id;
    private String voucherNo;
    private LocalDate accountingDate;
    private LocalDate voucherDate;
    private Long customerId;
    private Long salesVoucherId;
    private String description;
    private BigDecimal totalAmount;
    private BigDecimal totalTaxAmount;
    private BigDecimal totalDiscount;
    private Long branchId;
    private OffsetDateTime createdAt;

    private List<SalesDiscountVoucherItemDTO> items = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getVoucherNo() { return voucherNo; }
    public void setVoucherNo(String voucherNo) { this.voucherNo = voucherNo; }
    public LocalDate getAccountingDate() { return accountingDate; }
    public void setAccountingDate(LocalDate accountingDate) { this.accountingDate = accountingDate; }
    public LocalDate getVoucherDate() { return voucherDate; }
    public void setVoucherDate(LocalDate voucherDate) { this.voucherDate = voucherDate; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public Long getSalesVoucherId() { return salesVoucherId; }
    public void setSalesVoucherId(Long salesVoucherId) { this.salesVoucherId = salesVoucherId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getTotalTaxAmount() { return totalTaxAmount; }
    public void setTotalTaxAmount(BigDecimal totalTaxAmount) { this.totalTaxAmount = totalTaxAmount; }
    public BigDecimal getTotalDiscount() { return totalDiscount; }
    public void setTotalDiscount(BigDecimal totalDiscount) { this.totalDiscount = totalDiscount; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public List<SalesDiscountVoucherItemDTO> getItems() { return items; }
    public void setItems(List<SalesDiscountVoucherItemDTO> items) { this.items = items; }
}

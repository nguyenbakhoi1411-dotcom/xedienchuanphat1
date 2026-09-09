package com.chuanphat.warranty.sales.dto;

import java.math.BigDecimal;

public class SalesDiscountVoucherItemDTO {
    private Long id;
    private Long voucherId;
    private Long productId;
    private String unit;
    private String discountAccount;
    private String debtAccount;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal amount;
    private BigDecimal taxRate;
    private BigDecimal taxAmount;
    private String taxAccount;
    private String salesVoucherNo;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getVoucherId() { return voucherId; }
    public void setVoucherId(Long voucherId) { this.voucherId = voucherId; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public String getDiscountAccount() { return discountAccount; }
    public void setDiscountAccount(String discountAccount) { this.discountAccount = discountAccount; }
    public String getDebtAccount() { return debtAccount; }
    public void setDebtAccount(String debtAccount) { this.debtAccount = debtAccount; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public BigDecimal getTaxRate() { return taxRate; }
    public void setTaxRate(BigDecimal taxRate) { this.taxRate = taxRate; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
    public String getTaxAccount() { return taxAccount; }
    public void setTaxAccount(String taxAccount) { this.taxAccount = taxAccount; }
    public String getSalesVoucherNo() { return salesVoucherNo; }
    public void setSalesVoucherNo(String salesVoucherNo) { this.salesVoucherNo = salesVoucherNo; }
}

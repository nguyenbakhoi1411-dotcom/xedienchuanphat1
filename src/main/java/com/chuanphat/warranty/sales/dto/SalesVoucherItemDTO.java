package com.chuanphat.warranty.sales.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class SalesVoucherItemDTO {
    private Long id;
    private Long voucherId;
    private Long productId;
    private Long warehouseId;
    private String unit;
    private String debitAccount;
    private String creditAccount;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal amount;
    private BigDecimal taxRate;
    private BigDecimal taxAmount;
    private String taxAccount;
    private String cogsDebitAccount;
    private String cogsCreditAccount;
    private BigDecimal cogsAmount;
    private Boolean isPromotionalItem;
    private Boolean hasCommercialDiscount;
    private BigDecimal discountRate;
    private BigDecimal discountAmount;
    private String discountAccount;
    private String batchNumber;
    private LocalDate expiryDate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getVoucherId() { return voucherId; }
    public void setVoucherId(Long voucherId) { this.voucherId = voucherId; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public String getDebitAccount() { return debitAccount; }
    public void setDebitAccount(String debitAccount) { this.debitAccount = debitAccount; }
    public String getCreditAccount() { return creditAccount; }
    public void setCreditAccount(String creditAccount) { this.creditAccount = creditAccount; }
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
    public String getCogsDebitAccount() { return cogsDebitAccount; }
    public void setCogsDebitAccount(String cogsDebitAccount) { this.cogsDebitAccount = cogsDebitAccount; }
    public String getCogsCreditAccount() { return cogsCreditAccount; }
    public void setCogsCreditAccount(String cogsCreditAccount) { this.cogsCreditAccount = cogsCreditAccount; }
    public BigDecimal getCogsAmount() { return cogsAmount; }
    public void setCogsAmount(BigDecimal cogsAmount) { this.cogsAmount = cogsAmount; }
    public Boolean getIsPromotionalItem() { return isPromotionalItem; }
    public void setIsPromotionalItem(Boolean isPromotionalItem) { this.isPromotionalItem = isPromotionalItem; }
    public Boolean getHasCommercialDiscount() { return hasCommercialDiscount; }
    public void setHasCommercialDiscount(Boolean hasCommercialDiscount) { this.hasCommercialDiscount = hasCommercialDiscount; }
    public BigDecimal getDiscountRate() { return discountRate; }
    public void setDiscountRate(BigDecimal discountRate) { this.discountRate = discountRate; }
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    public String getDiscountAccount() { return discountAccount; }
    public void setDiscountAccount(String discountAccount) { this.discountAccount = discountAccount; }
    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
}

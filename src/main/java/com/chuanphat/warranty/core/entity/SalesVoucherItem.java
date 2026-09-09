package com.chuanphat.warranty.core.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "sales_voucher_items")
public class SalesVoucherItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id", nullable = false)
    private SalesVoucher voucher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @Column(name = "unit", length = 50)
    private String unit;

    @Column(name = "debit_account", length = 20)
    private String debitAccount; // 131, 1111, 1121

    @Column(name = "credit_account", length = 20)
    private String creditAccount; // 5111

    @Column(name = "quantity", precision = 18, scale = 4)
    private BigDecimal quantity = BigDecimal.ZERO;

    @Column(name = "unit_price", precision = 18, scale = 2)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(name = "amount", precision = 18, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(precision = 18, scale = 2)
    private BigDecimal unitPriceAfterTax = BigDecimal.ZERO;

    @Column(length = 30)
    private String salesVoucherRefNo;

    @Column(name = "tax_rate", precision = 5, scale = 2)
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 18, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "tax_account", length = 20)
    private String taxAccount; // 33311

    // For COGS (Giá vốn)
    @Column(name = "cogs_debit_account", length = 20)
    private String cogsDebitAccount; // 632

    @Column(name = "cogs_credit_account", length = 20)
    private String cogsCreditAccount; // 1561

    @Column(name = "cogs_amount", precision = 18, scale = 2)
    private BigDecimal cogsAmount = BigDecimal.ZERO;

    @Column(name = "is_promotional_item")
    private Boolean isPromotionalItem = false;

    @Column(name = "has_commercial_discount")
    private Boolean hasCommercialDiscount = false;

    @Column(name = "discount_rate", precision = 5, scale = 2)
    private BigDecimal discountRate = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 18, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "discount_account", length = 20)
    private String discountAccount; // 521

    @Column(name = "batch_number", length = 50)
    private String batchNumber; // Số lô

    @Column(name = "expiry_date")
    private java.time.LocalDate expiryDate; // Hạn sử dụng

    @Column(name = "specification", length = 200)
    private String specification;

    @Column(name = "license_plate", length = 50)
    private String licensePlate;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public SalesVoucher getVoucher() { return voucher; }
    public void setVoucher(SalesVoucher voucher) { this.voucher = voucher; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }
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
    public java.time.LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(java.time.LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getSpecification() { return specification; }
    public void setSpecification(String specification) { this.specification = specification; }
    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }

    public BigDecimal getUnitPriceAfterTax() { return unitPriceAfterTax; }
    public void setUnitPriceAfterTax(BigDecimal unitPriceAfterTax) { this.unitPriceAfterTax = unitPriceAfterTax; }
    public String getSalesVoucherRefNo() { return salesVoucherRefNo; }
    public void setSalesVoucherRefNo(String salesVoucherRefNo) { this.salesVoucherRefNo = salesVoucherRefNo; }
}

package com.chuanphat.warranty.core.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "sales_discount_voucher_items")
public class SalesDiscountVoucherItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id", nullable = false)
    private SalesDiscountVoucher voucher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "unit", length = 50)
    private String unit;

    @Column(name = "discount_account", length = 20)
    private String discountAccount; // 51114 / 521

    @Column(name = "debt_account", length = 20)
    private String debtAccount; // 131

    @Column(name = "quantity", precision = 18, scale = 4)
    private BigDecimal quantity = BigDecimal.ZERO;

    @Column(name = "unit_price", precision = 18, scale = 2)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(name = "amount", precision = 18, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "tax_rate", precision = 5, scale = 2)
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 18, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "tax_account", length = 20)
    private String taxAccount; // 33311

    @Column(name = "sales_voucher_no", length = 50)
    private String salesVoucherNo; // Số CT bán hàng

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public SalesDiscountVoucher getVoucher() { return voucher; }
    public void setVoucher(SalesDiscountVoucher voucher) { this.voucher = voucher; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
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

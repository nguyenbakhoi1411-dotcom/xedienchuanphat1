package com.chuanphat.warranty.core.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "sales_discount_lines")
public class SalesDiscountLine {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discount_id", nullable = false)
    private SalesDiscount discount;
    @Column(nullable = false)
    private Integer lineNo = 1;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;
    @Column(length = 50)
    private String productCode;
    @Column(nullable = false, length = 300)
    private String productName;
    @Column(length = 20)
    private String discountAccount = "511";
    @Column(length = 20)
    private String arAccount = "131";
    @Column(length = 30)
    private String unit;
    @Column(nullable = false, precision = 18, scale = 3)
    private BigDecimal quantity = BigDecimal.ONE;
    @Column(precision = 18, scale = 2)
    private BigDecimal unitPriceAfterTax = BigDecimal.ZERO;
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal unitPrice = BigDecimal.ZERO;
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal totalPrice = BigDecimal.ZERO;
    @Column(precision = 5, scale = 2)
    private BigDecimal vatRate = BigDecimal.ZERO;
    @Column(precision = 18, scale = 2)
    private BigDecimal vatAmount = BigDecimal.ZERO;
    @Column(length = 20)
    private String vatAccount;
    @Column(length = 30)
    private String originalVoucherNo;
    
    public Long getId() { return id; }
    public SalesDiscount getDiscount() { return discount; }
    public void setDiscount(SalesDiscount discount) { this.discount = discount; }
    public Integer getLineNo() { return lineNo; }
    public void setLineNo(Integer lineNo) { this.lineNo = lineNo; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getDiscountAccount() { return discountAccount; }
    public void setDiscountAccount(String discountAccount) { this.discountAccount = discountAccount; }
    public String getArAccount() { return arAccount; }
    public void setArAccount(String arAccount) { this.arAccount = arAccount; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPriceAfterTax() { return unitPriceAfterTax; }
    public void setUnitPriceAfterTax(BigDecimal unitPriceAfterTax) { this.unitPriceAfterTax = unitPriceAfterTax; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    public BigDecimal getVatRate() { return vatRate; }
    public void setVatRate(BigDecimal vatRate) { this.vatRate = vatRate; }
    public BigDecimal getVatAmount() { return vatAmount; }
    public void setVatAmount(BigDecimal vatAmount) { this.vatAmount = vatAmount; }
    public String getVatAccount() { return vatAccount; }
    public void setVatAccount(String vatAccount) { this.vatAccount = vatAccount; }
    public String getOriginalVoucherNo() { return originalVoucherNo; }
    public void setOriginalVoucherNo(String originalVoucherNo) { this.originalVoucherNo = originalVoucherNo; }
}

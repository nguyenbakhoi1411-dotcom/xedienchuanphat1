package com.chuanphat.warranty.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "quotation_items")
public class QuotationItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quotation_id", nullable = false)
    private Quotation quotation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serial_id")
    private ProductSerial serial;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal lineTotal;

    @Column(precision = 5, scale = 2)
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    private int itemOrder = 1;

    @Column(length = 50)
    private String productCode;

    @Column(length = 500)
    private String productName;

    @Column(length = 50)
    private String unit;

    @Column(precision = 14, scale = 2)
    private BigDecimal unitPriceAfterTax = BigDecimal.ZERO;

    private int warrantyPeriodMonths = 0;

    @Column(length = 100)
    private String organizationUnit;

    public Long getId() { return id; }
    public Quotation getQuotation() { return quotation; }
    public void setQuotation(Quotation quotation) { this.quotation = quotation; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public ProductSerial getSerial() { return serial; }
    public void setSerial(ProductSerial serial) { this.serial = serial; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getLineTotal() { return lineTotal; }
    public void setLineTotal(BigDecimal lineTotal) { this.lineTotal = lineTotal; }
    public BigDecimal getTaxRate() { return taxRate; }
    public void setTaxRate(BigDecimal taxRate) { this.taxRate = taxRate; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    public int getItemOrder() { return itemOrder; }
    public void setItemOrder(int itemOrder) { this.itemOrder = itemOrder; }
    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public BigDecimal getUnitPriceAfterTax() { return unitPriceAfterTax; }
    public void setUnitPriceAfterTax(BigDecimal unitPriceAfterTax) { this.unitPriceAfterTax = unitPriceAfterTax; }
    public int getWarrantyPeriodMonths() { return warrantyPeriodMonths; }
    public void setWarrantyPeriodMonths(int warrantyPeriodMonths) { this.warrantyPeriodMonths = warrantyPeriodMonths; }
    public String getOrganizationUnit() { return organizationUnit; }
    public void setOrganizationUnit(String organizationUnit) { this.organizationUnit = organizationUnit; }
}

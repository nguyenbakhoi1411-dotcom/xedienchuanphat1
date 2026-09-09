package com.chuanphat.warranty.core.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tax_invoice_lines")
public class TaxInvoiceLine {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private TaxInvoice invoice;
    @Column(nullable = false)
    private Integer lineNo = 1;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;
    @Column(length = 50)
    private String productCode;
    @Column(nullable = false, length = 300)
    private String productName;
    @Column(length = 30)
    private String unit;
    @Column(nullable = false, precision = 18, scale = 3)
    private BigDecimal quantity = BigDecimal.ONE;
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal unitPrice = BigDecimal.ZERO;
    @Column
    private Boolean commercialDiscount = false;
    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal totalPrice = BigDecimal.ZERO;
    @Column(precision = 5, scale = 2)
    private BigDecimal vatRate = BigDecimal.TEN;
    @Column(precision = 18, scale = 2)
    private BigDecimal vatAmount = BigDecimal.ZERO;
    @Column
    private LocalDate expiryDate;
    @Column(length = 100)
    private String serialNo;
    @Column(length = 300)
    private String note;
    
    public Long getId() { return id; }
    public TaxInvoice getInvoice() { return invoice; }
    public void setInvoice(TaxInvoice invoice) { this.invoice = invoice; }
    public Integer getLineNo() { return lineNo; }
    public void setLineNo(Integer lineNo) { this.lineNo = lineNo; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public Boolean getCommercialDiscount() { return commercialDiscount; }
    public void setCommercialDiscount(Boolean commercialDiscount) { this.commercialDiscount = commercialDiscount; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    public BigDecimal getVatRate() { return vatRate; }
    public void setVatRate(BigDecimal vatRate) { this.vatRate = vatRate; }
    public BigDecimal getVatAmount() { return vatAmount; }
    public void setVatAmount(BigDecimal vatAmount) { this.vatAmount = vatAmount; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
    public String getSerialNo() { return serialNo; }
    public void setSerialNo(String serialNo) { this.serialNo = serialNo; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}

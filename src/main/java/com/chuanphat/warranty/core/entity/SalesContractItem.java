package com.chuanphat.warranty.core.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "sales_contract_items")
public class SalesContractItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private SalesContract contract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "unit", length = 50)
    private String unit;

    @Column(name = "required_quantity", precision = 18, scale = 4)
    private BigDecimal requiredQuantity = BigDecimal.ZERO;

    @Column(name = "delivered_quantity", precision = 18, scale = 4)
    private BigDecimal deliveredQuantity = BigDecimal.ZERO;

    @Column(name = "unit_price", precision = 18, scale = 2)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(name = "amount", precision = 18, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "discount_rate", precision = 5, scale = 2)
    private BigDecimal discountRate = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 18, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "tax_rate", precision = 5, scale = 2)
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 18, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "note", length = 500)
    private String note;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public SalesContract getContract() { return contract; }
    public void setContract(SalesContract contract) { this.contract = contract; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public BigDecimal getRequiredQuantity() { return requiredQuantity; }
    public void setRequiredQuantity(BigDecimal requiredQuantity) { this.requiredQuantity = requiredQuantity; }
    public BigDecimal getDeliveredQuantity() { return deliveredQuantity; }
    public void setDeliveredQuantity(BigDecimal deliveredQuantity) { this.deliveredQuantity = deliveredQuantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public BigDecimal getDiscountRate() { return discountRate; }
    public void setDiscountRate(BigDecimal discountRate) { this.discountRate = discountRate; }
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    public BigDecimal getTaxRate() { return taxRate; }
    public void setTaxRate(BigDecimal taxRate) { this.taxRate = taxRate; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
    public BigDecimal getQuantity() { return requiredQuantity; }
    public void setQuantity(BigDecimal quantity) { this.requiredQuantity = quantity; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}

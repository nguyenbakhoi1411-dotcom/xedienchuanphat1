package com.chuanphat.warranty.core.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "unit_conversions", uniqueConstraints = {
    @UniqueConstraint(name = "uq_product_larger_unit", columnNames = {"product_id", "larger_unit"})
})
public class UnitConversion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "larger_unit", nullable = false, length = 50)
    private String largerUnit; // e.g. "Thùng"

    @Column(name = "base_unit", nullable = false, length = 50)
    private String baseUnit; // e.g. "Hộp"

    @Column(name = "conversion_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal conversionRate; // e.g. 24.00

    public Long getId() { return id; }
    
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    
    public String getLargerUnit() { return largerUnit; }
    public void setLargerUnit(String largerUnit) { this.largerUnit = largerUnit; }
    
    public String getBaseUnit() { return baseUnit; }
    public void setBaseUnit(String baseUnit) { this.baseUnit = baseUnit; }
    
    public BigDecimal getConversionRate() { return conversionRate; }
    public void setConversionRate(BigDecimal conversionRate) { this.conversionRate = conversionRate; }
}

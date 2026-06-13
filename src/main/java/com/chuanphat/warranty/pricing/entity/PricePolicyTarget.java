package com.chuanphat.warranty.pricing.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "price_policy_targets")
public class PricePolicyTarget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    @JoinColumn(name = "price_policy_id", nullable = false)
    private PricePolicy pricePolicy;
    private Long branchId;
    private Long productId;
    private Long categoryId;
    private Long brandId;
    @Column(length = 60)
    private String categoryCode;
    @Column(length = 80)
    private String brand;

    public Long getId() { return id; }
    public PricePolicy getPricePolicy() { return pricePolicy; }
    public void setPricePolicy(PricePolicy pricePolicy) { this.pricePolicy = pricePolicy; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public Long getBrandId() { return brandId; }
    public void setBrandId(Long brandId) { this.brandId = brandId; }
    public String getCategoryCode() { return categoryCode; }
    public void setCategoryCode(String categoryCode) { this.categoryCode = categoryCode; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
}

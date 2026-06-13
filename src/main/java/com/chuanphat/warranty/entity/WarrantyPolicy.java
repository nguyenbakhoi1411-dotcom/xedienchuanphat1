package com.chuanphat.warranty.entity;

import com.chuanphat.warranty.core.enums.ProductCategory;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "warranty_policies")
public class WarrantyPolicy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 160)
    private String policyName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ProductCategory productCategory;

    @Column(nullable = false)
    private int warrantyMonths;

    @Column(nullable = false)
    private int batteryWarrantyMonths;

    @Column(nullable = false)
    private int motorWarrantyMonths;

    @Column(length = 1000)
    private String includedParts;

    @Column(length = 1000)
    private String excludedCases;

    @Column(length = 500)
    private String laborFeePolicy;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Long getId() { return id; }
    public String getPolicyName() { return policyName; }
    public void setPolicyName(String policyName) { this.policyName = policyName; }
    public ProductCategory getProductCategory() { return productCategory; }
    public void setProductCategory(ProductCategory productCategory) { this.productCategory = productCategory; }
    public int getWarrantyMonths() { return warrantyMonths; }
    public void setWarrantyMonths(int warrantyMonths) { this.warrantyMonths = warrantyMonths; }
    public int getBatteryWarrantyMonths() { return batteryWarrantyMonths; }
    public void setBatteryWarrantyMonths(int batteryWarrantyMonths) { this.batteryWarrantyMonths = batteryWarrantyMonths; }
    public int getMotorWarrantyMonths() { return motorWarrantyMonths; }
    public void setMotorWarrantyMonths(int motorWarrantyMonths) { this.motorWarrantyMonths = motorWarrantyMonths; }
    public String getIncludedParts() { return includedParts; }
    public void setIncludedParts(String includedParts) { this.includedParts = includedParts; }
    public String getExcludedCases() { return excludedCases; }
    public void setExcludedCases(String excludedCases) { this.excludedCases = excludedCases; }
    public String getLaborFeePolicy() { return laborFeePolicy; }
    public void setLaborFeePolicy(String laborFeePolicy) { this.laborFeePolicy = laborFeePolicy; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}

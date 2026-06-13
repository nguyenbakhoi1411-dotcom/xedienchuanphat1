package com.chuanphat.warranty.hr.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "commission_rules")
public class CommissionRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 100)
    private String name;
    private Long positionId;
    private String productCategory;
    @Column(nullable = false, length = 20)
    private String commissionType = "PERCENT";
    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal commissionValue = BigDecimal.ZERO;
    @Column(precision = 14, scale = 2)
    private BigDecimal minRevenue;
    @Column(nullable = false)
    private boolean active = true;
    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getPositionId() { return positionId; }
    public void setPositionId(Long positionId) { this.positionId = positionId; }
    public String getProductCategory() { return productCategory; }
    public void setProductCategory(String productCategory) { this.productCategory = productCategory; }
    public String getCommissionType() { return commissionType; }
    public void setCommissionType(String commissionType) { this.commissionType = commissionType; }
    public BigDecimal getCommissionValue() { return commissionValue; }
    public void setCommissionValue(BigDecimal commissionValue) { this.commissionValue = commissionValue == null ? BigDecimal.ZERO : commissionValue; }
    public BigDecimal getMinRevenue() { return minRevenue; }
    public void setMinRevenue(BigDecimal minRevenue) { this.minRevenue = minRevenue; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}

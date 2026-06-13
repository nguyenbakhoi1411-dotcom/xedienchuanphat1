package com.chuanphat.warranty.marketing.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "vouchers")
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(nullable = false, length = 20)
    private String discountType;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal discountValue;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal minimumOrderAmount = BigDecimal.ZERO;

    private LocalDate startDate;

    private LocalDate endDate;

    @Column(nullable = false)
    private int usageLimit = 0;

    @Column(nullable = false)
    private int usedCount = 0;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(length = 500)
    private String applicableProductIds;

    @Column(length = 500)
    private String applicableBranchIds;

    public Long getId() { return id; }

    public String getCode() { return code; }

    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public String getDiscountType() { return discountType; }

    public void setDiscountType(String discountType) { this.discountType = discountType; }

    public BigDecimal getDiscountValue() { return discountValue; }

    public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }

    public BigDecimal getMinimumOrderAmount() { return minimumOrderAmount; }

    public void setMinimumOrderAmount(BigDecimal minimumOrderAmount) { this.minimumOrderAmount = minimumOrderAmount; }

    public LocalDate getStartDate() { return startDate; }

    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }

    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public int getUsageLimit() { return usageLimit; }

    public void setUsageLimit(int usageLimit) { this.usageLimit = usageLimit; }

    public int getUsedCount() { return usedCount; }

    public void setUsedCount(int usedCount) { this.usedCount = usedCount; }

    public String getStatus() { return status; }

    public void setStatus(String status) { this.status = status; }

    public String getApplicableProductIds() { return applicableProductIds; }

    public void setApplicableProductIds(String applicableProductIds) { this.applicableProductIds = applicableProductIds; }

    public String getApplicableBranchIds() { return applicableBranchIds; }

    public void setApplicableBranchIds(String applicableBranchIds) { this.applicableBranchIds = applicableBranchIds; }
}

package com.chuanphat.warranty.pricing.entity;

import com.chuanphat.warranty.pricing.enums.PriceChangeType;
import com.chuanphat.warranty.pricing.enums.PricePolicyScopeType;
import com.chuanphat.warranty.pricing.enums.PricePolicyStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "price_policies")
public class PricePolicy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 60)
    private String policyCode;
    @Column(nullable = false, length = 160)
    private String policyName;
    @Column(length = 1000)
    private String description;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PricePolicyScopeType scopeType;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PriceChangeType priceChangeType;
    @Column(name = "\"value\"", nullable = false, precision = 14, scale = 2)
    private BigDecimal value = BigDecimal.ZERO;
    @Column(nullable = false)
    private LocalDate startDate;
    @Column(nullable = false)
    private LocalDate endDate;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PricePolicyStatus status = PricePolicyStatus.DRAFT;
    @Column(nullable = false)
    private int priority = 0;
    @Column(nullable = false, length = 120)
    private String createdBy;
    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();
    private String approvedBy;
    private OffsetDateTime approvedAt;
    private String cancelledBy;
    private OffsetDateTime cancelledAt;
    @Column(length = 1000)
    private String note;
    @OneToMany(mappedBy = "pricePolicy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PricePolicyTarget> targets = new ArrayList<>();

    public void addTarget(PricePolicyTarget target) { targets.add(target); target.setPricePolicy(this); }
    public Long getId() { return id; }
    public String getPolicyCode() { return policyCode; }
    public void setPolicyCode(String policyCode) { this.policyCode = policyCode; }
    public String getPolicyName() { return policyName; }
    public void setPolicyName(String policyName) { this.policyName = policyName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public PricePolicyScopeType getScopeType() { return scopeType; }
    public void setScopeType(PricePolicyScopeType scopeType) { this.scopeType = scopeType; }
    public PriceChangeType getPriceChangeType() { return priceChangeType; }
    public void setPriceChangeType(PriceChangeType priceChangeType) { this.priceChangeType = priceChangeType; }
    public BigDecimal getValue() { return value; }
    public void setValue(BigDecimal value) { this.value = value == null ? BigDecimal.ZERO : value; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public PricePolicyStatus getStatus() { return status; }
    public void setStatus(PricePolicyStatus status) { this.status = status; }
    public int getPriority() { return priority; }
    public void setPriority(int priority) { this.priority = priority; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    public OffsetDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(OffsetDateTime approvedAt) { this.approvedAt = approvedAt; }
    public String getCancelledBy() { return cancelledBy; }
    public void setCancelledBy(String cancelledBy) { this.cancelledBy = cancelledBy; }
    public OffsetDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(OffsetDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public List<PricePolicyTarget> getTargets() { return targets; }
}

package com.chuanphat.warranty.crm.entity;

import com.chuanphat.warranty.crm.enums.OpportunityStage;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "crm_opportunities")
public class SalesOpportunity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long customerId;

    private Long leadId;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal expectedValue = BigDecimal.ZERO;

    private LocalDate expectedCloseDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OpportunityStage stage = OpportunityStage.NEW;

    @Column(nullable = false)
    private int probability = 10;

    private Long assignedTo;

    /** Liên kết báo giá tạo từ cơ hội này */
    private Long quotationId;

    /** Liên kết đơn hàng khi cơ hội được chốt */
    private Long salesOrderId;

    /** Thời điểm chốt đơn */
    private OffsetDateTime convertedAt;

    /** Nhân viên chốt đơn */
    @Column(length = 120)
    private String convertedBy;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public Long getId() { return id; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; touch(); }
    public Long getLeadId() { return leadId; }
    public void setLeadId(Long leadId) { this.leadId = leadId; touch(); }
    public BigDecimal getExpectedValue() { return expectedValue; }
    public void setExpectedValue(BigDecimal expectedValue) { this.expectedValue = expectedValue; touch(); }
    public LocalDate getExpectedCloseDate() { return expectedCloseDate; }
    public void setExpectedCloseDate(LocalDate expectedCloseDate) { this.expectedCloseDate = expectedCloseDate; touch(); }
    public OpportunityStage getStage() { return stage; }
    public void setStage(OpportunityStage stage) { this.stage = stage; touch(); }
    public int getProbability() { return probability; }
    public void setProbability(int probability) { this.probability = probability; touch(); }
    public Long getAssignedTo() { return assignedTo; }
    public void setAssignedTo(Long assignedTo) { this.assignedTo = assignedTo; touch(); }
    public Long getQuotationId() { return quotationId; }
    public void setQuotationId(Long quotationId) { this.quotationId = quotationId; touch(); }
    public Long getSalesOrderId() { return salesOrderId; }
    public void setSalesOrderId(Long salesOrderId) { this.salesOrderId = salesOrderId; touch(); }
    public OffsetDateTime getConvertedAt() { return convertedAt; }
    public void setConvertedAt(OffsetDateTime convertedAt) { this.convertedAt = convertedAt; touch(); }
    public String getConvertedBy() { return convertedBy; }
    public void setConvertedBy(String convertedBy) { this.convertedBy = convertedBy; touch(); }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    private void touch() { this.updatedAt = OffsetDateTime.now(); }
}

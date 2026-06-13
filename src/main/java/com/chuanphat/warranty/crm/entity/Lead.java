package com.chuanphat.warranty.crm.entity;

import com.chuanphat.warranty.crm.enums.LeadSource;
import com.chuanphat.warranty.crm.enums.LeadStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "crm_leads")
public class Lead {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 160)
    private String leadName;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(length = 120)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private LeadSource source;

    @Column(length = 180)
    private String interestedProduct;

    private Long assignedTo;

    private Long branchId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private LeadStatus status = LeadStatus.NEW;

    @Column(length = 300)
    private String lostReason;

    @Column(length = 1000)
    private String note;

    /** Ngày cần follow-up tiếp theo */
    private LocalDate nextFollowUpDate;

    /** Giá trị kỳ vọng (cho pipeline) */
    @Column(precision = 14, scale = 2)
    private BigDecimal expectedValue;

    private Long convertedCustomerId;
    private OffsetDateTime convertedAt;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    private OffsetDateTime updatedAt = OffsetDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public String getLeadName() { return leadName; }
    public void setLeadName(String leadName) { this.leadName = leadName; touch(); }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; touch(); }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; touch(); }
    public LeadSource getSource() { return source; }
    public void setSource(LeadSource source) { this.source = source; touch(); }
    public String getInterestedProduct() { return interestedProduct; }
    public void setInterestedProduct(String interestedProduct) { this.interestedProduct = interestedProduct; touch(); }
    public Long getAssignedTo() { return assignedTo; }
    public void setAssignedTo(Long assignedTo) { this.assignedTo = assignedTo; touch(); }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; touch(); }
    public LeadStatus getStatus() { return status; }
    public void setStatus(LeadStatus status) { this.status = status; touch(); }
    public String getLostReason() { return lostReason; }
    public void setLostReason(String lostReason) { this.lostReason = lostReason; touch(); }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; touch(); }
    public LocalDate getNextFollowUpDate() { return nextFollowUpDate; }
    public void setNextFollowUpDate(LocalDate nextFollowUpDate) { this.nextFollowUpDate = nextFollowUpDate; touch(); }
    public BigDecimal getExpectedValue() { return expectedValue; }
    public void setExpectedValue(BigDecimal expectedValue) { this.expectedValue = expectedValue; touch(); }
    public Long getConvertedCustomerId() { return convertedCustomerId; }
    public void setConvertedCustomerId(Long convertedCustomerId) { this.convertedCustomerId = convertedCustomerId; touch(); }
    public OffsetDateTime getConvertedAt() { return convertedAt; }
    public void setConvertedAt(OffsetDateTime convertedAt) { this.convertedAt = convertedAt; touch(); }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    private void touch() { this.updatedAt = OffsetDateTime.now(); }
}

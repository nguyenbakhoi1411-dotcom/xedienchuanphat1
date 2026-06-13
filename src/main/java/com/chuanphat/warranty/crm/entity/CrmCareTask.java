package com.chuanphat.warranty.crm.entity;

import com.chuanphat.warranty.crm.enums.CrmTaskStatus;
import com.chuanphat.warranty.crm.enums.CrmTaskType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "crm_care_tasks")
public class CrmCareTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long customerId;

    private Long leadId;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(length = 1000)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CrmTaskType type = CrmTaskType.CARE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CrmTaskStatus status = CrmTaskStatus.TODO;

    private LocalDate dueDate;

    private Long assignedTo;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    private OffsetDateTime completedAt;

    public Long getId() { return id; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public Long getLeadId() { return leadId; }
    public void setLeadId(Long leadId) { this.leadId = leadId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public CrmTaskType getType() { return type; }
    public void setType(CrmTaskType type) { this.type = type; }
    public CrmTaskStatus getStatus() { return status; }
    public void setStatus(CrmTaskStatus status) {
        this.status = status;
        this.completedAt = status == CrmTaskStatus.DONE ? OffsetDateTime.now() : null;
    }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public Long getAssignedTo() { return assignedTo; }
    public void setAssignedTo(Long assignedTo) { this.assignedTo = assignedTo; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getCompletedAt() { return completedAt; }
}

package com.chuanphat.warranty.core.entity;

import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.core.enums.PurchaseRequestPriority;
import com.chuanphat.warranty.core.enums.PurchaseRequestStatus;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_requests")
public class PurchaseRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pr_no", nullable = false, unique = true, length = 30)
    private String prNo;

    @Column(name = "pr_date", nullable = false)
    private LocalDate prDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by")
    private AppUser requestedBy;

    @Column(length = 100)
    private String department;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PurchaseRequestPriority priority = PurchaseRequestPriority.NORMAL;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "expected_date")
    private LocalDate expectedDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PurchaseRequestStatus status = PurchaseRequestStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private AppUser approvedBy;

    @Column(name = "approved_at")
    private OffsetDateTime approvedAt;

    @Column(name = "rejected_reason", columnDefinition = "TEXT")
    private String rejectedReason;

    @Column(name = "branch_id", nullable = false)
    private Long branchId;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @OneToMany(mappedBy = "purchaseRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseRequestItem> items = new ArrayList<>();

    // Helper method
    public void addItem(PurchaseRequestItem item) {
        items.add(item);
        item.setPurchaseRequest(this);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPrNo() { return prNo; }
    public void setPrNo(String prNo) { this.prNo = prNo; }
    public LocalDate getPrDate() { return prDate; }
    public void setPrDate(LocalDate prDate) { this.prDate = prDate; }
    public AppUser getRequestedBy() { return requestedBy; }
    public void setRequestedBy(AppUser requestedBy) { this.requestedBy = requestedBy; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public PurchaseRequestPriority getPriority() { return priority; }
    public void setPriority(PurchaseRequestPriority priority) { this.priority = priority; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDate getExpectedDate() { return expectedDate; }
    public void setExpectedDate(LocalDate expectedDate) { this.expectedDate = expectedDate; }
    public PurchaseRequestStatus getStatus() { return status; }
    public void setStatus(PurchaseRequestStatus status) { this.status = status; }
    public AppUser getApprovedBy() { return approvedBy; }
    public void setApprovedBy(AppUser approvedBy) { this.approvedBy = approvedBy; }
    public OffsetDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(OffsetDateTime approvedAt) { this.approvedAt = approvedAt; }
    public String getRejectedReason() { return rejectedReason; }
    public void setRejectedReason(String rejectedReason) { this.rejectedReason = rejectedReason; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public List<PurchaseRequestItem> getItems() { return items; }
    public void setItems(List<PurchaseRequestItem> items) { this.items = items; }
}

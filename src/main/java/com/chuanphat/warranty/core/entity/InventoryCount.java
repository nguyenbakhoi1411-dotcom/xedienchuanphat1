package com.chuanphat.warranty.core.entity;

import com.chuanphat.warranty.core.enums.InventoryCountStatus;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Phieu kiem ke ton kho (count sheet).
 *
 * Luong:
 *   DRAFT → COUNTING (snapshot systemQty) → PENDING_APPROVAL → APPROVED → dieu chinh stock
 */
@Entity
@Table(name = "inventory_counts")
public class InventoryCount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String countNo;

    @Column(nullable = false)
    private Long branchId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @Column(nullable = false)
    private LocalDate countDate = LocalDate.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private InventoryCountStatus status = InventoryCountStatus.DRAFT;

    @Column(length = 500)
    private String note;

    @Column(nullable = false, length = 120)
    private String createdBy;

    @Column(length = 120)
    private String approvedBy;

    private OffsetDateTime approvedAt;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @OneToMany(mappedBy = "count", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InventoryCountItem> items = new ArrayList<>();

    public Long getId() { return id; }
    public String getCountNo() { return countNo; }
    public void setCountNo(String countNo) { this.countNo = countNo; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }
    public LocalDate getCountDate() { return countDate; }
    public void setCountDate(LocalDate countDate) { this.countDate = countDate; }
    public InventoryCountStatus getStatus() { return status; }
    public void setStatus(InventoryCountStatus status) { this.status = status; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    public OffsetDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(OffsetDateTime approvedAt) { this.approvedAt = approvedAt; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public List<InventoryCountItem> getItems() { return items; }
    public void addItem(InventoryCountItem item) { items.add(item); item.setCount(this); }
}

package com.chuanphat.warranty.core.entity;

import com.chuanphat.warranty.core.enums.GoodsIssueType;
import com.chuanphat.warranty.core.enums.RecordStatus;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Phieu xuat kho (Goods Issue).
 *
 * Cac loai xuat:
 *   SALE — xuat ban hang (lien ket sales order)
 *   WARRANTY — xuat phu tung bao hanh
 *   SERVICE — xuat phu tung sua chua
 *   TRANSFER — xuat chuyen kho
 *   WRITE_OFF — xuat huy / xoa so
 *   OTHER — xuat khac
 *
 * Luong: DRAFT → ISSUED (giam ton kho) | CANCELLED
 */
@Entity
@Table(name = "goods_issues")
public class GoodsIssue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String issueNo;

    @Column(nullable = false)
    private Long branchId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @Column(nullable = false)
    private LocalDate issueDate = LocalDate.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private GoodsIssueType issueType;

    /** DRAFT, ISSUED, CANCELLED */
    @Column(nullable = false, length = 30)
    private String status = "DRAFT";

    /** Loai chung tu goc (SALES_ORDER, WARRANTY_TICKET, ...) */
    @Column(length = 80)
    private String referenceType;

    /** So chung tu goc */
    @Column(length = 80)
    private String referenceNo;

    @Column(length = 500)
    private String note;

    @Column(nullable = false, length = 120)
    private String createdBy;

    @Column(length = 120)
    private String issuedBy;

    private OffsetDateTime issuedAt;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @OneToMany(mappedBy = "goodsIssue", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GoodsIssueItem> items = new ArrayList<>();

    public Long getId() { return id; }
    public String getIssueNo() { return issueNo; }
    public void setIssueNo(String issueNo) { this.issueNo = issueNo; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    public GoodsIssueType getIssueType() { return issueType; }
    public void setIssueType(GoodsIssueType issueType) { this.issueType = issueType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReferenceType() { return referenceType; }
    public void setReferenceType(String referenceType) { this.referenceType = referenceType; }
    public String getReferenceNo() { return referenceNo; }
    public void setReferenceNo(String referenceNo) { this.referenceNo = referenceNo; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getIssuedBy() { return issuedBy; }
    public void setIssuedBy(String issuedBy) { this.issuedBy = issuedBy; }
    public OffsetDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(OffsetDateTime issuedAt) { this.issuedAt = issuedAt; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public List<GoodsIssueItem> getItems() { return items; }
    public void addItem(GoodsIssueItem item) { items.add(item); item.setGoodsIssue(this); }
}

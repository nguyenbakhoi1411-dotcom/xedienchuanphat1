package com.chuanphat.warranty.core.entity;

import com.chuanphat.warranty.core.enums.SerialStatus;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "product_serial_histories")
public class ProductSerialHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long serialId;

    @Column(nullable = false, length = 80)
    private String action; // IMPORTED, RESERVED, UNRESERVED, SOLD, RETURNED, TRANSFERRED, DEFECTIVE, WARRANTY_ACTIVATED, REPAIRED

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private SerialStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private SerialStatus newStatus;

    @Column(length = 80)
    private String sourceDocumentType; // SALES_ORDER, DEPOSIT, INVENTORY_TRANSFER, SERVICE_TICKET, PURCHASE_RECEIPT

    @Column(length = 100)
    private String sourceDocumentId; // Mã chứng từ nguồn

    private Long branchFromId;
    private Long branchToId;
    private Long warehouseFromId;
    private Long warehouseToId;
    private Long customerId;

    @Column(nullable = false, length = 120)
    private String createdBy;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(length = 500)
    private String note;

    // Getters
    public Long getId() { return id; }
    public Long getSerialId() { return serialId; }
    public void setSerialId(Long serialId) { this.serialId = serialId; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public SerialStatus getOldStatus() { return oldStatus; }
    public void setOldStatus(SerialStatus oldStatus) { this.oldStatus = oldStatus; }
    public SerialStatus getNewStatus() { return newStatus; }
    public void setNewStatus(SerialStatus newStatus) { this.newStatus = newStatus; }
    public String getSourceDocumentType() { return sourceDocumentType; }
    public void setSourceDocumentType(String sourceDocumentType) { this.sourceDocumentType = sourceDocumentType; }
    public String getSourceDocumentId() { return sourceDocumentId; }
    public void setSourceDocumentId(String sourceDocumentId) { this.sourceDocumentId = sourceDocumentId; }
    public Long getBranchFromId() { return branchFromId; }
    public void setBranchFromId(Long branchFromId) { this.branchFromId = branchFromId; }
    public Long getBranchToId() { return branchToId; }
    public void setBranchToId(Long branchToId) { this.branchToId = branchToId; }
    public Long getWarehouseFromId() { return warehouseFromId; }
    public void setWarehouseFromId(Long warehouseFromId) { this.warehouseFromId = warehouseFromId; }
    public Long getWarehouseToId() { return warehouseToId; }
    public void setWarehouseToId(Long warehouseToId) { this.warehouseToId = warehouseToId; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}

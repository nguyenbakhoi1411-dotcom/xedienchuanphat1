package com.chuanphat.warranty.core.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "inventory_adjustments")
public class InventoryAdjustment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String adjustmentNo;

    @Column(nullable = false)
    private LocalDate adjustmentDate = LocalDate.now();

    @Column(nullable = false, length = 30)
    private String status = "DRAFT"; // DRAFT, APPROVED, CANCELLED

    // Tham chiếu ngược giao dịch gốc (nếu có)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_transaction_id")
    private InventoryTransaction originalTransaction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private ProductBatch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serial_id")
    private ProductSerial serial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Column(nullable = false)
    private Long branchId;

    @Column(nullable = false)
    private int oldQuantity;

    @Column(nullable = false)
    private int newQuantity;

    @Column(length = 500)
    private String reason;

    @Column(nullable = false, length = 120)
    private String createdBy;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Long getId() { return id; }
    public String getAdjustmentNo() { return adjustmentNo; }
    public void setAdjustmentNo(String adjustmentNo) { this.adjustmentNo = adjustmentNo; }
    public LocalDate getAdjustmentDate() { return adjustmentDate; }
    public void setAdjustmentDate(LocalDate adjustmentDate) { this.adjustmentDate = adjustmentDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public InventoryTransaction getOriginalTransaction() { return originalTransaction; }
    public void setOriginalTransaction(InventoryTransaction originalTransaction) { this.originalTransaction = originalTransaction; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public ProductBatch getBatch() { return batch; }
    public void setBatch(ProductBatch batch) { this.batch = batch; }
    public ProductSerial getSerial() { return serial; }
    public void setSerial(ProductSerial serial) { this.serial = serial; }
    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public int getOldQuantity() { return oldQuantity; }
    public void setOldQuantity(int oldQuantity) { this.oldQuantity = oldQuantity; }
    public int getNewQuantity() { return newQuantity; }
    public void setNewQuantity(int newQuantity) { this.newQuantity = newQuantity; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}

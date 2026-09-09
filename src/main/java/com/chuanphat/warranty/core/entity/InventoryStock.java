package com.chuanphat.warranty.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.OffsetDateTime;

@Entity
@Table(name = "inventory_stocks", uniqueConstraints = @UniqueConstraint(name = "uq_stock_loc_prod_batch_serial", columnNames = {"branch_id", "warehouse_id", "product_id", "batch_id", "serial_id"}))
public class InventoryStock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "branch_id", nullable = false)
    private Long branchId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private ProductBatch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serial_id")
    private ProductSerial serial;

    @Column(name = "quantity_on_hand", nullable = false)
    private int quantity;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int reservedQuantity;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int availableQuantity;

    @Column(name = "min_quantity", nullable = false)
    private int minStockLevel = 1;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int maxStockLevel;

    @Column(nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public Long getId() { return id; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public ProductBatch getBatch() { return batch; }
    public void setBatch(ProductBatch batch) { this.batch = batch; }
    public ProductSerial getSerial() { return serial; }
    public void setSerial(ProductSerial serial) { this.serial = serial; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; recalculateAvailable(); }
    public int getReservedQuantity() { return reservedQuantity; }
    public void setReservedQuantity(int reservedQuantity) { this.reservedQuantity = reservedQuantity; recalculateAvailable(); }
    public int getAvailableQuantity() { return availableQuantity; }
    public void setAvailableQuantity(int availableQuantity) { this.availableQuantity = availableQuantity; this.updatedAt = OffsetDateTime.now(); }
    public int getMinStockLevel() { return minStockLevel; }
    public void setMinStockLevel(int minStockLevel) { this.minStockLevel = minStockLevel; }
    public int getMaxStockLevel() { return maxStockLevel; }
    public void setMaxStockLevel(int maxStockLevel) { this.maxStockLevel = maxStockLevel; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    public int getQuantityOnHand() { return quantity; }
    public void setQuantityOnHand(int quantityOnHand) { setQuantity(quantityOnHand); }
    public int getMinQuantity() { return minStockLevel; }
    public void setMinQuantity(int minQuantity) { setMinStockLevel(minQuantity); }

    private void recalculateAvailable() {
        this.availableQuantity = this.quantity - this.reservedQuantity;
        this.updatedAt = OffsetDateTime.now();
    }
}

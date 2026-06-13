package com.chuanphat.warranty.core.entity;

import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.core.enums.WarehouseType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.OffsetDateTime;

@Entity
@Table(name = "warehouses", uniqueConstraints = @UniqueConstraint(columnNames = "warehouse_code"))
public class Warehouse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "warehouse_code", nullable = false, length = 50)
    private String warehouseCode;

    @Column(name = "warehouse_name", nullable = false, length = 180)
    private String warehouseName;

    @Column(nullable = false)
    private Long branchId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private WarehouseType type = WarehouseType.MAIN;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RecordStatus status = RecordStatus.ACTIVE;

    @Column(length = 40)
    private String locationAisle; // Day/lo trong kho

    @Column(length = 40)
    private String locationShelf; // Ke/tang

    @Column(length = 40)
    private String locationBin;   // O/vi tri cu the

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Long getId() { return id; }
    public String getWarehouseCode() { return warehouseCode; }
    public void setWarehouseCode(String warehouseCode) { this.warehouseCode = warehouseCode; }
    public String getWarehouseName() { return warehouseName; }
    public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public WarehouseType getType() { return type; }
    public void setType(WarehouseType type) { this.type = type; }
    public RecordStatus getStatus() { return status; }
    public void setStatus(RecordStatus status) { this.status = status; }
    public String getLocationAisle() { return locationAisle; }
    public void setLocationAisle(String locationAisle) { this.locationAisle = locationAisle; }
    public String getLocationShelf() { return locationShelf; }
    public void setLocationShelf(String locationShelf) { this.locationShelf = locationShelf; }
    public String getLocationBin() { return locationBin; }
    public void setLocationBin(String locationBin) { this.locationBin = locationBin; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}

package com.chuanphat.warranty.core.entity;

import com.chuanphat.warranty.core.enums.SerialStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "product_serials", uniqueConstraints = {
    @UniqueConstraint(name = "uq_serial_number", columnNames = {"serial_number"}),
    @UniqueConstraint(name = "uq_frame_number", columnNames = {"frame_number"})
})
public class ProductSerial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, unique = true, length = 80)
    private String serialNumber;

    @Column(nullable = false)
    private Long branchId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    // Thông tin định danh xe
    @Column(length = 80)
    private String frameNumber; // Số khung - UNIQUE

    @Column(length = 80)
    private String engineNumber; // Số máy

    @Column(length = 80)
    private String batterySerial; // Số pin

    @Column(length = 80)
    private String motorSerial; // Số motor

    @Column(length = 80)
    private String chargerNumber; // Số bộ sạc

    // Thông tin xuất xứ
    @Column(length = 50)
    private String color; // Màu sắc

    @Column(length = 50)
    private String version; // Phiên bản/biến thể

    @Column(nullable = false)
    private LocalDate importDate = LocalDate.now();

    private Long supplierId; // Nhà cung cấp nhập xe này

    @Column(precision = 14, scale = 2)
    private BigDecimal purchaseCost; // Giá vốn nhập (đích danh per serial)

    // Trạng thái
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SerialStatus status = SerialStatus.IN_STOCK;

    @Column(length = 80)
    private String reservedOrderNo; // Mã đơn đặt cọc/đơn hàng đang giữ xe

    private Long reservedCustomerId; // Khách hàng đang giữ xe

    private OffsetDateTime reservationUntil; // Hết hạn giữ xe

    // Thông tin sau bán
    private Long currentCustomerId; // Khách hàng hiện tại đang sở hữu xe

    private LocalDate soldDate; // Ngày bán

    // Bảo hành
    private LocalDate warrantyStartDate;
    private LocalDate warrantyEndDate;

    @Column(length = 500)
    private String note;

    // Thong tin sua chua
    @Column(length = 80)
    private String lastServiceTicketNo; // Ma phieu sua chua cuoi

    private LocalDate lastServicedAt;   // Ngay sua chua cuoi

    // Ly do loi (neu DEFECTIVE/DAMAGED)
    @Column(length = 500)
    private String defectReason;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }
    public String getFrameNumber() { return frameNumber; }
    public void setFrameNumber(String frameNumber) { this.frameNumber = frameNumber; }
    public String getEngineNumber() { return engineNumber; }
    public void setEngineNumber(String engineNumber) { this.engineNumber = engineNumber; }
    public String getBatterySerial() { return batterySerial; }
    public void setBatterySerial(String batterySerial) { this.batterySerial = batterySerial; }
    public String getMotorSerial() { return motorSerial; }
    public void setMotorSerial(String motorSerial) { this.motorSerial = motorSerial; }
    public String getChargerNumber() { return chargerNumber; }
    public void setChargerNumber(String chargerNumber) { this.chargerNumber = chargerNumber; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    public LocalDate getImportDate() { return importDate; }
    public void setImportDate(LocalDate importDate) { this.importDate = importDate; }
    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
    public BigDecimal getPurchaseCost() { return purchaseCost; }
    public void setPurchaseCost(BigDecimal purchaseCost) { this.purchaseCost = purchaseCost; }
    public SerialStatus getStatus() { return status; }
    public void setStatus(SerialStatus status) { this.status = status; }
    public String getReservedOrderNo() { return reservedOrderNo; }
    public void setReservedOrderNo(String reservedOrderNo) { this.reservedOrderNo = reservedOrderNo; }
    public Long getReservedCustomerId() { return reservedCustomerId; }
    public void setReservedCustomerId(Long reservedCustomerId) { this.reservedCustomerId = reservedCustomerId; }
    public OffsetDateTime getReservationUntil() { return reservationUntil; }
    public void setReservationUntil(OffsetDateTime reservationUntil) { this.reservationUntil = reservationUntil; }
    public Long getCurrentCustomerId() { return currentCustomerId; }
    public void setCurrentCustomerId(Long currentCustomerId) { this.currentCustomerId = currentCustomerId; }
    public LocalDate getSoldDate() { return soldDate; }
    public void setSoldDate(LocalDate soldDate) { this.soldDate = soldDate; }
    public LocalDate getWarrantyStartDate() { return warrantyStartDate; }
    public void setWarrantyStartDate(LocalDate warrantyStartDate) { this.warrantyStartDate = warrantyStartDate; }
    public LocalDate getWarrantyEndDate() { return warrantyEndDate; }
    public void setWarrantyEndDate(LocalDate warrantyEndDate) { this.warrantyEndDate = warrantyEndDate; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getLastServiceTicketNo() { return lastServiceTicketNo; }
    public void setLastServiceTicketNo(String lastServiceTicketNo) { this.lastServiceTicketNo = lastServiceTicketNo; }
    public LocalDate getLastServicedAt() { return lastServicedAt; }
    public void setLastServicedAt(LocalDate lastServicedAt) { this.lastServicedAt = lastServicedAt; }
    public String getDefectReason() { return defectReason; }
    public void setDefectReason(String defectReason) { this.defectReason = defectReason; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}

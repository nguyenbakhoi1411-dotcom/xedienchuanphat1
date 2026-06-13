package com.chuanphat.warranty.entity;

import com.chuanphat.warranty.enums.WarrantyStatus;
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
@Table(name = "warranties")
public class Warranty {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String serialNumber;

    @Column(nullable = false)
    private Long vehicleId;

    private Long policyId;

    private Long customerId;

    @Column(nullable = false, length = 120)
    private String customerName;

    @Column(length = 80)
    private String invoiceNo;

    @Column(nullable = false)
    private LocalDate purchaseDate;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    private LocalDate batteryEndDate;

    private LocalDate motorEndDate;

    private LocalDate chargerEndDate;

    @Column(length = 1000)
    private String mainPartsWarranty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WarrantyStatus status = WarrantyStatus.ACTIVE;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Long getId() {
        return id;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public Long getPolicyId() { return policyId; }

    public void setPolicyId(Long policyId) { this.policyId = policyId; }

    public Long getCustomerId() { return customerId; }

    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getInvoiceNo() { return invoiceNo; }

    public void setInvoiceNo(String invoiceNo) { this.invoiceNo = invoiceNo; }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public LocalDate getBatteryEndDate() { return batteryEndDate; }

    public void setBatteryEndDate(LocalDate batteryEndDate) { this.batteryEndDate = batteryEndDate; }

    public LocalDate getMotorEndDate() { return motorEndDate; }

    public void setMotorEndDate(LocalDate motorEndDate) { this.motorEndDate = motorEndDate; }

    public LocalDate getChargerEndDate() { return chargerEndDate; }

    public void setChargerEndDate(LocalDate chargerEndDate) { this.chargerEndDate = chargerEndDate; }

    public String getMainPartsWarranty() { return mainPartsWarranty; }

    public void setMainPartsWarranty(String mainPartsWarranty) { this.mainPartsWarranty = mainPartsWarranty; }

    public WarrantyStatus getStatus() {
        return status;
    }

    public void setStatus(WarrantyStatus status) {
        this.status = status;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}

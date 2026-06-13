package com.chuanphat.warranty.entity;

import com.chuanphat.warranty.enums.ComponentType;
import com.chuanphat.warranty.enums.ServiceType;
import com.chuanphat.warranty.enums.ServiceTicketStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "service_tickets")
public class ServiceTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long vehicleId;

    private Long branchId;

    @Column(nullable = false, length = 80)
    private String serialNumber;

    @Column(nullable = false, length = 120)
    private String customerName;

    private Long customerId;

    @Column(length = 30)
    private String customerPhone;

    @Column(nullable = false, length = 500)
    private String issueDescription;

    @Column(length = 1000)
    private String customerReportedIssue;

    private LocalDate receivedDate;

    private LocalDate expectedReturnDate;

    private LocalDate actualReturnDate;

    @Column(length = 1000)
    private String beforeRepairImages;

    @Column(length = 1000)
    private String faultImages;

    @Column(length = 1000)
    private String afterRepairImages;

    @Column(length = 1000)
    private String documentFiles;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ServiceType serviceType = ServiceType.WARRANTY;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ServiceTicketStatus status = ServiceTicketStatus.CREATED;

    @Column(length = 80)
    private String technicianUsername;

    @Column(length = 1000)
    private String diagnosisNote;

    @Column(length = 1000)
    private String predictedCause;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ComponentType componentType;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean warrantyRepair = true;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal laborCost = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal partsCost = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal warrantyCost = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal customerPayAmount = BigDecimal.ZERO;

    private OffsetDateTime approvedAt;

    private OffsetDateTime returnedAt;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalCost = BigDecimal.ZERO;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ServiceTicketItem> items = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public Long getBranchId() { return branchId; }

    public void setBranchId(Long branchId) { this.branchId = branchId; }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public Long getCustomerId() { return customerId; }

    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerPhone() { return customerPhone; }

    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getIssueDescription() {
        return issueDescription;
    }

    public void setIssueDescription(String issueDescription) {
        this.issueDescription = issueDescription;
    }

    public String getCustomerReportedIssue() { return customerReportedIssue; }

    public void setCustomerReportedIssue(String customerReportedIssue) { this.customerReportedIssue = customerReportedIssue; }

    public LocalDate getReceivedDate() { return receivedDate; }

    public void setReceivedDate(LocalDate receivedDate) { this.receivedDate = receivedDate; }

    public LocalDate getExpectedReturnDate() { return expectedReturnDate; }

    public void setExpectedReturnDate(LocalDate expectedReturnDate) { this.expectedReturnDate = expectedReturnDate; }

    public LocalDate getActualReturnDate() { return actualReturnDate; }

    public void setActualReturnDate(LocalDate actualReturnDate) { this.actualReturnDate = actualReturnDate; }

    public String getBeforeRepairImages() { return beforeRepairImages; }

    public void setBeforeRepairImages(String beforeRepairImages) { this.beforeRepairImages = beforeRepairImages; }

    public String getFaultImages() { return faultImages; }

    public void setFaultImages(String faultImages) { this.faultImages = faultImages; }

    public String getAfterRepairImages() { return afterRepairImages; }

    public void setAfterRepairImages(String afterRepairImages) { this.afterRepairImages = afterRepairImages; }

    public String getDocumentFiles() { return documentFiles; }

    public void setDocumentFiles(String documentFiles) { this.documentFiles = documentFiles; }

    public ServiceType getServiceType() { return serviceType; }

    public void setServiceType(ServiceType serviceType) { this.serviceType = serviceType == null ? ServiceType.WARRANTY : serviceType; }

    public ServiceTicketStatus getStatus() {
        return status;
    }

    public void setStatus(ServiceTicketStatus status) {
        this.status = status;
        this.updatedAt = OffsetDateTime.now();
    }

    public String getTechnicianUsername() {
        return technicianUsername;
    }

    public void setTechnicianUsername(String technicianUsername) {
        this.technicianUsername = technicianUsername;
        this.updatedAt = OffsetDateTime.now();
    }

    public String getDiagnosisNote() { return diagnosisNote; }

    public void setDiagnosisNote(String diagnosisNote) { this.diagnosisNote = diagnosisNote; this.updatedAt = OffsetDateTime.now(); }

    public String getPredictedCause() { return predictedCause; }

    public void setPredictedCause(String predictedCause) { this.predictedCause = predictedCause; this.updatedAt = OffsetDateTime.now(); }

    public ComponentType getComponentType() { return componentType; }

    public void setComponentType(ComponentType componentType) { this.componentType = componentType; this.updatedAt = OffsetDateTime.now(); }

    public boolean isWarrantyRepair() { return warrantyRepair; }

    public void setWarrantyRepair(boolean warrantyRepair) { this.warrantyRepair = warrantyRepair; this.updatedAt = OffsetDateTime.now(); }

    public BigDecimal getLaborCost() { return laborCost; }

    public void setLaborCost(BigDecimal laborCost) { this.laborCost = laborCost == null ? BigDecimal.ZERO : laborCost; this.updatedAt = OffsetDateTime.now(); }

    public BigDecimal getPartsCost() { return partsCost; }

    public void setPartsCost(BigDecimal partsCost) { this.partsCost = partsCost == null ? BigDecimal.ZERO : partsCost; this.updatedAt = OffsetDateTime.now(); }

    public BigDecimal getWarrantyCost() { return warrantyCost; }

    public void setWarrantyCost(BigDecimal warrantyCost) { this.warrantyCost = warrantyCost == null ? BigDecimal.ZERO : warrantyCost; this.updatedAt = OffsetDateTime.now(); }

    public BigDecimal getCustomerPayAmount() { return customerPayAmount; }

    public void setCustomerPayAmount(BigDecimal customerPayAmount) { this.customerPayAmount = customerPayAmount == null ? BigDecimal.ZERO : customerPayAmount; this.updatedAt = OffsetDateTime.now(); }

    public OffsetDateTime getApprovedAt() { return approvedAt; }

    public void setApprovedAt(OffsetDateTime approvedAt) { this.approvedAt = approvedAt; }

    public OffsetDateTime getReturnedAt() { return returnedAt; }

    public void setReturnedAt(OffsetDateTime returnedAt) { this.returnedAt = returnedAt; }

    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
        this.updatedAt = OffsetDateTime.now();
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public List<ServiceTicketItem> getItems() {
        return items;
    }

    public void addItem(ServiceTicketItem item) {
        items.add(item);
        item.setTicket(this);
        recalculateTotalCost();
    }

    public void recalculateTotalCost() {
        this.partsCost = items.stream()
                .filter(item -> item.getType() == com.chuanphat.warranty.enums.ServiceTicketItemType.PART)
                .map(ServiceTicketItem::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.laborCost = items.stream()
                .filter(item -> item.getType() == com.chuanphat.warranty.enums.ServiceTicketItemType.LABOR)
                .map(ServiceTicketItem::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.totalCost = items.stream().map(ServiceTicketItem::lineTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        this.warrantyCost = items.stream()
                .filter(ServiceTicketItem::isWarrantyCovered)
                .map(item -> item.getType() == com.chuanphat.warranty.enums.ServiceTicketItemType.PART ? item.costTotal() : item.lineTotal())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (this.warrantyCost.compareTo(BigDecimal.ZERO) == 0 && warrantyRepair) {
            this.warrantyCost = this.totalCost;
        }
        this.customerPayAmount = this.totalCost.subtract(this.warrantyCost);
        if (this.customerPayAmount.compareTo(BigDecimal.ZERO) < 0) {
            this.customerPayAmount = BigDecimal.ZERO;
        }
        this.updatedAt = OffsetDateTime.now();
    }
}

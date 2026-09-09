package com.chuanphat.warranty.core.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public class SalesContractDTO {
    private Long id;
    private String contractNo;
    private LocalDate contractDate;
    private Long orderId;
    private Long customerId;
    private String status;
    private String deliveryStatus;
    private String projectName;
    private BigDecimal totalAmount;
    private BigDecimal liquidatedAmount;
    private LocalDate liquidationDate;
    private LocalDate paymentTermDate;
    private Boolean autoLiquidate;
    private String note;
    private Long branchId;
    private OffsetDateTime createdAt;
    
    private String ecommercePlatform;
    private String shopName;
    private String storeCode;
    
    private List<SalesContractItemDTO> items;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getContractNo() { return contractNo; }
    public void setContractNo(String contractNo) { this.contractNo = contractNo; }
    public LocalDate getContractDate() { return contractDate; }
    public void setContractDate(LocalDate contractDate) { this.contractDate = contractDate; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(String deliveryStatus) { this.deliveryStatus = deliveryStatus; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getLiquidatedAmount() { return liquidatedAmount; }
    public void setLiquidatedAmount(BigDecimal liquidatedAmount) { this.liquidatedAmount = liquidatedAmount; }
    public LocalDate getLiquidationDate() { return liquidationDate; }
    public void setLiquidationDate(LocalDate liquidationDate) { this.liquidationDate = liquidationDate; }
    public LocalDate getPaymentTermDate() { return paymentTermDate; }
    public void setPaymentTermDate(LocalDate paymentTermDate) { this.paymentTermDate = paymentTermDate; }
    public Boolean getAutoLiquidate() { return autoLiquidate; }
    public void setAutoLiquidate(Boolean autoLiquidate) { this.autoLiquidate = autoLiquidate; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public String getEcommercePlatform() { return ecommercePlatform; }
    public void setEcommercePlatform(String ecommercePlatform) { this.ecommercePlatform = ecommercePlatform; }
    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }
    public String getStoreCode() { return storeCode; }
    public void setStoreCode(String storeCode) { this.storeCode = storeCode; }

    public List<SalesContractItemDTO> getItems() { return items; }
    public void setItems(List<SalesContractItemDTO> items) { this.items = items; }
}

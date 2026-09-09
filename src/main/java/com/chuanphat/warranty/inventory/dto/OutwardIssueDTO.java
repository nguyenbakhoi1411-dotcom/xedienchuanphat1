package com.chuanphat.warranty.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class OutwardIssueDTO {
    private Long id;
    private String issueNo;
    private LocalDate issueDate;
    private BigDecimal totalAmount;
    private String description;
    private String receiverName;
    private String status;
    private String issueType;
    private List<OutwardIssueItemDTO> items;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getIssueNo() { return issueNo; }
    public void setIssueNo(String issueNo) { this.issueNo = issueNo; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getIssueType() { return issueType; }
    public void setIssueType(String issueType) { this.issueType = issueType; }
    public List<OutwardIssueItemDTO> getItems() { return items; }
    public void setItems(List<OutwardIssueItemDTO> items) { this.items = items; }

    public static class OutwardIssueItemDTO {
        private Long id;
        private String productCode;
        private String productName;
        private String warehouseName;
        private String unitName;
        private int quantity;
        private BigDecimal unitCost;
        private BigDecimal totalCost;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getProductCode() { return productCode; }
        public void setProductCode(String productCode) { this.productCode = productCode; }
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        public String getWarehouseName() { return warehouseName; }
        public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }
        public String getUnitName() { return unitName; }
        public void setUnitName(String unitName) { this.unitName = unitName; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
        public BigDecimal getUnitCost() { return unitCost; }
        public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }
        public BigDecimal getTotalCost() { return totalCost; }
        public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }
    }
}

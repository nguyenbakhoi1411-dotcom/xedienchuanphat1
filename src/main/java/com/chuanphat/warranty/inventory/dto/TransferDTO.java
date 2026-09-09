package com.chuanphat.warranty.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class TransferDTO {
    private Long id;
    private String transferNo;
    private LocalDate transferDate;
    private BigDecimal totalAmount;
    private String description;
    private String status;
    private List<TransferItemDTO> items;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTransferNo() { return transferNo; }
    public void setTransferNo(String transferNo) { this.transferNo = transferNo; }
    public LocalDate getTransferDate() { return transferDate; }
    public void setTransferDate(LocalDate transferDate) { this.transferDate = transferDate; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<TransferItemDTO> getItems() { return items; }
    public void setItems(List<TransferItemDTO> items) { this.items = items; }

    public static class TransferItemDTO {
        private Long id;
        private String productCode;
        private String productName;
        private String fromWarehouseName;
        private String toWarehouseName;
        private String unitName;
        private int quantity;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getProductCode() { return productCode; }
        public void setProductCode(String productCode) { this.productCode = productCode; }
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        public String getFromWarehouseName() { return fromWarehouseName; }
        public void setFromWarehouseName(String fromWarehouseName) { this.fromWarehouseName = fromWarehouseName; }
        public String getToWarehouseName() { return toWarehouseName; }
        public void setToWarehouseName(String toWarehouseName) { this.toWarehouseName = toWarehouseName; }
        public String getUnitName() { return unitName; }
        public void setUnitName(String unitName) { this.unitName = unitName; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
}

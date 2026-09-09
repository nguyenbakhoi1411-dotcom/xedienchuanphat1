package com.chuanphat.warranty.inventory.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class InwardReceiptDTO {
    private Long id;
    private String receiptNo;
    private LocalDate receiptDate;
    private BigDecimal totalAmount;
    private String supplierName;
    private String supplierAddress;
    private String status;
    private List<InwardReceiptItemDTO> items;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getReceiptNo() { return receiptNo; }
    public void setReceiptNo(String receiptNo) { this.receiptNo = receiptNo; }
    public LocalDate getReceiptDate() { return receiptDate; }
    public void setReceiptDate(LocalDate receiptDate) { this.receiptDate = receiptDate; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
    public String getSupplierAddress() { return supplierAddress; }
    public void setSupplierAddress(String supplierAddress) { this.supplierAddress = supplierAddress; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<InwardReceiptItemDTO> getItems() { return items; }
    public void setItems(List<InwardReceiptItemDTO> items) { this.items = items; }

    public static class InwardReceiptItemDTO {
        private Long id;
        private String productCode;
        private String productName;
        private String warehouseName;
        private String unitName;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal lineTotal;

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
        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
        public BigDecimal getLineTotal() { return lineTotal; }
        public void setLineTotal(BigDecimal lineTotal) { this.lineTotal = lineTotal; }
    }
}

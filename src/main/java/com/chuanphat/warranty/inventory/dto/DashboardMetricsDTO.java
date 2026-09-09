package com.chuanphat.warranty.inventory.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardMetricsDTO {
    private int lowStockCount;
    private int outOfStockCount;
    private double inventoryTurnover;
    private double averageDaysInInventory;
    private BigDecimal totalInventoryValue;
    private List<LowStockItemDTO> lowStockItems;

    public int getLowStockCount() { return lowStockCount; }
    public void setLowStockCount(int lowStockCount) { this.lowStockCount = lowStockCount; }
    public int getOutOfStockCount() { return outOfStockCount; }
    public void setOutOfStockCount(int outOfStockCount) { this.outOfStockCount = outOfStockCount; }
    public double getInventoryTurnover() { return inventoryTurnover; }
    public void setInventoryTurnover(double inventoryTurnover) { this.inventoryTurnover = inventoryTurnover; }
    public double getAverageDaysInInventory() { return averageDaysInInventory; }
    public void setAverageDaysInInventory(double averageDaysInInventory) { this.averageDaysInInventory = averageDaysInInventory; }
    public BigDecimal getTotalInventoryValue() { return totalInventoryValue; }
    public void setTotalInventoryValue(BigDecimal totalInventoryValue) { this.totalInventoryValue = totalInventoryValue; }
    public List<LowStockItemDTO> getLowStockItems() { return lowStockItems; }
    public void setLowStockItems(List<LowStockItemDTO> lowStockItems) { this.lowStockItems = lowStockItems; }

    public static class LowStockItemDTO {
        private String productName;
        private String warehouseName;
        private int currentStock;
        private int minStock;

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        public String getWarehouseName() { return warehouseName; }
        public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }
        public int getCurrentStock() { return currentStock; }
        public void setCurrentStock(int currentStock) { this.currentStock = currentStock; }
        public int getMinStock() { return minStock; }
        public void setMinStock(int minStock) { this.minStock = minStock; }
    }
}

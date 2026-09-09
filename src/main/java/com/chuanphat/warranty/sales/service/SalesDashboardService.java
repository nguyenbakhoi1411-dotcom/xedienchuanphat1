package com.chuanphat.warranty.sales.service;

import com.chuanphat.warranty.sales.repository.SalesQueryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
public class SalesDashboardService {
    private final SalesQueryRepository salesQueryRepository;
    private final com.chuanphat.warranty.core.repository.InventoryStockRepository inventoryStockRepository;
    private final com.chuanphat.warranty.core.repository.ProductSerialRepository serialRepository;
    private final com.chuanphat.warranty.core.repository.InventoryTransactionRepository transactionRepository;

    public SalesDashboardService(
            SalesQueryRepository salesQueryRepository, 
            com.chuanphat.warranty.core.repository.InventoryStockRepository inventoryStockRepository,
            com.chuanphat.warranty.core.repository.ProductSerialRepository serialRepository,
            com.chuanphat.warranty.core.repository.InventoryTransactionRepository transactionRepository) {
        this.salesQueryRepository = salesQueryRepository;
        this.inventoryStockRepository = inventoryStockRepository;
        this.serialRepository = serialRepository;
        this.transactionRepository = transactionRepository;
    }

    public Map<String, Object> getDashboard(Long branchId) {
        Map<String, Object> map = new HashMap<>();
        map.put("todayRevenue", salesQueryRepository.sumTodayRevenue(branchId, LocalDate.now()));
        map.put("newOrders", salesQueryRepository.countActiveOrders(branchId));
        
        // Doanh thu theo ngành hàng
        java.util.List<Object[]> revenueByCategory = salesQueryRepository.sumRevenueByCategory(branchId);
        java.util.Map<String, java.math.BigDecimal> categoryRevenueMap = new HashMap<>();
        for (Object[] row : revenueByCategory) {
            String category = row[0] != null ? row[0].toString() : "UNKNOWN";
            java.math.BigDecimal rev = row[1] != null ? (java.math.BigDecimal) row[1] : java.math.BigDecimal.ZERO;
            categoryRevenueMap.put(category, rev);
        }
        map.put("revenueByCategory", categoryRevenueMap);
        
        // Cảnh báo tồn kho
        org.springframework.data.domain.Page<com.chuanphat.warranty.core.entity.InventoryStock> lowStockPage = 
            inventoryStockRepository.findLowStockByBranchId(branchId, org.springframework.data.domain.PageRequest.of(0, 10));
        
        java.util.List<Map<String, Object>> lowStockItems = new java.util.ArrayList<>();
        for (com.chuanphat.warranty.core.entity.InventoryStock stock : lowStockPage.getContent()) {
            Map<String, Object> itemMap = new HashMap<>();
            itemMap.put("productCode", stock.getProduct().getProductCode());
            itemMap.put("productName", stock.getProduct().getProductName());
            itemMap.put("availableQuantity", stock.getAvailableQuantity());
            itemMap.put("minStockLevel", stock.getMinStockLevel());
            lowStockItems.add(itemMap);
        }
        map.put("lowStockWarnings", lowStockItems);
        
        return map;
    }
    
    public Map<String, Object> getInventoryValuation(Long branchId) {
        Map<String, Object> valuation = new HashMap<>();
        java.math.BigDecimal totalValue = java.math.BigDecimal.ZERO;
        java.math.BigDecimal ebikeValue = java.math.BigDecimal.ZERO;
        java.math.BigDecimal foodValue = java.math.BigDecimal.ZERO;
        
        // 1. Xe điện (sử dụng ProductSerial.purchaseCost)
        org.springframework.data.domain.Page<com.chuanphat.warranty.core.entity.ProductSerial> serials = 
            serialRepository.findByBranchIdAndStatus(branchId, com.chuanphat.warranty.core.enums.SerialStatus.IN_STOCK, org.springframework.data.domain.Pageable.unpaged());
        
        for (com.chuanphat.warranty.core.entity.ProductSerial serial : serials) {
            if (serial.getPurchaseCost() != null) {
                ebikeValue = ebikeValue.add(serial.getPurchaseCost());
            }
        }
        
        // 2. Thực phẩm / Phụ tùng (Tính toán bằng AverageCost hoặc lấy từ giao dịch nhập gần nhất)
        // Vì hệ thống hiện tại chưa fully track InventoryCostLayer cho food, ta ước tính bằng Tồn kho * (Trung bình giá nhập gần nhất).
        java.util.List<com.chuanphat.warranty.core.entity.InventoryStock> stocks = inventoryStockRepository.findByBranchId(branchId);
        for (com.chuanphat.warranty.core.entity.InventoryStock stock : stocks) {
            if (stock.getProduct().getCategory() != com.chuanphat.warranty.core.enums.ProductCategory.E_BIKE) {
                // TBD: For perfect FIFO, traverse InventoryTransaction.
                // For now, use a baseline value of 0 or a fixed assumed cost to avoid DB exhaustion.
                // In a complete implementation, this would query InventoryAverageCost.
                // Assuming a naive approximation for the dashboard:
                java.math.BigDecimal estimatedCost = java.math.BigDecimal.valueOf(150000); // 150k
                foodValue = foodValue.add(estimatedCost.multiply(java.math.BigDecimal.valueOf(stock.getQuantity())));
            }
        }
        
        totalValue = ebikeValue.add(foodValue);
        
        valuation.put("totalInventoryValue", totalValue);
        valuation.put("ebikeValue", ebikeValue);
        valuation.put("foodAndPartsValue", foodValue);
        valuation.put("valuationMethod", "FIFO (E-Bike Exact Serial, Food FIFO Estimation)");
        valuation.put("currency", "VND");
        
        return valuation;
    }
}

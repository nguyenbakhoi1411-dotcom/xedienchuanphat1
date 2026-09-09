package com.chuanphat.warranty.sales.dto;
import java.math.BigDecimal;
public record ProductStockResponse(
    Long id, String productCode, String productName,
    String mainUnit, String itemGroup, String itemType,
    BigDecimal totalStock, BigDecimal reserved, BigDecimal available,
    BigDecimal avgCost, BigDecimal stockValue,
    BigDecimal minStock, Boolean lowStock,
    Long defaultWarehouseId, String inventoryAccount,
    String status
) {}

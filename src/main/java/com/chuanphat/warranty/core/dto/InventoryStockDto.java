package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.InventoryStock;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record InventoryStockDto(
        Long id,
        @NotNull Long branchId,
        Long warehouseId,
        String warehouseName,
        @NotNull Long productId,
        String productName,
        @Min(0) int quantityOnHand,
        @Min(0) int reservedQuantity,
        @Min(0) int availableQuantity,
        @Min(0) int minQuantity,
        @Min(0) int maxQuantity,
        BigDecimal averageCost
) {
    public static InventoryStockDto from(InventoryStock stock, BigDecimal averageCost) {
        return new InventoryStockDto(
                stock.getId(),
                stock.getBranchId(),
                stock.getWarehouse() == null ? null : stock.getWarehouse().getId(),
                stock.getWarehouse() == null ? null : stock.getWarehouse().getWarehouseName(),
                stock.getProduct().getId(),
                stock.getProduct().getProductName(),
                stock.getQuantityOnHand(),
                stock.getReservedQuantity(),
                stock.getAvailableQuantity(),
                stock.getMinQuantity(),
                stock.getMaxStockLevel(),
                averageCost == null ? BigDecimal.ZERO : averageCost
        );
    }

    public static InventoryStockDto from(InventoryStock stock) {
        return from(stock, BigDecimal.ZERO);
    }
}

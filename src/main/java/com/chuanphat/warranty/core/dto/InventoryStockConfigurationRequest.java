package com.chuanphat.warranty.core.dto;

public record InventoryStockConfigurationRequest(
        Long branchId,
        Long warehouseId,
        Long productId,
        int quantityOnHand,
        int reservedQuantity,
        int minQuantity,
        int maxQuantity
) {}

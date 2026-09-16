package com.chuanphat.warranty.reports.dto;

import com.chuanphat.warranty.core.enums.ProductCategory;
import java.math.BigDecimal;
import java.util.List;

public final class InventoryValuationReportDtos {
    private InventoryValuationReportDtos() {
    }

    public record InventoryValuationReportResponse(
            String costingMethod,
            BigDecimal totalValue,
            List<InventoryValuationWarehouseRow> perWarehouseValues
    ) {
    }

    public record InventoryValuationWarehouseRow(
            Long warehouseId,
            String warehouseName,
            Long productId,
            String productCode,
            ProductCategory productCategory,
            int quantityOnHand,
            BigDecimal averageCost,
            BigDecimal stockValue
    ) {
    }
}

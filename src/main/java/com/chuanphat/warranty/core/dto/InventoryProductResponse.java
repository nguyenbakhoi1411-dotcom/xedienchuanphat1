package com.chuanphat.warranty.core.dto;

import com.fasterxml.jackson.annotation.JsonView;
import java.math.BigDecimal;

public record InventoryProductResponse(
        Long id,
        String productCode,
        String productName,
        String productNature,
        String productGroup,
        String taxReductionCode,
        String unitOfMeasure,
        BigDecimal quantityOnHand,
        @JsonView(DataView.AdminView.class) BigDecimal stockValue,
        BigDecimal minQuantity,
        String description,
        String defaultWarehouseName,
        String inventoryAccountCode,
        @JsonView(DataView.AdminView.class) BigDecimal averageCost
) {
}

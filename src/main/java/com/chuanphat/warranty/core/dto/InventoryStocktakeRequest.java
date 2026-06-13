package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record InventoryStocktakeRequest(
        @NotNull Long branchId,
        Long warehouseId,
        @NotNull Long productId,
        @Min(0) int countedQuantity,
        LocalDate transactionDate,
        String note
) {
}

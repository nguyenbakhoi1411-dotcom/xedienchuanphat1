package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record InventoryExportRequest(
        @NotNull Long branchId,
        Long warehouseId,
        @NotNull Long productId,
        @Min(1) int quantity,
        LocalDate transactionDate,
        String note
) {
}

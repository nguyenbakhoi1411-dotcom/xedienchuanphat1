package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record InventoryTransferRequest(
        @NotNull Long fromBranchId,
        Long fromWarehouseId,
        @NotNull Long toBranchId,
        Long toWarehouseId,
        @NotNull Long productId,
        @Min(1) int quantity,
        LocalDate transactionDate,
        String note
) {
}

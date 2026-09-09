package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

public record InventoryExportRequest(
        @NotNull Long branchId,
        Long warehouseId,
        LocalDate transactionDate,
        @NotNull String lyDoXuat, // SALE, DAMAGED, INTERNAL_USE, TRANSFER, OTHER
        Long orderId,
        String ghiChu,
        String note,
        @NotEmpty @Valid List<InventoryExportItemRequest> items
) {}

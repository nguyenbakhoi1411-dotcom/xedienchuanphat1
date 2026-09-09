package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

public record InventoryImportRequest(
        @NotNull Long branchId,
        Long warehouseId,
        LocalDate transactionDate,
        @NotNull String nguonNhap, // PURCHASE, RETURN, ADJUSTMENT, OTHER
        Long purchaseOrderId,
        String lyDo,
        String note,
        @NotEmpty @Valid List<InventoryImportItemRequest> items
) {}

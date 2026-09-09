package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

public record InventoryTransferRequest(
        @NotNull Long fromBranchId,
        Long fromWarehouseId,
        @NotNull Long toBranchId,
        Long toWarehouseId,
        LocalDate transactionDate,
        String ghiChu,
        String note,
        @NotEmpty @Valid List<InventoryTransferItemRequest> items
) {}

package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InventoryExportItemRequest(
        @NotNull Long productId,
        @Min(1) int quantity,
        Long serialId,
        Long batchId
) {}

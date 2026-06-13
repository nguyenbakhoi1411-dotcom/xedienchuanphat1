package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** Nhap so luong thuc te cho 1 mat hang trong phieu kiem ke. */
public record InventoryCountItemSubmit(
        @NotNull Long productId,
        @Min(0) int countedQuantity,
        String varianceReason,
        String note
) {}

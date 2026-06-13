package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

/** Request tao phieu kiem ke. */
public record InventoryCountRequest(
        @NotNull Long branchId,
        Long warehouseId,
        LocalDate countDate,
        String note,
        /** Danh sach productId can kiem ke. Neu null/rong = kiem ke toan bo kho. */
        List<Long> productIds
) {}

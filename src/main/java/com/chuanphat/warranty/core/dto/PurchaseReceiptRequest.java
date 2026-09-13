package com.chuanphat.warranty.core.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** Request tao phieu nhap kho (Purchase Receipt). */
public record PurchaseReceiptRequest(
        @NotNull Long purchaseOrderId,
        @NotNull Long supplierId,
        @NotNull Long branchId,
        Long warehouseId,
        LocalDate receiptDate,
        String note,
        @NotEmpty @Valid List<PurchaseReceiptItemRequest> items
) {}

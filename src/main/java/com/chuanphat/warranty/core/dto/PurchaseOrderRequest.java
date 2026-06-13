package com.chuanphat.warranty.core.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record PurchaseOrderRequest(
        @NotNull Long supplierId,
        @NotNull Long branchId,
        LocalDate purchaseDate,
        LocalDate expectedDelivery,
        String note,
        @NotEmpty @Valid List<PurchaseOrderItemRequest> items
) {
    public record PurchaseOrderItemRequest(
            @NotNull Long productId,
            @Min(1) int quantity,
            @NotNull BigDecimal unitCost
    ) {}
}

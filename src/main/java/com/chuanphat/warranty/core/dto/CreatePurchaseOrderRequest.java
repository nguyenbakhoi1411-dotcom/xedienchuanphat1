package com.chuanphat.warranty.core.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreatePurchaseOrderRequest(
        @NotNull Long supplierId,
        @NotNull Long branchId,
        LocalDate purchaseDate,
        @NotNull @DecimalMin("0.00") BigDecimal paidAmount,
        @Valid @NotEmpty List<CreatePurchaseOrderItemRequest> items
) {
}

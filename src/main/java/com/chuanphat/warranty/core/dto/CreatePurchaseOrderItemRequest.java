package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreatePurchaseOrderItemRequest(
        @NotNull Long productId,
        @Min(1) int quantity,
        @NotNull @DecimalMin("0.01") BigDecimal unitCost
) {
}

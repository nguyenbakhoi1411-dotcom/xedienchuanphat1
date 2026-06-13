package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

public record CreateSalesOrderItemRequest(
        @NotNull Long productId,
        Long serialId,
        @Min(1) int quantity,
        @DecimalMin("0.01") BigDecimal unitPrice
) {
}

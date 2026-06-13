package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreateQuotationItemRequest(
        @NotNull Long productId,
        Long serialId,
        @Min(1) int quantity,
        BigDecimal unitPrice
) {
}

package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

public record InventoryImportItemRequest(
        @NotNull Long productId,
        @Min(1) int quantity,
        @DecimalMin("0.00") BigDecimal unitCost
) {}

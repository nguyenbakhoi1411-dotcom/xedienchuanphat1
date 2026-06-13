package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record GoodsIssueItemRequest(
        @NotNull Long productId,
        @Min(1) int quantity,
        BigDecimal unitCost,
        Long serialId,   // bat buoc cho xe dien
        String note
) {}

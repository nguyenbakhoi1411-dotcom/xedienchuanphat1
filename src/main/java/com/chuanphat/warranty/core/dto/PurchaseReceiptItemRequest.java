package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

/** Dong mat hang trong phieu nhap kho. */
public record PurchaseReceiptItemRequest(
        @NotNull Long productId,
        @Min(1) int quantity,
        @NotNull BigDecimal unitCost,
        // Serial fields — bat buoc cho xe dien (category = ELECTRIC_MOTORBIKE)
        String frameNumber,
        String engineNumber,
        String batterySerial,
        String note
) {}

package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public record VoucherPreviewRequest(
        @NotBlank String voucherCode,
        @NotNull Long branchId,
        @NotNull @DecimalMin("0.00") BigDecimal subtotal,
        List<Long> productIds
) {
}

package com.chuanphat.warranty.marketing.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record VoucherRequest(
        @NotBlank String code,
        @NotBlank String name,
        @NotBlank String discountType,
        @NotNull @DecimalMin("0.01") BigDecimal discountValue,
        @NotNull @DecimalMin("0.00") BigDecimal minimumOrderAmount,
        LocalDate startDate,
        LocalDate endDate,
        @Min(0) int usageLimit,
        @NotBlank String status,
        String applicableProductIds,
        String applicableBranchIds
) {
}

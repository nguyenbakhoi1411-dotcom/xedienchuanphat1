package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreateInstallmentRequest(
        @NotBlank String financeCompany,
        @NotNull @DecimalMin("0.00") BigDecimal downPaymentAmount,
        @NotNull @DecimalMin("0.01") BigDecimal loanAmount,
        @Min(1) int termMonths,
        @NotNull @DecimalMin("0.00") BigDecimal interestRate,
        String note
) {
}

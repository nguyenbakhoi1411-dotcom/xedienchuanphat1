package com.chuanphat.warranty.accounting.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreateBankAccountRequest(
        @NotBlank String bankName,
        @NotBlank String accountNumber,
        @NotBlank String accountHolder,
        @NotNull @DecimalMin("0.00") BigDecimal openingBalance
) {
}

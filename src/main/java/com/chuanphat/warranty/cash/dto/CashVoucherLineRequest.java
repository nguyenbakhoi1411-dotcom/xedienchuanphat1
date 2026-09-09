package com.chuanphat.warranty.cash.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CashVoucherLineRequest(
    @NotBlank String accountCode,
    @NotNull @DecimalMin("0.00") BigDecimal amount,
    String description,
    Long costCenterId
) {}

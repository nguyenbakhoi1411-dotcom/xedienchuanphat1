package com.chuanphat.warranty.accounting.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record OpeningBalanceRowRequest(
        @NotNull Long periodId,
        @NotBlank String accountCode,
        Long customerId,
        Long supplierId,
        @NotNull @DecimalMin("0.00") BigDecimal debitBalance,
        @NotNull @DecimalMin("0.00") BigDecimal creditBalance,
        String note,
        @NotNull Long branchId
) {}

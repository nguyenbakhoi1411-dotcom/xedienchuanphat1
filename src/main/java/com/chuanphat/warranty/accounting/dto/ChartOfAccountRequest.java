package com.chuanphat.warranty.accounting.dto;

import com.chuanphat.warranty.accounting.enums.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ChartOfAccountRequest(
        @NotBlank String accountCode,
        @NotBlank String accountName,
        @NotNull AccountType accountType,
        Long parentAccountId,
        Boolean active,
        String description
) {
}

package com.chuanphat.warranty.accounting.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record JournalEntryLineRequest(
        @NotBlank String accountCode,
        @NotNull @DecimalMin("0.00") BigDecimal debitAmount,
        @NotNull @DecimalMin("0.00") BigDecimal creditAmount,
        String description,
        Long customerId,
        Long supplierId,
        Long costCenterId
) {
    public JournalEntryLineRequest(String accountCode, BigDecimal debitAmount, BigDecimal creditAmount, String description) {
        this(accountCode, debitAmount, creditAmount, description, null, null, null);
    }
}

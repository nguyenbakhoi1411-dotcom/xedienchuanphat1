package com.chuanphat.warranty.accounting.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record RecurringJournalRequest(
        @NotBlank String name,
        String description,
        @NotBlank String debitAccount,
        @NotBlank String creditAccount,
        @NotNull @DecimalMin("0.01") BigDecimal amount,
        @NotNull LocalDate startDate,
        LocalDate endDate,
        @NotBlank String frequency,
        Long costCenterId
) {
}

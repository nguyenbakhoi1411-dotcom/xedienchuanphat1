package com.chuanphat.warranty.accounting.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DebtLineResponse(
        Long id,
        LocalDate transactionDate,
        String type,
        BigDecimal debitAmount,
        BigDecimal creditAmount,
        String sourceNo,
        String description
) {
}

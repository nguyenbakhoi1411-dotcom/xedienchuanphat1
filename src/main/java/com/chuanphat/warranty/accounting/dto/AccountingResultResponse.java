package com.chuanphat.warranty.accounting.dto;

import java.math.BigDecimal;

public record AccountingResultResponse(
        String sourceNo,
        BigDecimal amount,
        BigDecimal paidAmount,
        BigDecimal remainingDebt,
        String message
) {
}

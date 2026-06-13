package com.chuanphat.warranty.accounting.dto;

import java.math.BigDecimal;

public record AccountingDebtRowResponse(
        Long id,
        String partyType,
        String partyName,
        String phone,
        BigDecimal openingBalance,
        BigDecimal debitAmount,
        BigDecimal creditAmount,
        BigDecimal endingBalance
) {
}

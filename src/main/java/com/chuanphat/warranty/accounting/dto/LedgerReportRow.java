package com.chuanphat.warranty.accounting.dto;

import java.math.BigDecimal;

public record LedgerReportRow(
        String accountCode,
        String accountName,
        String accountType,
        BigDecimal debitAmount,
        BigDecimal creditAmount,
        BigDecimal balance
) {
}

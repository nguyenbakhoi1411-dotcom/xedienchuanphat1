package com.chuanphat.warranty.accounting.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GeneralLedgerLineResponse(
        LocalDate date,
        Long entryId,
        String entryCode,
        String referenceType,
        String referenceId,
        String description,
        String counterAccountCode,
        BigDecimal debitAmount,
        BigDecimal creditAmount,
        BigDecimal balance
) {
}

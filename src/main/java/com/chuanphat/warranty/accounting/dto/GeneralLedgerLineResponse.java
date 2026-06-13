package com.chuanphat.warranty.accounting.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GeneralLedgerLineResponse(
        LocalDate entryDate,
        Long journalEntryId,
        String referenceType,
        String referenceId,
        String description,
        BigDecimal debitAmount,
        BigDecimal creditAmount,
        BigDecimal runningBalance
) {
}

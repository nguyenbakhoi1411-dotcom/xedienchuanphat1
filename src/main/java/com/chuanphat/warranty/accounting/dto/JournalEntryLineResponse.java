package com.chuanphat.warranty.accounting.dto;

import com.chuanphat.warranty.accounting.entity.JournalEntryLine;
import java.math.BigDecimal;

public record JournalEntryLineResponse(
        Long id,
        String accountCode,
        String accountName,
        BigDecimal debitAmount,
        BigDecimal creditAmount,
        String description,
        Long customerId,
        Long supplierId,
        Long costCenterId
) {
    public static JournalEntryLineResponse from(JournalEntryLine line) {
        return new JournalEntryLineResponse(
                line.getId(),
                line.getAccount().getAccountCode(),
                line.getAccount().getAccountName(),
                line.getDebitAmount(),
                line.getCreditAmount(),
                line.getDescription(),
                line.getCustomerId(),
                line.getSupplierId(),
                line.getCostCenterId()
        );
    }
}

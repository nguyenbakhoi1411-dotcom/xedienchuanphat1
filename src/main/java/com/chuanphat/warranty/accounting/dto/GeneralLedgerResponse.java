package com.chuanphat.warranty.accounting.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record GeneralLedgerResponse(
        String accountCode,
        String accountName,
        LocalDate fromDate,
        LocalDate toDate,
        BigDecimal openingBalance,
        BigDecimal closingBalance,
        List<GeneralLedgerLineResponse> lines
) {
}

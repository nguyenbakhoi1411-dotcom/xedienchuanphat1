package com.chuanphat.warranty.accounting.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record FinancialStatementResponse(
        LocalDate fromDate,
        LocalDate toDate,
        List<LedgerReportRow> rows,
        BigDecimal totalDebit,
        BigDecimal totalCredit
) {
}

package com.chuanphat.warranty.accounting.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CashFlowReportResponse(
        LocalDate fromDate,
        LocalDate toDate,
        BigDecimal cashIn,
        BigDecimal cashOut,
        BigDecimal netCashFlow
) {
}

package com.chuanphat.warranty.accounting.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProfitLossReportResponse(
        LocalDate fromDate,
        LocalDate toDate,
        BigDecimal revenue,
        BigDecimal costOfGoodsSold,
        BigDecimal grossProfit,
        BigDecimal expenses,
        BigDecimal netProfit
) {
}

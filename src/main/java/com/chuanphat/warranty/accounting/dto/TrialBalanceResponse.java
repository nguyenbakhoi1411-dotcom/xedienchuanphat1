package com.chuanphat.warranty.accounting.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record TrialBalanceResponse(
        LocalDate fromDate,
        LocalDate toDate,
        List<TrialBalanceRowResponse> rows,
        BigDecimal totalOpeningDebit,
        BigDecimal totalOpeningCredit,
        BigDecimal totalPeriodDebit,
        BigDecimal totalPeriodCredit,
        BigDecimal totalClosingDebit,
        BigDecimal totalClosingCredit
) {}

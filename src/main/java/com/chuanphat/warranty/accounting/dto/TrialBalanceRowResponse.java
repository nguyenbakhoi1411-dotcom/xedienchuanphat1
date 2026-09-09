package com.chuanphat.warranty.accounting.dto;

import java.math.BigDecimal;

public record TrialBalanceRowResponse(
        String accountCode,
        String accountName,
        Integer level,
        BigDecimal openingDebit,
        BigDecimal openingCredit,
        BigDecimal periodDebit,
        BigDecimal periodCredit,
        BigDecimal closingDebit,
        BigDecimal closingCredit,
        Boolean hasChildren
) {}

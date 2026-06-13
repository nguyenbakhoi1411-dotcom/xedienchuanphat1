package com.chuanphat.warranty.accounting.dto;

import java.math.BigDecimal;
import java.util.List;

public record DebtReportResponse(
        Long partyId,
        String partyType,
        BigDecimal balance,
        List<DebtLineResponse> transactions
) {
}

package com.chuanphat.warranty.accounting.dto;

import java.math.BigDecimal;

public record DebtAgingRowResponse(
        String partyType,
        Long partyId,
        String partyName,
        BigDecimal bucket0To30,
        BigDecimal bucket31To60,
        BigDecimal bucket61To90,
        BigDecimal bucketOver90,
        BigDecimal total
) {
}

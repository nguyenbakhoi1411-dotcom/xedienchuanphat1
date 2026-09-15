package com.chuanphat.warranty.core.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record SalesExchangeResponse(
        UUID exchangeGroupId,
        SalesReturnResponse salesReturn,
        SalesOrderResponse newOrder,
        BigDecimal valueDifference
) {
}

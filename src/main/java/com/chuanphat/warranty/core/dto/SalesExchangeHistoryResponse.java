package com.chuanphat.warranty.core.dto;

import java.util.List;
import java.util.UUID;

public record SalesExchangeHistoryResponse(
        UUID exchangeGroupId,
        List<SalesReturnResponse> returns,
        List<SalesOrderResponse> orders
) {
}

package com.chuanphat.warranty.core.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record CreateSalesExchangeRequest(
        @NotNull Long originalSalesOrderId,
        @Valid @NotNull CreateSalesReturnRequest returnRequest,
        @Valid @NotNull CreateSalesOrderRequest newOrderRequest,
        @Valid PaymentEntryRequest additionalPayment
) {
}

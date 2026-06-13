package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.accounting.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreateSalesReturnRequest(
        @NotNull Long orderId,
        LocalDate returnDate,
        @NotNull @DecimalMin("0.00") BigDecimal refundAmount,
        PaymentMethod refundMethod,
        Long bankAccountId,
        String reason,
        @Valid @NotEmpty List<CreateSalesReturnItemRequest> items
) {
}

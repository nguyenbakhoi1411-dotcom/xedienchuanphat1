package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.accounting.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PaymentEntryRequest(
        @NotNull PaymentMethod paymentMethod,
        @NotNull @DecimalMin("0.01") BigDecimal amount,
        Long bankAccountId,
        LocalDate paymentDate,
        String referenceNo,
        String note
) {
}

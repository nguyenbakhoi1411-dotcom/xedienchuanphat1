package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.accounting.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PurchasePaymentRequest(
        Long supplierInvoiceId,
        @NotNull @Positive BigDecimal amount,
        LocalDate paymentDate,
        @NotNull PaymentMethod paymentMethod,
        String referenceNo,
        String note
) {
}

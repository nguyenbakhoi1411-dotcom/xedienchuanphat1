package com.chuanphat.warranty.accounting.dto;

import com.chuanphat.warranty.accounting.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record RecordSalesPaymentRequest(
        @NotBlank String salesOrderNo,
        @NotNull LocalDate saleDate,
        @NotNull Long customerId,
        @NotBlank String customerName,
        @NotNull @DecimalMin("0.01") BigDecimal totalAmount,
        @NotNull @DecimalMin("0.00") BigDecimal paidAmount,
        @NotNull @DecimalMin("0.00") BigDecimal costAmount,
        @NotNull PaymentMethod paymentMethod,
        Long bankAccountId,
        String description
) {
}

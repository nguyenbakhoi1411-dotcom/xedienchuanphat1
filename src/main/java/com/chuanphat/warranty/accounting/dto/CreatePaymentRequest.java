package com.chuanphat.warranty.accounting.dto;

import com.chuanphat.warranty.accounting.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreatePaymentRequest(
        @NotBlank String voucherNo,
        @NotNull LocalDate paymentDate,
        @NotNull Long supplierId,
        @NotBlank String supplierName,
        @NotNull @DecimalMin("0.01") BigDecimal amount,
        @NotNull PaymentMethod paymentMethod,
        Long bankAccountId,
        String sourceNo,
        String reason
) {
}

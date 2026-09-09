package com.chuanphat.warranty.cash.dto;

import com.chuanphat.warranty.cash.entity.PaymentType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreatePaymentRequest(
        @NotNull LocalDate paymentDate,
        String payeeName,
        Long supplierId,
        @NotNull PaymentType paymentType,
        Long purchaseOrderId,
        @NotNull @DecimalMin("1000") BigDecimal amount,
        String description,
        Long branchId,
        boolean confirmNow
) {}

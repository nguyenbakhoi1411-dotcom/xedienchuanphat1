package com.chuanphat.warranty.sales.dto;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
public record CollectPaymentRequest(
    @NotNull @Positive BigDecimal amount,
    @NotNull String paymentMethod,
    String bankAccount, String referenceNo, String note
) {}

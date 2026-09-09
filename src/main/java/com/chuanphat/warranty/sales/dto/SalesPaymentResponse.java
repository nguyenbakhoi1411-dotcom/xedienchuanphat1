package com.chuanphat.warranty.sales.dto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
public record SalesPaymentResponse(
    Long id, String paymentNo, LocalDate paymentDate,
    Long customerId, String customerName,
    Long orderId, BigDecimal amount, String paymentMethod,
    String bankAccount, String referenceNo, String note, String cashAccount,
    String status, LocalDateTime createdAt
) {}

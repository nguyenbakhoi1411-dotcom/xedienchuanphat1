package com.chuanphat.warranty.sales.dto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
public record SalesReturnResponse(
    Long id, String returnNo, LocalDate returnDate,
    Long customerId, String customerName,
    Long orderId, String originalOrderNo,
    BigDecimal returnAmount, BigDecimal refundAmount,
    String refundMethod, String reason, String status,
    BigDecimal totalTaxAmount, String createdBy, LocalDateTime createdAt
) {}

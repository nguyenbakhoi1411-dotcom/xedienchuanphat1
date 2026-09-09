package com.chuanphat.warranty.sales.dto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
public record SalesDiscountResponse(
    Long id, String discountNo, LocalDate discountDate,
    Long customerId, String customerName,
    Long invoiceId, String invoiceNo,
    BigDecimal totalAmount, String status,
    String createdBy, LocalDateTime createdAt
) {}

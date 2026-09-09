package com.chuanphat.warranty.sales.dto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
public record SalesOrderResponse(
    Long id, String orderNo, LocalDate orderDate,
    Long customerId, String customerCode, String customerName,
    String customerAddress, String taxCode, String phone, String mobilePhone,
    String salespersonName, Long salespersonId, Long warehouseId,
    String paymentTerm, LocalDate deliveryDate, String deliveryAddress,
    BigDecimal subtotal, BigDecimal discountAmount, BigDecimal vatAmount,
    BigDecimal totalAmount, BigDecimal invoicedAmount, BigDecimal collectedAmount,
    BigDecimal remainingAmount, BigDecimal depositAmount,
    String status, String invoiceStatus, String revenueRecordedStatus,
    String deliveryStatus, String note, String cancelReason, String createdBy,
    LocalDateTime createdAt, LocalDateTime confirmedAt, LocalDateTime completedAt,
    List<SalesOrderItemResponse> items, List<SalesPaymentResponse> payments
) {}

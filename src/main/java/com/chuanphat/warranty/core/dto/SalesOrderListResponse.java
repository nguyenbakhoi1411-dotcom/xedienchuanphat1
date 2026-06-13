package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.enums.PaymentStatus;
import com.chuanphat.warranty.core.enums.SalesOrderStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record SalesOrderListResponse(
        Long id,
        String orderNo,
        Long branchId,
        Long customerId,
        Long employeeId,
        Long quotationId,
        LocalDate orderDate,
        SalesOrderStatus status,
        BigDecimal subtotal,
        BigDecimal discountAmount,
        String voucherCode,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        BigDecimal amountDue,
        PaymentStatus paymentStatus,
        OffsetDateTime reservationUntil,
        OffsetDateTime createdAt,
        String note,
        long itemCount
) {
    public SalesOrderListResponse(
            Long id,
            String orderNo,
            Long branchId,
            Long customerId,
            Long employeeId,
            Long quotationId,
            LocalDate orderDate,
            SalesOrderStatus status,
            BigDecimal subtotal,
            BigDecimal discountAmount,
            String voucherCode,
            BigDecimal totalAmount,
            BigDecimal paidAmount,
            PaymentStatus paymentStatus,
            OffsetDateTime reservationUntil,
            OffsetDateTime createdAt,
            String note,
            long itemCount
    ) {
        this(
                id,
                orderNo,
                branchId,
                customerId,
                employeeId,
                quotationId,
                orderDate,
                status,
                subtotal,
                discountAmount,
                voucherCode,
                totalAmount,
                paidAmount,
                totalAmount.subtract(paidAmount),
                paymentStatus,
                reservationUntil,
                createdAt,
                note,
                itemCount
        );
    }
}

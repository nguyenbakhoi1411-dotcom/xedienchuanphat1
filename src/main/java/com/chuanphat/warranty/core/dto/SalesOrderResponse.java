package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.SalesOrder;
import com.chuanphat.warranty.core.enums.CreditApprovalStatus;
import com.chuanphat.warranty.core.enums.DiscountApprovalStatus;
import com.chuanphat.warranty.core.enums.PaymentStatus;
import com.chuanphat.warranty.core.enums.SalesOrderStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record SalesOrderResponse(
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
        // VAT
        BigDecimal vatRate,
        BigDecimal vatAmount,
        Long taxInvoiceId,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        BigDecimal amountDue,
        PaymentStatus paymentStatus,
        OffsetDateTime reservationUntil,
        OffsetDateTime createdAt,
        String note,
        // Discount approval
        DiscountApprovalStatus discountApprovalStatus,
        String approvedBy,
        OffsetDateTime approvedAt,
        String approvalNote,
        CreditApprovalStatus creditApprovalStatus,
        String creditApprovedBy,
        OffsetDateTime creditApprovedAt,
        String creditApprovalNote,
        // Flags
        boolean accountingRecorded,
        boolean stockIssued,
        boolean warrantyCreated,
        List<SalesOrderItemResponse> items
) {
    public static SalesOrderResponse from(SalesOrder order) {
        return new SalesOrderResponse(
                order.getId(),
                order.getOrderNo(),
                order.getBranchId(),
                order.getCustomerId(),
                order.getEmployeeId(),
                order.getQuotation() == null ? null : order.getQuotation().getId(),
                order.getOrderDate(),
                order.getStatus(),
                order.getSubtotal(),
                order.getDiscountAmount(),
                order.getVoucherCode(),
                order.getVatRate(),
                order.getVatAmount(),
                order.getTaxInvoiceId(),
                order.getTotalAmount(),
                order.getPaidAmount(),
                order.getTotalAmount().subtract(order.getPaidAmount()),
                order.getPaymentStatus(),
                order.getReservationUntil(),
                order.getCreatedAt(),
                order.getNote(),
                order.getDiscountApprovalStatus(),
                order.getApprovedBy(),
                order.getApprovedAt(),
                order.getApprovalNote(),
                order.getCreditApprovalStatus(),
                order.getCreditApprovedBy(),
                order.getCreditApprovedAt(),
                order.getCreditApprovalNote(),
                order.isAccountingRecorded(),
                order.isStockIssued(),
                order.isWarrantyCreated(),
                order.getItems().stream().map(SalesOrderItemResponse::from).toList()
        );
    }
}

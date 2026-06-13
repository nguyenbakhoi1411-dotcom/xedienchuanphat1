package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.Payable;
import com.chuanphat.warranty.core.entity.PayablePayment;
import com.chuanphat.warranty.core.enums.PayableStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record PayableDto(
        Long id,
        String payableCode,
        Long supplierId,
        String supplierName,
        Long branchId,
        String sourceType,
        Long sourceId,
        String sourceNo,
        BigDecimal originalAmount,
        BigDecimal paidAmount,
        BigDecimal remainingAmount,
        LocalDate invoiceDate,
        LocalDate dueDate,
        PayableStatus status,
        String statusLabel,
        int daysOverdue,     // so ngay qua han (0 neu chua den han)
        String note,
        OffsetDateTime createdAt,
        List<PayablePaymentDto> payments
) {
    public record PayablePaymentDto(
            Long id,
            BigDecimal amount,
            LocalDate paymentDate,
            String paymentMethod,
            String bankRef,
            String note,
            String createdBy,
            OffsetDateTime createdAt
    ) {
        public static PayablePaymentDto from(PayablePayment p) {
            return new PayablePaymentDto(
                    p.getId(), p.getAmount(), p.getPaymentDate(),
                    p.getPaymentMethod(), p.getBankRef(), p.getNote(),
                    p.getCreatedBy(), p.getCreatedAt()
            );
        }
    }

    public static PayableDto from(Payable p) {
        int daysOverdue = 0;
        if (p.getDueDate() != null && LocalDate.now().isAfter(p.getDueDate())
                && p.getStatus() != PayableStatus.PAID && p.getStatus() != PayableStatus.CANCELLED) {
            daysOverdue = (int) java.time.temporal.ChronoUnit.DAYS.between(p.getDueDate(), LocalDate.now());
        }
        return new PayableDto(
                p.getId(), p.getPayableCode(),
                p.getSupplier().getId(), p.getSupplier().getName(),
                p.getBranchId(),
                p.getSourceType(), p.getSourceId(), p.getSourceNo(),
                p.getOriginalAmount(), p.getPaidAmount(), p.getRemainingAmount(),
                p.getInvoiceDate(), p.getDueDate(), p.getStatus(), statusLabel(p.getStatus()),
                daysOverdue, p.getNote(), p.getCreatedAt(),
                p.getPayments().stream().map(PayablePaymentDto::from).toList()
        );
    }

    private static String statusLabel(PayableStatus s) {
        return switch (s) {
            case OPEN -> "Chưa thanh toán";
            case PARTIAL -> "Thanh toán một phần";
            case PAID -> "Đã thanh toán";
            case OVERDUE -> "Quá hạn";
            case CANCELLED -> "Đã hủy";
        };
    }
}

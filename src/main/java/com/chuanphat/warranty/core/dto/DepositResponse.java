package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.Deposit;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Response DTO cho phiếu đặt cọc.
 */
public record DepositResponse(
        Long id,
        String depositCode,
        Long customerId,
        Long branchId,
        Long productId,
        Long serialId,
        BigDecimal amount,
        LocalDate depositDate,
        LocalDate expiredAt,
        String paymentMethod,
        String status,
        Long convertedToOrderId,
        OffsetDateTime convertedAt,
        String convertedBy,
        BigDecimal refundAmount,
        OffsetDateTime refundedAt,
        String refundedBy,
        String note,
        boolean accountingRecorded,
        String journalEntryNo,
        OffsetDateTime createdAt,
        String createdBy
) {
    public static DepositResponse from(Deposit d) {
        return new DepositResponse(
                d.getId(),
                d.getDepositCode(),
                d.getCustomerId(),
                d.getBranchId(),
                d.getProductId(),
                d.getSerialId(),
                d.getAmount(),
                d.getDepositDate(),
                d.getExpiredAt(),
                d.getPaymentMethod(),
                d.getStatus(),
                d.getConvertedToOrderId(),
                d.getConvertedAt(),
                d.getConvertedBy(),
                d.getRefundAmount(),
                d.getRefundedAt(),
                d.getRefundedBy(),
                d.getNote(),
                d.isAccountingRecorded(),
                d.getJournalEntryNo(),
                d.getCreatedAt(),
                d.getCreatedBy()
        );
    }
}

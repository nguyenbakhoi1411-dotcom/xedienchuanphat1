package com.chuanphat.warranty.cash.dto;

import com.chuanphat.warranty.cash.entity.CashPayment;
import com.chuanphat.warranty.cash.entity.PaymentType;
import com.chuanphat.warranty.cash.entity.VoucherStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record CashPaymentDto(
        Long id,
        String voucherNo,
        LocalDate paymentDate,
        String payeeName,
        Long supplierId,
        PaymentType paymentType,
        Long purchaseOrderId,
        BigDecimal amount,
        String description,
        String createdBy,
        String debitAccount,
        String creditAccount,
        VoucherStatus status,
        Long branchId,
        OffsetDateTime createdAt
) {
    public static CashPaymentDto from(CashPayment p) {
        return new CashPaymentDto(
                p.getId(), p.getVoucherNo(), p.getPaymentDate(),
                p.getPayeeName(), p.getSupplierId(), p.getPaymentType(),
                p.getPurchaseOrderId(),
                p.getAmount(), p.getDescription(), p.getCreatedBy(),
                p.getDebitAccount(), p.getCreditAccount(), p.getStatus(),
                p.getBranchId(), p.getCreatedAt()
        );
    }
}

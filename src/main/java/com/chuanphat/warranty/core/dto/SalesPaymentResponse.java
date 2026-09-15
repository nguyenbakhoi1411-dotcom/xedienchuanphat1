package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.accounting.enums.PaymentMethod;
import com.chuanphat.warranty.core.entity.SalesPayment;
import com.chuanphat.warranty.core.enums.SalesPaymentEntryType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record SalesPaymentResponse(
        Long id,
        Long orderId,
        PaymentMethod paymentMethod,
        BigDecimal amount,
        LocalDate paymentDate,
        Long bankAccountId,
        String referenceNo,
        String note,
        SalesPaymentEntryType entryType,
        boolean installmentDisbursement,
        OffsetDateTime createdAt
) {
    public static SalesPaymentResponse from(SalesPayment payment) {
        return new SalesPaymentResponse(
                payment.getId(),
                payment.getOrder().getId(),
                payment.getPaymentMethod(),
                payment.getAmount(),
                payment.getPaymentDate(),
                payment.getBankAccountId(),
                payment.getReferenceNo(),
                payment.getNote(),
                payment.getEntryType(),
                payment.isInstallmentDisbursement(),
                payment.getCreatedAt()
        );
    }
}

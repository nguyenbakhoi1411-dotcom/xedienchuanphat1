package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.accounting.enums.PaymentMethod;
import com.chuanphat.warranty.core.enums.PurchasePaymentEntryType;
import com.chuanphat.warranty.core.entity.PurchasePayment;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record PurchasePaymentDto(
        Long id,
        Long supplierInvoiceId,
        BigDecimal amount,
        PurchasePaymentEntryType entryType,
        LocalDate paymentDate,
        PaymentMethod paymentMethod,
        String referenceNo,
        String note,
        String createdBy,
        OffsetDateTime createdAt
) {
    public static PurchasePaymentDto from(PurchasePayment payment) {
        return new PurchasePaymentDto(
                payment.getId(),
                payment.getSupplierInvoice().getId(),
                payment.getAmount(),
                payment.getEntryType(),
                payment.getPaymentDate(),
                payment.getPaymentMethod(),
                payment.getReferenceNo(),
                payment.getNote(),
                payment.getCreatedBy(),
                payment.getCreatedAt());
    }
}

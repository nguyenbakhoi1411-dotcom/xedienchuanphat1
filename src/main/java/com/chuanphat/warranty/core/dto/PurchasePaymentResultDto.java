package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.enums.SupplierInvoicePaymentStatus;
import com.chuanphat.warranty.core.enums.SupplierInvoiceStatus;
import java.math.BigDecimal;

public record PurchasePaymentResultDto(
        PurchasePaymentDto payment,
        Long supplierInvoiceId,
        SupplierInvoiceStatus matchStatus,
        SupplierInvoicePaymentStatus paymentStatus,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        BigDecimal remainingAmount
) {
}

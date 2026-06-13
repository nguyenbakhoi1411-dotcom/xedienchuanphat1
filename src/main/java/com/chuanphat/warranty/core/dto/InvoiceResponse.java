package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.Invoice;
import com.chuanphat.warranty.core.enums.InvoiceStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record InvoiceResponse(
        Long id,
        String invoiceNo,
        Long orderId,
        String orderNo,
        LocalDate invoiceDate,
        BigDecimal totalAmount,
        BigDecimal vatAmount,
        InvoiceStatus status,
        String templateCode,
        String templateSnapshot,
        String electronicInvoiceProvider,
        String electronicInvoiceStatus,
        String electronicInvoiceRef,
        OffsetDateTime issuedAt,
        OffsetDateTime cancelledAt
) {
    public static InvoiceResponse from(Invoice invoice) {
        return new InvoiceResponse(
                invoice.getId(),
                invoice.getInvoiceNo(),
                invoice.getOrder().getId(),
                invoice.getOrder().getOrderNo(),
                invoice.getInvoiceDate(),
                invoice.getTotalAmount(),
                invoice.getVatAmount(),
                invoice.getStatus(),
                invoice.getTemplateCode(),
                invoice.getTemplateSnapshot(),
                invoice.getElectronicInvoiceProvider(),
                invoice.getElectronicInvoiceStatus(),
                invoice.getElectronicInvoiceRef(),
                invoice.getIssuedAt(),
                invoice.getCancelledAt()
        );
    }
}

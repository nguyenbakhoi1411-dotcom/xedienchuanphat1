package com.chuanphat.warranty.sales.dto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
public record TaxInvoiceResponse(
    Long id, String invoiceNo, String invoiceSerial, LocalDate invoiceDate,
    String invoiceType, String invoiceForm,
    Long customerId, String customerName, String customerAddress, String customerTaxCode,
    Long orderId, Long voucherId,
    BigDecimal taxBaseAmount, BigDecimal vatRate, BigDecimal vatAmount, BigDecimal totalAmount,
    String status, String assemblyStatus, String issueStatus,
    String taxAuthorityCode, String invalidHandling, Long originalInvoiceId,
    OffsetDateTime issuedAt, OffsetDateTime cancelledAt,
    List<TaxInvoiceLineResponse> lines
) {}

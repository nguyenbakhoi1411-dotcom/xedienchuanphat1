package com.chuanphat.warranty.sales.dto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
public record QuotationResponse(
    Long id, String quotationNo, LocalDate quotationDate, LocalDate validUntil,
    Long customerId, String customerCode, String customerName, String customerAddress,
    String taxCode, String contactPerson,
    String note, String paymentTerm, String status,
    BigDecimal totalAmount, BigDecimal totalDiscount, BigDecimal totalVat, BigDecimal grandTotal,
    Long convertedToOrder, Long salespersonId, String createdBy, LocalDateTime createdAt,
    List<QuotationLineResponse> lines
) {}

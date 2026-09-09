package com.chuanphat.warranty.sales.dto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
public record SalesVoucherResponse(
    Long id, String voucherNo, LocalDate voucherDate, LocalDate accountingDate,
    Long customerId, String customerName, String customerCode, String address,
    String phone, String mobilePhone,
    String salespersonName, String voucherType,
    String description, String paymentMethod, String paymentTerm,
    BigDecimal totalAmount, BigDecimal totalTaxAmount, BigDecimal totalPayment,
    String status, String invoiceIssueStatus, String taxAuthorityCode,
    Long warehouseId, OffsetDateTime postedAt,
    List<SalesVoucherLineResponse> items
) {}

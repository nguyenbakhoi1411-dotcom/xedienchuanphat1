package com.chuanphat.warranty.sales.dto;
import java.math.BigDecimal;
import java.time.LocalDate;
public record TaxInvoiceLineResponse(
    Long id, Integer lineNo,
    Long productId, String productCode, String productName, String unit,
    BigDecimal quantity, BigDecimal unitPrice, BigDecimal totalPrice,
    Boolean commercialDiscount,
    BigDecimal vatRate, BigDecimal vatAmount,
    LocalDate expiryDate, String serialNo, String note
) {}

package com.chuanphat.warranty.sales.dto;
import java.math.BigDecimal;
public record QuotationLineResponse(
    Long id, Integer lineNo,
    Long productId, String productCode, String productName, String unit, String unitName,
    BigDecimal quantity, BigDecimal unitPriceBeforeTax, BigDecimal unitPrice,
    BigDecimal discountRate, BigDecimal discountAmount,
    BigDecimal vatRate, BigDecimal vatAmount, BigDecimal totalPrice,
    Integer warrantyMonths, String note
) {}

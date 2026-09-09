package com.chuanphat.warranty.sales.dto;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
public record QuotationLineRequest(
    Long productId, String productCode, String productName, String unit, String unitName,
    @NotNull @Positive BigDecimal quantity,
    BigDecimal unitPriceBeforeTax, BigDecimal unitPrice,
    BigDecimal discountRate, BigDecimal vatRate,
    Integer warrantyMonths, String note
) {}

package com.chuanphat.warranty.sales.dto;
import java.math.BigDecimal;
public record SalesVoucherLineResponse(
    Long id, Integer lineNo,
    Long productId, String productCode, String productName,
    String unit, String warehouseName,
    BigDecimal quantity, BigDecimal unitPrice,
    BigDecimal discountRate, BigDecimal discountAmount,
    BigDecimal vatRate, BigDecimal vatAmount, BigDecimal totalPrice,
    String accountReceivable, String revenueAccount,
    Boolean promotionItem, Boolean commercialDiscount, String serialNo
) {}

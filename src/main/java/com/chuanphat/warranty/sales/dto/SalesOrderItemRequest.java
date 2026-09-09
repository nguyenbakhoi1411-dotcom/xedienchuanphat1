package com.chuanphat.warranty.sales.dto;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
public record SalesOrderItemRequest(
    Long productId, String productCode, String productName, String unit,
    @NotNull @Positive BigDecimal quantity,
    BigDecimal unitPrice, BigDecimal discountRate, BigDecimal vatRate,
    Long warehouseId,
    Boolean promotionItem, Boolean commercialDiscount,
    String accountReceivable, String revenueAccount, Long serialId, String serialNo, Long batchId, String note
) {}

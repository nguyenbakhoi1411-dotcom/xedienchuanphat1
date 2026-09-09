package com.chuanphat.warranty.sales.dto;
import java.math.BigDecimal;
public record SalesOrderItemResponse(
    Long id, Integer lineNo,
    Long productId, String productCode, String productName, String unit,
    BigDecimal quantity, BigDecimal quantitySold, BigDecimal quantityExported, BigDecimal unitPrice,
    BigDecimal discountRate, BigDecimal discountAmount,
    BigDecimal vatRate, BigDecimal vatAmount, BigDecimal totalPrice,
    Long warehouseId, String warehouseName,
    Boolean promotionItem, Boolean commercialDiscount,
    String accountReceivable, String revenueAccount, Long serialId, String serialNo, Long batchId, String batchCode, String note
) {}

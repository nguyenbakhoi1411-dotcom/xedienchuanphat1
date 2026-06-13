package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.SalesOrderItem;
import java.math.BigDecimal;

public record SalesOrderItemResponse(
        Long id,
        Long productId,
        String productName,
        Long serialId,
        String serialNumber,
        int quantity,
        int returnedQuantity,
        BigDecimal unitPrice,
        BigDecimal listPrice,
        Long pricePolicyId,
        String pricePolicyCode,
        String pricePolicyName,
        BigDecimal policyDiscountAmount,
        BigDecimal lineTotal
) {
    public static SalesOrderItemResponse from(SalesOrderItem item) {
        return new SalesOrderItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getProductName(),
                item.getSerial() == null ? null : item.getSerial().getId(),
                item.getSerial() == null ? null : item.getSerial().getSerialNumber(),
                item.getQuantity(),
                item.getReturnedQuantity(),
                item.getUnitPrice(),
                item.getListPrice(),
                item.getPricePolicyId(),
                item.getPricePolicyCode(),
                item.getPricePolicyName(),
                item.getPolicyDiscountAmount(),
                item.getLineTotal()
        );
    }
}

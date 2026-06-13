package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.SalesReturnItem;
import com.chuanphat.warranty.core.enums.ReturnSerialDisposition;
import java.math.BigDecimal;

public record SalesReturnItemResponse(
        Long id,
        Long orderItemId,
        Long productId,
        String productName,
        Long serialId,
        String serialNumber,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal lineAmount,
        ReturnSerialDisposition serialDisposition
) {
    public static SalesReturnItemResponse from(SalesReturnItem item) {
        return new SalesReturnItemResponse(
                item.getId(),
                item.getOrderItem().getId(),
                item.getProduct().getId(),
                item.getProduct().getProductName(),
                item.getSerial() == null ? null : item.getSerial().getId(),
                item.getSerial() == null ? null : item.getSerial().getSerialNumber(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getLineAmount(),
                item.getSerialDisposition()
        );
    }
}

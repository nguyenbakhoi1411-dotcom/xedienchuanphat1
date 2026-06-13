package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.QuotationItem;
import java.math.BigDecimal;

public record QuotationItemResponse(
        Long id,
        Long productId,
        String productName,
        Long serialId,
        String serialNumber,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal
) {
    public static QuotationItemResponse from(QuotationItem item) {
        return new QuotationItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getProductName(),
                item.getSerial() == null ? null : item.getSerial().getId(),
                item.getSerial() == null ? null : item.getSerial().getSerialNumber(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getLineTotal()
        );
    }
}

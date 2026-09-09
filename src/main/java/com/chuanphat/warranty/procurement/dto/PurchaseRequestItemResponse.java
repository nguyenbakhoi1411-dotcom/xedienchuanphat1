package com.chuanphat.warranty.procurement.dto;

import com.chuanphat.warranty.core.entity.PurchaseRequestItem;
import java.math.BigDecimal;

public record PurchaseRequestItemResponse(
    Long id,
    Long productId,
    String productName,
    BigDecimal quantity,
    String unit,
    BigDecimal estimatedPrice,
    String note
) {
    public static PurchaseRequestItemResponse from(PurchaseRequestItem item) {
        return new PurchaseRequestItemResponse(
            item.getId(),
            item.getProduct() != null ? item.getProduct().getId() : null,
            item.getProductName(),
            item.getQuantity(),
            item.getUnit(),
            item.getEstimatedPrice(),
            item.getNote()
        );
    }
}

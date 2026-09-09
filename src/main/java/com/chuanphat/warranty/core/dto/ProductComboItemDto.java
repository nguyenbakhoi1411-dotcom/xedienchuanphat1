package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.ProductComboItem;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ProductComboItemDto(
        Long id,
        @NotNull Long detailProductId,
        @NotNull @DecimalMin("0.01") BigDecimal quantity,
        String unit
) {
    public static ProductComboItemDto from(ProductComboItem item) {
        return new ProductComboItemDto(
                item.getId(),
                item.getDetailProduct().getId(),
                item.getQuantity(),
                item.getUnit()
        );
    }
}

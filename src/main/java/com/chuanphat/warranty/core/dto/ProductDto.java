package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.RecordStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.fasterxml.jackson.annotation.JsonView;

public record ProductDto(
        Long id,
        @NotBlank String productCode,
        @NotBlank String productName,
        @NotNull ProductCategory category,
        @NotBlank String brand,
        String model,
        Map<String, Object> attributes,
        @JsonView(DataView.AdminView.class) @NotNull @DecimalMin("0.00") BigDecimal importPrice,
        @JsonView(DataView.SalesView.class) @NotNull @DecimalMin("0.01") BigDecimal salePrice,
        @Min(0) int warrantyMonths,
        RecordStatus status,
        String origin,
        String purchaseDescription,
        String salesDescription,
        String specialItemType,
        String warrantyPeriod,
        List<ProductComboItemDto> comboItems
) {
    public static ProductDto from(Product product) {
        return new ProductDto(
                product.getId(),
                product.getProductCode(),
                product.getProductName(),
                product.getCategory(),
                product.getBrand(),
                product.getModel(),
                product.getAttributes(),
                product.getImportPrice(),
                product.getSalePrice(),
                product.getWarrantyMonths(),
                product.getStatus(),
                product.getOrigin(),
                product.getPurchaseDescription(),
                product.getSalesDescription(),
                product.getSpecialItemType(),
                product.getWarrantyPeriod(),
                product.getComboItems() != null ? product.getComboItems().stream().map(ProductComboItemDto::from).collect(Collectors.toList()) : null
        );
    }
}

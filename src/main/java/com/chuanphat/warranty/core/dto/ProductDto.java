package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.RecordStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ProductDto(
        Long id,
        @NotBlank String productCode,
        @NotBlank String productName,
        @NotNull ProductCategory category,
        @NotBlank String brand,
        String model,
        String color,
        String batteryCapacity,
        String motorPower,
        @NotNull @DecimalMin("0.00") BigDecimal importPrice,
        @NotNull @DecimalMin("0.01") BigDecimal salePrice,
        @Min(0) int warrantyMonths,
        RecordStatus status
) {
    public static ProductDto from(Product product) {
        return new ProductDto(
                product.getId(),
                product.getProductCode(),
                product.getProductName(),
                product.getCategory(),
                product.getBrand(),
                product.getModel(),
                product.getColor(),
                product.getBatteryCapacity(),
                product.getMotorPower(),
                product.getImportPrice(),
                product.getSalePrice(),
                product.getWarrantyMonths(),
                product.getStatus()
        );
    }
}

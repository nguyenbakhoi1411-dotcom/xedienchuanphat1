package com.chuanphat.warranty.settings.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record SystemSettingsRequest(
        @NotBlank String companyName,
        String companyAddress,
        String companyPhone,
        String taxCode,
        String logoUrl,
        String invoiceTemplate,
        String defaultWarrantyPolicy,
        @Min(0) int lowStockThreshold
) {
}

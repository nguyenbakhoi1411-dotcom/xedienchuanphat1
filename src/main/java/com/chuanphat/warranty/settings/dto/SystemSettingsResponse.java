package com.chuanphat.warranty.settings.dto;

import java.time.OffsetDateTime;

public record SystemSettingsResponse(
        String companyName,
        String companyAddress,
        String companyPhone,
        String taxCode,
        String logoUrl,
        String invoiceTemplate,
        String defaultWarrantyPolicy,
        int lowStockThreshold,
        OffsetDateTime updatedAt
) {
}

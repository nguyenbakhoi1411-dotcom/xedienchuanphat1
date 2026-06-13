package com.chuanphat.warranty.marketing.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record MarketingCampaignRequest(
        @NotBlank String name,
        @NotBlank String source,
        LocalDate startDate,
        LocalDate endDate,
        @NotNull @DecimalMin("0.00") BigDecimal budget,
        @NotBlank String status,
        String note
) {
}

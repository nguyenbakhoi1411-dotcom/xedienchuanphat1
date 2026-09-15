package com.chuanphat.warranty.core.dto;

import java.math.BigDecimal;

public record SupplierPayableAgingDto(
        Long supplierId,
        String supplierName,
        BigDecimal days0To30,
        BigDecimal days31To60,
        BigDecimal daysOver60,
        BigDecimal totalConfirmedDebt,
        BigDecimal holdForReviewAmount
) {
}

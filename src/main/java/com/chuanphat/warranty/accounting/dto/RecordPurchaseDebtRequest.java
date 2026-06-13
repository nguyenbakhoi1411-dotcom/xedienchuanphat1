package com.chuanphat.warranty.accounting.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record RecordPurchaseDebtRequest(
        @NotBlank String purchaseOrderNo,
        @NotNull LocalDate purchaseDate,
        @NotNull Long supplierId,
        @NotBlank String supplierName,
        @NotNull @DecimalMin("0.01") BigDecimal totalAmount,
        String description
) {
}

package com.chuanphat.warranty.core.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreateQuotationRequest(
        @NotNull Long branchId,
        @NotNull Long customerId,
        @NotNull Long employeeId,
        LocalDate quotationDate,
        @NotNull LocalDate validUntil,
        @NotNull @DecimalMin("0.00") BigDecimal discountAmount,
        String voucherCode,
        String note,
        @Valid @NotEmpty List<CreateQuotationItemRequest> items
) {
}

package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.enums.InstallmentStatus;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateInstallmentStatusRequest(
        @NotNull InstallmentStatus status,
        BigDecimal disbursedAmount,
        LocalDate paymentDate,
        Long bankAccountId,
        String referenceNo,
        String note
) {
}

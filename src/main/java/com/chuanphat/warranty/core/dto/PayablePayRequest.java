package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

/** Request thanh toan 1 cong no (co the la mot phan hoac toan bo). */
public record PayablePayRequest(
        @NotNull Long payableId,
        @NotNull @Min(1) BigDecimal amount,
        LocalDate paymentDate,
        String paymentMethod,   // CASH | BANK_TRANSFER | OFFSET
        String bankRef,
        String note
) {}

package com.chuanphat.warranty.cash.dto;

import com.chuanphat.warranty.cash.entity.CashVoucherType;
import com.chuanphat.warranty.cash.entity.ObjectType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record CreateCashVoucherRequest(
    @NotNull CashVoucherType voucherType,
    @NotNull LocalDate voucherDate,
    ObjectType objectType,
    Long customerId,
    Long supplierId,
    String description,
    String cashAccountCode,
    @Valid @NotEmpty List<CashVoucherLineRequest> lines
) {}

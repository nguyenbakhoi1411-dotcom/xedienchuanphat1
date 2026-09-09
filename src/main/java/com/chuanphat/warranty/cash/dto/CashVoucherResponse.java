package com.chuanphat.warranty.cash.dto;

import com.chuanphat.warranty.cash.entity.CashVoucherStatus;
import com.chuanphat.warranty.cash.entity.CashVoucherType;
import com.chuanphat.warranty.cash.entity.ObjectType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record CashVoucherResponse(
    Long id,
    String voucherNo,
    CashVoucherType voucherType,
    LocalDate voucherDate,
    ObjectType objectType,
    String objectName,
    BigDecimal totalAmount,
    CashVoucherStatus status,
    Long branchId,
    Long journalEntryId,
    List<LineResponse> lines,
    String createdBy,
    OffsetDateTime createdAt
) {
    public record LineResponse(
        Long id,
        Integer lineNo,
        String accountCode,
        BigDecimal amount,
        String description,
        Long costCenterId
    ) {}
}

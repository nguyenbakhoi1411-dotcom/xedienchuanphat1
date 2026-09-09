package com.chuanphat.warranty.accounting.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record OpeningBalanceResponse(
        Long id,
        Long periodId,
        String accountCode,
        Long customerId,
        String customerName,
        Long supplierId,
        String supplierName,
        BigDecimal debitBalance,
        BigDecimal creditBalance,
        String note,
        Long branchId,
        String createdBy,
        OffsetDateTime lockedAt
) {}

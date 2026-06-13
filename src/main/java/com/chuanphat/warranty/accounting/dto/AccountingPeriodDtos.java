package com.chuanphat.warranty.accounting.dto;

import com.chuanphat.warranty.accounting.enums.AccountingPeriodStatus;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public class AccountingPeriodDtos {

    public record CreatePeriodRequest(
        String periodCode,
        Integer month,
        Integer quarter,
        Integer year,
        LocalDate startDate,
        LocalDate endDate,
        Long branchId,
        String note
    ) {}

    public record PeriodResponse(
        Long id,
        String periodCode,
        Integer month,
        Integer quarter,
        Integer year,
        LocalDate startDate,
        LocalDate endDate,
        AccountingPeriodStatus status,
        Long branchId,
        String lockedBy,
        OffsetDateTime lockedAt,
        String unlockedBy,
        OffsetDateTime unlockedAt,
        String note,
        OffsetDateTime createdAt,
        String createdBy
    ) {}
    
    public record LockUnlockRequest(String note) {}
}

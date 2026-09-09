package com.chuanphat.warranty.accounting.dto;

import com.chuanphat.warranty.accounting.entity.RecurringJournal;
import com.chuanphat.warranty.core.enums.RecordStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RecurringJournalDto(
        Long id,
        String name,
        String description,
        String debitAccount,
        String creditAccount,
        BigDecimal amount,
        LocalDate startDate,
        LocalDate endDate,
        LocalDate lastRunDate,
        String frequency,
        Long costCenterId,
        String costCenterName,
        RecordStatus status
) {
    public static RecurringJournalDto from(RecurringJournal r) {
        if (r == null) return null;
        return new RecurringJournalDto(
                r.getId(),
                r.getName(),
                r.getDescription(),
                r.getDebitAccount(),
                r.getCreditAccount(),
                r.getAmount(),
                r.getStartDate(),
                r.getEndDate(),
                r.getLastRunDate(),
                r.getFrequency(),
                r.getCostCenter() != null ? r.getCostCenter().getId() : null,
                r.getCostCenter() != null ? r.getCostCenter().getName() : null,
                r.getStatus()
        );
    }
}

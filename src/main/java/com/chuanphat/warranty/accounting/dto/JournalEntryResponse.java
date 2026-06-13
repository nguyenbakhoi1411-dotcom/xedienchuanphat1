package com.chuanphat.warranty.accounting.dto;

import com.chuanphat.warranty.accounting.entity.JournalEntry;
import com.chuanphat.warranty.accounting.enums.JournalEntryStatus;
import com.chuanphat.warranty.accounting.enums.JournalReferenceType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record JournalEntryResponse(
        Long id,
        LocalDate entryDate,
        JournalReferenceType referenceType,
        String referenceId,
        String description,
        JournalEntryStatus status,
        String createdBy,
        String postedBy,
        BigDecimal totalDebit,
        BigDecimal totalCredit,
        List<JournalEntryLineResponse> lines
) {
    public static JournalEntryResponse from(JournalEntry entry) {
        return new JournalEntryResponse(
                entry.getId(),
                entry.getEntryDate(),
                entry.getReferenceType(),
                entry.getReferenceId(),
                entry.getDescription(),
                entry.getStatus(),
                entry.getCreatedBy(),
                entry.getPostedBy(),
                entry.getTotalDebit(),
                entry.getTotalCredit(),
                entry.getLines().stream().map(JournalEntryLineResponse::from).toList()
        );
    }

    public static JournalEntryResponse summary(JournalEntry entry) {
        return new JournalEntryResponse(
                entry.getId(),
                entry.getEntryDate(),
                entry.getReferenceType(),
                entry.getReferenceId(),
                entry.getDescription(),
                entry.getStatus(),
                entry.getCreatedBy(),
                entry.getPostedBy(),
                entry.getTotalDebit(),
                entry.getTotalCredit(),
                List.of()
        );
    }
}

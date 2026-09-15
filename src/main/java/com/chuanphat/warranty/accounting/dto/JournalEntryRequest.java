package com.chuanphat.warranty.accounting.dto;

import com.chuanphat.warranty.accounting.enums.JournalReferenceType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record JournalEntryRequest(
        @NotNull LocalDate entryDate,
        @NotNull JournalReferenceType referenceType,
        String referenceId,
        String description,
        Integer adjustmentForYear,
        Integer adjustmentForMonth,
        @Valid @NotEmpty List<JournalEntryLineRequest> lines
) {
    public JournalEntryRequest(
            LocalDate entryDate,
            JournalReferenceType referenceType,
            String referenceId,
            String description,
            List<JournalEntryLineRequest> lines
    ) {
        this(entryDate, referenceType, referenceId, description, null, null, lines);
    }
}

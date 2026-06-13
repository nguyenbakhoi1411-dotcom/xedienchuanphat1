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
        @Valid @NotEmpty List<JournalEntryLineRequest> lines
) {
}

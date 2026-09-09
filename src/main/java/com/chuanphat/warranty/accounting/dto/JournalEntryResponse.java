package com.chuanphat.warranty.accounting.dto;

import com.chuanphat.warranty.accounting.entity.JournalEntry;
import com.chuanphat.warranty.accounting.enums.JournalEntryStatus;
import com.chuanphat.warranty.accounting.enums.JournalReferenceType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record JournalEntryResponse(
        Long id,
        String entryCode,
        LocalDate entryDate,
        JournalReferenceType referenceType,
        String referenceId,
        String referenceNo,
        String sourceType,
        JournalEntryStatus status,
        Long branchId,
        Long periodId,
        String description,
        String createdBy,
        String postedBy,
        BigDecimal totalDebit,
        BigDecimal totalCredit,
        List<JournalEntryLineResponse> lines
) {
    public static JournalEntryResponse from(JournalEntry entry, Long periodId) {
        return new JournalEntryResponse(
                entry.getId(),
                entry.getEntryCode(),
                entry.getEntryDate(),
                entry.getReferenceType(),
                entry.getReferenceId(),
                entry.getReferenceId(), // referenceNo
                mapSourceType(entry),
                entry.getStatus(),
                entry.getBranchId(),
                periodId,
                entry.getDescription(),
                entry.getCreatedBy(),
                entry.getPostedBy(),
                entry.getTotalDebit(),
                entry.getTotalCredit(),
                entry.getLines().stream().map(JournalEntryLineResponse::from).toList()
        );
    }

    public static JournalEntryResponse summary(JournalEntry entry, Long periodId) {
        return new JournalEntryResponse(
                entry.getId(),
                entry.getEntryCode(),
                entry.getEntryDate(),
                entry.getReferenceType(),
                entry.getReferenceId(),
                entry.getReferenceId(), // referenceNo
                mapSourceType(entry),
                entry.getStatus(),
                entry.getBranchId(),
                periodId,
                entry.getDescription(),
                entry.getCreatedBy(),
                entry.getPostedBy(),
                entry.getTotalDebit(),
                entry.getTotalCredit(),
                List.of()
        );
    }

    public static JournalEntryResponse from(JournalEntry entry) {
        return from(entry, null);
    }

    public static JournalEntryResponse summary(JournalEntry entry) {
        return summary(entry, null);
    }

    public static String mapSourceType(JournalEntry entry) {
        if (entry.getReferenceType() == JournalReferenceType.RECEIPT_VOUCHER || 
            entry.getReferenceType() == JournalReferenceType.PAYMENT_VOUCHER) {
            boolean hasBank = entry.getLines() != null && entry.getLines().stream()
                    .anyMatch(line -> line.getAccount() != null && 
                                     line.getAccount().getAccountCode() != null && 
                                     line.getAccount().getAccountCode().startsWith("112"));
            return hasBank ? "BANK" : "CASH";
        }
        if (entry.getReferenceType() == null) {
            return "MANUAL";
        }
        switch (entry.getReferenceType()) {
            case SALES_ORDER:
            case SALES_RETURN:
            case SERVICE_TICKET:
            case DEPOSIT:
                return "SALES";
            case PURCHASE_ORDER:
            case PURCHASE_RETURN:
                return "PURCHASE";
            case PAYROLL:
                return "PAYROLL";
            default:
                return "MANUAL";
        }
    }
}

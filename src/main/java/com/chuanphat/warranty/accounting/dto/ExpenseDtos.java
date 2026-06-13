package com.chuanphat.warranty.accounting.dto;

import com.chuanphat.warranty.accounting.entity.Expense;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public class ExpenseDtos {

    public record ExpenseResponse(
            Long id,
            String expenseCode,
            LocalDate expenseDate,
            String category,
            BigDecimal amount,
            String description,
            Long branchId,
            String accountCode,
            String contraAccount,
            Long journalEntryId,
            String status,
            String createdBy,
            OffsetDateTime createdAt,
            String postedBy,
            OffsetDateTime postedAt
    ) {
        public static ExpenseResponse from(Expense e) {
            return new ExpenseResponse(
                    e.getId(), e.getExpenseCode(), e.getExpenseDate(),
                    e.getCategory(), e.getAmount(), e.getDescription(),
                    e.getBranchId(), e.getAccountCode(), e.getContraAccount(),
                    e.getJournalEntryId(), e.getStatus(),
                    e.getCreatedBy(), e.getCreatedAt(),
                    e.getPostedBy(), e.getPostedAt()
            );
        }
    }

    public record CreateExpenseRequest(
            LocalDate expenseDate,
            String category,            // SALARY | RENT | UTILITIES | MARKETING | MAINTENANCE | OTHER
            BigDecimal amount,
            String description,
            Long branchId,
            String accountCode,         // TK Nợ (null → 642)
            String contraAccount        // TK Có (null → 111)
    ) {}
}

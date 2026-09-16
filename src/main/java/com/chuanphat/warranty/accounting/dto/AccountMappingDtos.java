package com.chuanphat.warranty.accounting.dto;

import com.chuanphat.warranty.accounting.entity.AccountMapping;
import com.chuanphat.warranty.accounting.entity.AccountMappingHistory;
import com.chuanphat.warranty.accounting.enums.AccountMappingTransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public final class AccountMappingDtos {
    private AccountMappingDtos() {
    }

    public record UpdateAccountMappingRequest(
            @NotNull AccountMappingTransactionType transactionType,
            @NotBlank String accountCode
    ) {
    }

    public record AccountMappingResponse(
            AccountMappingTransactionType transactionType,
            String accountCode,
            String updatedBy,
            OffsetDateTime updatedAt
    ) {
        public static AccountMappingResponse from(AccountMapping mapping) {
            return new AccountMappingResponse(
                    mapping.getTransactionType(),
                    mapping.getAccountCode(),
                    mapping.getUpdatedBy(),
                    mapping.getUpdatedAt()
            );
        }
    }

    public record AccountMappingHistoryResponse(
            AccountMappingTransactionType transactionType,
            String oldAccountCode,
            String newAccountCode,
            String changedBy,
            OffsetDateTime changedAt
    ) {
        public static AccountMappingHistoryResponse from(AccountMappingHistory history) {
            return new AccountMappingHistoryResponse(
                    history.getTransactionType(),
                    history.getOldAccountCode(),
                    history.getNewAccountCode(),
                    history.getChangedBy(),
                    history.getChangedAt()
            );
        }
    }
}

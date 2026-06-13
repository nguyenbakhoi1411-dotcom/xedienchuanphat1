package com.chuanphat.warranty.accounting.dto;

import com.chuanphat.warranty.accounting.entity.ChartOfAccount;
import com.chuanphat.warranty.accounting.enums.AccountType;

public record ChartOfAccountResponse(
        Long id,
        String accountCode,
        String accountName,
        AccountType accountType,
        Long parentAccountId,
        boolean active,
        String description
) {
    public static ChartOfAccountResponse from(ChartOfAccount account) {
        return new ChartOfAccountResponse(
                account.getId(),
                account.getAccountCode(),
                account.getAccountName(),
                account.getAccountType(),
                account.getParentAccount() == null ? null : account.getParentAccount().getId(),
                account.isActive(),
                account.getDescription()
        );
    }
}

package com.chuanphat.warranty.accounting.dto;

import com.chuanphat.warranty.accounting.entity.ChartOfAccount;
import com.chuanphat.warranty.accounting.enums.AccountType;

public record ChartOfAccountResponse(
        Long id,
        String accountCode,
        String accountName,
        AccountType accountType,
        Long parentAccountId,
        Long parentId, // Alias for parentAccountId
        Integer level,
        Boolean isDetail,
        boolean active,
        String description
) {
    public static ChartOfAccountResponse from(ChartOfAccount account) {
        return from(account, java.util.Collections.emptySet());
    }

    public static ChartOfAccountResponse from(ChartOfAccount account, java.util.Set<Long> parentIds) {
        boolean isDetail = !parentIds.contains(account.getId());
        return new ChartOfAccountResponse(
                account.getId(),
                account.getAccountCode(),
                account.getAccountName(),
                account.getAccountType(),
                account.getParentAccount() == null ? null : account.getParentAccount().getId(),
                account.getParentAccount() == null ? null : account.getParentAccount().getId(), // parentId
                calculateLevel(account),
                isDetail,
                account.isActive(),
                account.getDescription()
        );
    }

    private static int calculateLevel(ChartOfAccount account) {
        int level = 1;
        ChartOfAccount parent = account.getParentAccount();
        while (parent != null) {
            level++;
            parent = parent.getParentAccount();
        }
        return level;
    }
}

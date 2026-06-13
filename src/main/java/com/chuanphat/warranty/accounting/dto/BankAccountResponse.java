package com.chuanphat.warranty.accounting.dto;

import com.chuanphat.warranty.accounting.entity.BankAccount;
import java.math.BigDecimal;

public record BankAccountResponse(
        Long id,
        String bankName,
        String accountNumber,
        String accountHolder,
        BigDecimal currentBalance,
        boolean active
) {
    public static BankAccountResponse from(BankAccount account) {
        return new BankAccountResponse(
                account.getId(),
                account.getBankName(),
                account.getAccountNumber(),
                account.getAccountHolder(),
                account.getCurrentBalance(),
                account.isActive()
        );
    }
}

package com.chuanphat.warranty.accounting.dto;

import com.chuanphat.warranty.accounting.entity.CashBook;
import com.chuanphat.warranty.accounting.enums.CashBookType;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CashBookResponse(
        Long id,
        CashBookType type,
        LocalDate transactionDate,
        BigDecimal amountIn,
        BigDecimal amountOut,
        BigDecimal balanceAfter,
        Long bankAccountId,
        String sourceNo,
        String description
) {
    public static CashBookResponse from(CashBook cashBook) {
        Long bankAccountId = cashBook.getBankAccount() == null ? null : cashBook.getBankAccount().getId();
        return new CashBookResponse(
                cashBook.getId(),
                cashBook.getType(),
                cashBook.getTransactionDate(),
                cashBook.getAmountIn(),
                cashBook.getAmountOut(),
                cashBook.getBalanceAfter(),
                bankAccountId,
                cashBook.getSourceNo(),
                cashBook.getDescription()
        );
    }
}

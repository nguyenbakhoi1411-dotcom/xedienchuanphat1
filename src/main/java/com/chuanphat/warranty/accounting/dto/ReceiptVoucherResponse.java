package com.chuanphat.warranty.accounting.dto;

import com.chuanphat.warranty.accounting.entity.CashBook;
import com.chuanphat.warranty.accounting.enums.PaymentMethod;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ReceiptVoucherResponse(
        Long id,
        String voucherNo,
        LocalDate receiptDate,
        String customerName,
        BigDecimal amount,
        PaymentMethod paymentMethod,
        String status,
        String reason
) {
    public static ReceiptVoucherResponse from(CashBook cashBook) {
        return new ReceiptVoucherResponse(
                cashBook.getId(),
                cashBook.getSourceNo(),
                cashBook.getTransactionDate(),
                "",
                cashBook.getAmountIn(),
                cashBook.getBankAccount() == null ? PaymentMethod.CASH : PaymentMethod.BANK_TRANSFER,
                "POSTED",
                cashBook.getDescription()
        );
    }
}

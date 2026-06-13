package com.chuanphat.warranty.accounting.dto;

import com.chuanphat.warranty.accounting.entity.CashBook;
import com.chuanphat.warranty.accounting.enums.PaymentMethod;
import java.math.BigDecimal;
import java.time.LocalDate;

public record PaymentVoucherResponse(
        Long id,
        String voucherNo,
        LocalDate paymentDate,
        String supplierName,
        BigDecimal amount,
        PaymentMethod paymentMethod,
        String status,
        String reason
) {
    public static PaymentVoucherResponse from(CashBook cashBook) {
        return new PaymentVoucherResponse(
                cashBook.getId(),
                cashBook.getSourceNo(),
                cashBook.getTransactionDate(),
                "",
                cashBook.getAmountOut(),
                cashBook.getBankAccount() == null ? PaymentMethod.CASH : PaymentMethod.BANK_TRANSFER,
                "POSTED",
                cashBook.getDescription()
        );
    }
}

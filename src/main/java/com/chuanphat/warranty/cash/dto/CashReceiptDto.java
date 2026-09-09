package com.chuanphat.warranty.cash.dto;

import com.chuanphat.warranty.cash.entity.CashReceipt;
import com.chuanphat.warranty.cash.entity.ReceiptType;
import com.chuanphat.warranty.cash.entity.VoucherStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record CashReceiptDto(
        Long id,
        String voucherNo,
        LocalDate receiptDate,
        String payerName,
        Long customerId,
        ReceiptType receiptType,
        Long salesOrderId,
        String salesOrderNo,
        BigDecimal amount,
        String description,
        String createdBy,
        String debitAccount,
        String creditAccount,
        VoucherStatus status,
        Long branchId,
        OffsetDateTime createdAt
) {
    public static CashReceiptDto from(CashReceipt r, String salesOrderNo) {
        return new CashReceiptDto(
                r.getId(), r.getVoucherNo(), r.getReceiptDate(),
                r.getPayerName(), r.getCustomerId(), r.getReceiptType(),
                r.getSalesOrderId(), salesOrderNo,
                r.getAmount(), r.getDescription(), r.getCreatedBy(),
                r.getDebitAccount(), r.getCreditAccount(), r.getStatus(),
                r.getBranchId(), r.getCreatedAt()
        );
    }
}

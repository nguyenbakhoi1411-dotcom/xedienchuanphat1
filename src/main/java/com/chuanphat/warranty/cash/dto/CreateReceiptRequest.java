package com.chuanphat.warranty.cash.dto;

import com.chuanphat.warranty.cash.entity.ReceiptType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateReceiptRequest(
        @NotNull LocalDate receiptDate,
        String payerName,
        Long customerId,
        @NotNull ReceiptType receiptType,
        Long salesOrderId,
        @NotNull @DecimalMin("1000") BigDecimal amount,
        String description,
        Long branchId,
        boolean confirmNow   // true = CONFIRMED + ghi journal; false = DRAFT
) {}

package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.accounting.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record CreateSalesOrderRequest(
        @NotNull Long branchId,
        @NotNull Long customerId,
        @NotNull Long employeeId,
        LocalDate orderDate,
        @DecimalMin("0.00") BigDecimal discountAmount,
        @DecimalMin("0.00") BigDecimal paidAmount,
        PaymentMethod paymentMethod,
        Long bankAccountId,
        String voucherCode,
        String note,
        Boolean confirm,
        OffsetDateTime reservationUntil,
        Boolean issueInvoice,
        @Valid List<PaymentEntryRequest> payments,
        @Valid @NotEmpty List<CreateSalesOrderItemRequest> items
) {
}

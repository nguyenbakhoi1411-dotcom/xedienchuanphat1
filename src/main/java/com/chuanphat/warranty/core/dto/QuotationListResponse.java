package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.enums.QuotationStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record QuotationListResponse(
        Long id,
        String quotationNo,
        Long branchId,
        Long customerId,
        Long employeeId,
        LocalDate quotationDate,
        LocalDate validUntil,
        QuotationStatus status,
        BigDecimal subtotal,
        BigDecimal discountAmount,
        String voucherCode,
        BigDecimal totalAmount,
        String note,
        OffsetDateTime createdAt,
        long itemCount
) {
}

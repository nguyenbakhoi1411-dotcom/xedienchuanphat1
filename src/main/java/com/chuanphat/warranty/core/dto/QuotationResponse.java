package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.Quotation;
import com.chuanphat.warranty.core.enums.QuotationStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record QuotationResponse(
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
        List<QuotationItemResponse> items
) {
    public static QuotationResponse from(Quotation quotation) {
        return new QuotationResponse(
                quotation.getId(),
                quotation.getQuotationNo(),
                quotation.getBranchId(),
                quotation.getCustomerId(),
                quotation.getEmployeeId(),
                quotation.getQuotationDate(),
                quotation.getValidUntil(),
                quotation.getStatus(),
                quotation.getSubtotal(),
                quotation.getDiscountAmount(),
                quotation.getVoucherCode(),
                quotation.getTotalAmount(),
                quotation.getNote(),
                quotation.getCreatedAt(),
                quotation.getItems().stream().map(QuotationItemResponse::from).toList()
        );
    }
}

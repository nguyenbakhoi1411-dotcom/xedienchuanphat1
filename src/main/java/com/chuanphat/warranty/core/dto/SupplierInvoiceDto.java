package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.SupplierInvoice;
import com.chuanphat.warranty.core.entity.SupplierInvoiceItem;
import com.chuanphat.warranty.core.enums.SupplierInvoiceStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record SupplierInvoiceDto(
        Long id,
        Long purchaseOrderId,
        String invoiceNumber,
        LocalDate invoiceDate,
        Long supplierId,
        Long branchId,
        SupplierInvoiceStatus status,
        BigDecimal totalAmount,
        String matchDetails,
        String resolvedBy,
        OffsetDateTime resolvedAt,
        String resolveReason,
        String createdBy,
        OffsetDateTime createdAt,
        List<SupplierInvoiceItemDto> items
) {
    public record SupplierInvoiceItemDto(
            Long id,
            Long productId,
            int quantity,
            BigDecimal unitPrice
    ) {
        public static SupplierInvoiceItemDto from(SupplierInvoiceItem item) {
            return new SupplierInvoiceItemDto(item.getId(), item.getProductId(), item.getQuantity(), item.getUnitPrice());
        }
    }

    public static SupplierInvoiceDto from(SupplierInvoice invoice) {
        return new SupplierInvoiceDto(
                invoice.getId(),
                invoice.getPurchaseOrderId(),
                invoice.getInvoiceNumber(),
                invoice.getInvoiceDate(),
                invoice.getSupplier().getId(),
                invoice.getBranchId(),
                invoice.getStatus(),
                invoice.getTotalAmount(),
                invoice.getMatchDetails(),
                invoice.getResolvedBy(),
                invoice.getResolvedAt(),
                invoice.getResolveReason(),
                invoice.getCreatedBy(),
                invoice.getCreatedAt(),
                invoice.getItems().stream().map(SupplierInvoiceItemDto::from).toList());
    }
}

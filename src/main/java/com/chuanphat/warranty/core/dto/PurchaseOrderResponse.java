package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.PurchaseOrder;
import com.chuanphat.warranty.core.enums.PurchaseOrderStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

/** Legacy DTO — replaced by PurchaseOrderDto, kept for backward compatibility. */
public record PurchaseOrderResponse(
        Long id,
        String purchaseOrderNo,
        Long supplierId,
        String supplierName,
        Long branchId,
        LocalDate purchaseDate,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        PurchaseOrderStatus status
) {
    public static PurchaseOrderResponse from(PurchaseOrder order) {
        return new PurchaseOrderResponse(
                order.getId(),
                order.getPurchaseOrderNo(),
                order.getSupplier().getId(),
                order.getSupplier().getName(),
                order.getBranchId(),
                order.getPurchaseDate(),
                order.getTotalAmount(),
                order.getPaidAmount(),
                order.getStatus()
        );
    }
}

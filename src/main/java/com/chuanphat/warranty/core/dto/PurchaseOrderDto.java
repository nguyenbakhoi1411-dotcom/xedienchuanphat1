package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.PurchaseOrder;
import com.chuanphat.warranty.core.entity.PurchaseOrderItem;
import com.chuanphat.warranty.core.enums.PurchaseOrderStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record PurchaseOrderDto(
        Long id,
        String purchaseOrderNo,
        Long supplierId,
        String supplierName,
        Long branchId,
        PurchaseOrderStatus status,
        String statusLabel,
        LocalDate purchaseDate,
        LocalDate expectedDelivery,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        String note,
        // Maker audit
        String createdBy,
        OffsetDateTime createdAt,
        String submittedBy,
        OffsetDateTime submittedAt,
        // Checker audit
        String approvedBy,
        OffsetDateTime approvedAt,
        String rejectedBy,
        OffsetDateTime rejectedAt,
        String rejectReason,
        // Cancel audit
        String cancelledBy,
        OffsetDateTime cancelledAt,
        String cancelReason,
        // Workflow flags
        boolean stockReceived,
        boolean accountingRecorded,
        List<PurchaseOrderItemDto> items
) {
    public record PurchaseOrderItemDto(
            Long id,
            Long productId,
            String productName,
            String productCode,
            int quantity,
            BigDecimal unitCost,
            BigDecimal lineTotal
    ) {
        public static PurchaseOrderItemDto from(PurchaseOrderItem item) {
            return new PurchaseOrderItemDto(
                    item.getId(),
                    item.getProduct().getId(),
                    item.getProduct().getProductName(),
                    item.getProduct().getProductCode(),
                    item.getQuantity(),
                    item.getUnitCost(),
                    item.getLineTotal()
            );
        }
    }

    public static PurchaseOrderDto from(PurchaseOrder po) {
        return new PurchaseOrderDto(
                po.getId(), po.getPurchaseOrderNo(),
                po.getSupplier().getId(), po.getSupplier().getName(),
                po.getBranchId(), po.getStatus(), statusLabel(po.getStatus()),
                po.getPurchaseDate(), po.getExpectedDelivery(),
                po.getTotalAmount(), po.getPaidAmount(),
                po.getNote(),
                po.getCreatedBy(), po.getCreatedAt(),
                po.getSubmittedBy(), po.getSubmittedAt(),
                po.getApprovedBy(), po.getApprovedAt(),
                po.getRejectedBy(), po.getRejectedAt(), po.getRejectReason(),
                po.getCancelledBy(), po.getCancelledAt(), po.getCancelReason(),
                po.isStockReceived(), po.isAccountingRecorded(),
                po.getItems().stream().map(PurchaseOrderItemDto::from).toList()
        );
    }

    private static String statusLabel(PurchaseOrderStatus s) {
        return switch (s) {
            case DRAFT -> "Nháp";
            case SUBMITTED -> "Đã gửi duyệt";
            case PENDING_APPROVAL -> "Chờ duyệt";
            case APPROVED -> "Đã duyệt";
            case PARTIALLY_RECEIVED -> "Nhập một phần";
            case RECEIVED -> "Đã nhập đủ";
            case CANCELLED -> "Đã hủy";
            case REJECTED -> "Bị từ chối";
        };
    }
}

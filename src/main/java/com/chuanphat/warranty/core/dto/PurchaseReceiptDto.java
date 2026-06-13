package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.PurchaseReceipt;
import com.chuanphat.warranty.core.entity.PurchaseReceiptItem;
import com.chuanphat.warranty.core.enums.ReceiptStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record PurchaseReceiptDto(
        Long id,
        String receiptNo,
        Long purchaseOrderId,
        Long supplierId,
        String supplierName,
        Long branchId,
        Long warehouseId,
        String warehouseName,
        LocalDate receiptDate,
        ReceiptStatus status,
        BigDecimal totalAmount,
        String note,
        String createdBy,
        String confirmedBy,
        OffsetDateTime confirmedAt,
        boolean accountingRecorded,
        OffsetDateTime createdAt,
        List<PurchaseReceiptItemDto> items
) {
    public record PurchaseReceiptItemDto(
            Long id,
            Long productId,
            String productName,
            String productCode,
            String productCategory,
            int quantity,
            BigDecimal unitCost,
            BigDecimal lineTotal,
            String frameNumber,
            String engineNumber,
            String batterySerial,
            String serialNumber,
            String note
    ) {
        public static PurchaseReceiptItemDto from(PurchaseReceiptItem item) {
            return new PurchaseReceiptItemDto(
                    item.getId(),
                    item.getProduct().getId(),
                    item.getProduct().getProductName(),
                    item.getProduct().getProductCode(),
                    item.getProduct().getCategory() != null ? item.getProduct().getCategory().name() : null,
                    item.getQuantity(),
                    item.getUnitCost(),
                    item.getLineTotal(),
                    item.getFrameNumber(),
                    item.getEngineNumber(),
                    item.getBatterySerial(),
                    item.getSerialNumber(),
                    item.getNote()
            );
        }
    }

    public static PurchaseReceiptDto from(PurchaseReceipt receipt) {
        return new PurchaseReceiptDto(
                receipt.getId(),
                receipt.getReceiptNo(),
                receipt.getPurchaseOrderId(),
                receipt.getSupplier().getId(),
                receipt.getSupplier().getName(),
                receipt.getBranchId(),
                receipt.getWarehouse() != null ? receipt.getWarehouse().getId() : null,
                receipt.getWarehouse() != null ? receipt.getWarehouse().getWarehouseName() : null,
                receipt.getReceiptDate(),
                receipt.getStatus(),
                receipt.getTotalAmount(),
                receipt.getNote(),
                receipt.getCreatedBy(),
                receipt.getConfirmedBy(),
                receipt.getConfirmedAt(),
                receipt.isAccountingRecorded(),
                receipt.getCreatedAt(),
                receipt.getItems().stream().map(PurchaseReceiptItemDto::from).toList()
        );
    }
}

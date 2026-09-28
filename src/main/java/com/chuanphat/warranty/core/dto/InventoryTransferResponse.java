package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.InventoryTransfer;
import com.chuanphat.warranty.core.enums.TransferStatus;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record InventoryTransferResponse(
        Long id,
        String transferNo,
        TransferStatus status,
        LocalDate transferDate,
        Long fromBranchId,
        Long fromWarehouseId,
        String fromWarehouseName,
        Long toBranchId,
        Long toWarehouseId,
        String toWarehouseName,
        Long productId,
        String productCode,
        String productName,
        int quantity,
        Long serialId,
        String serialNumber,
        String note,
        String createdBy,
        String approvedBy,
        String rejectionReason,
        OffsetDateTime createdAt,
        OffsetDateTime approvedAt
) {
    public static InventoryTransferResponse from(InventoryTransfer transfer) {
        return new InventoryTransferResponse(
                transfer.getId(), transfer.getTransferNo(), transfer.getStatus(), transfer.getTransferDate(),
                transfer.getFromBranchId(), transfer.getFromWarehouse().getId(), transfer.getFromWarehouse().getWarehouseName(),
                transfer.getToBranchId(), transfer.getToWarehouse().getId(), transfer.getToWarehouse().getWarehouseName(),
                transfer.getProduct().getId(), transfer.getProduct().getProductCode(), transfer.getProduct().getProductName(),
                transfer.getQuantity(), transfer.getSerial() == null ? null : transfer.getSerial().getId(),
                transfer.getSerial() == null ? null : transfer.getSerial().getSerialNumber(), transfer.getNote(),
                transfer.getCreatedBy(), transfer.getApprovedBy(), transfer.getRejectionReason(),
                transfer.getCreatedAt(), transfer.getApprovedAt());
    }
}

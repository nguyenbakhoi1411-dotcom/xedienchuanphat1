package com.chuanphat.warranty.core.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Request chuyen serial xe giua kho/chi nhanh.
 */
public record TransferSerialRequest(
        @NotNull Long toBranchId,
        Long toWarehouseId,
        String sourceDocumentType,  // INVENTORY_TRANSFER
        String sourceDocumentId,
        String reason
) {}

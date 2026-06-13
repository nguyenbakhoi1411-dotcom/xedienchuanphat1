package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.ProductSerialHistory;
import com.chuanphat.warranty.core.enums.SerialStatus;
import java.time.OffsetDateTime;

public record ProductSerialHistoryDto(
        Long id,
        Long serialId,
        String action,
        SerialStatus oldStatus,
        SerialStatus newStatus,
        String sourceDocumentType,
        String sourceDocumentId,
        Long branchFromId,
        Long branchToId,
        Long warehouseFromId,
        Long warehouseToId,
        Long customerId,
        String createdBy,
        OffsetDateTime createdAt,
        String note
) {
    public static ProductSerialHistoryDto from(ProductSerialHistory history) {
        return new ProductSerialHistoryDto(
                history.getId(),
                history.getSerialId(),
                history.getAction(),
                history.getOldStatus(),
                history.getNewStatus(),
                history.getSourceDocumentType(),
                history.getSourceDocumentId(),
                history.getBranchFromId(),
                history.getBranchToId(),
                history.getWarehouseFromId(),
                history.getWarehouseToId(),
                history.getCustomerId(),
                history.getCreatedBy(),
                history.getCreatedAt(),
                history.getNote()
        );
    }
}

package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.InventoryCount;
import com.chuanphat.warranty.core.entity.InventoryCountItem;
import com.chuanphat.warranty.core.enums.InventoryCountStatus;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record InventoryCountDto(
        Long id,
        String countNo,
        Long branchId,
        Long warehouseId,
        String warehouseName,
        LocalDate countDate,
        InventoryCountStatus status,
        String note,
        String createdBy,
        String approvedBy,
        OffsetDateTime approvedAt,
        OffsetDateTime createdAt,
        int totalItems,
        int itemsWithVariance,
        List<InventoryCountItemDto> items
) {
    public record InventoryCountItemDto(
            Long id,
            Long productId,
            String productName,
            String productCode,
            int systemQuantity,
            Integer countedQuantity,
            int varianceQty,
            String varianceReason,
            boolean adjustmentApplied,
            String note
    ) {
        public static InventoryCountItemDto from(InventoryCountItem item) {
            return new InventoryCountItemDto(
                    item.getId(),
                    item.getProduct().getId(),
                    item.getProduct().getProductName(),
                    item.getProduct().getProductCode(),
                    item.getSystemQuantity(),
                    item.getCountedQuantity(),
                    item.getVarianceQty(),
                    item.getVarianceReason(),
                    item.isAdjustmentApplied(),
                    item.getNote()
            );
        }
    }

    public static InventoryCountDto from(InventoryCount count) {
        List<InventoryCountItemDto> itemDtos = count.getItems().stream()
                .map(InventoryCountItemDto::from).toList();
        int withVariance = (int) itemDtos.stream().filter(i -> i.varianceQty() != 0).count();
        return new InventoryCountDto(
                count.getId(),
                count.getCountNo(),
                count.getBranchId(),
                count.getWarehouse() != null ? count.getWarehouse().getId() : null,
                count.getWarehouse() != null ? count.getWarehouse().getWarehouseName() : null,
                count.getCountDate(),
                count.getStatus(),
                count.getNote(),
                count.getCreatedBy(),
                count.getApprovedBy(),
                count.getApprovedAt(),
                count.getCreatedAt(),
                itemDtos.size(),
                withVariance,
                itemDtos
        );
    }
}

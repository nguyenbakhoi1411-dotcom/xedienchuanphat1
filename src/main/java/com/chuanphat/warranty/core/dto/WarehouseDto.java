package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.Warehouse;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.core.enums.WarehouseType;

public record WarehouseDto(
        Long id,
        String warehouseCode,
        String warehouseName,
        Long branchId,
        WarehouseType type,
        RecordStatus status
) {
    public static WarehouseDto from(Warehouse warehouse) {
        return new WarehouseDto(
                warehouse.getId(),
                warehouse.getWarehouseCode(),
                warehouse.getWarehouseName(),
                warehouse.getBranchId(),
                warehouse.getType(),
                warehouse.getStatus()
        );
    }
}

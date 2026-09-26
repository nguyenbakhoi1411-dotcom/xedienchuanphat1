package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.EmployeeWarehouse;
import com.chuanphat.warranty.core.enums.WarehouseAccessLevel;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public final class WarehouseAccessDtos {
    private WarehouseAccessDtos() {
    }

    public record AssignWarehouseAccessRequest(
            @NotNull Long employeeId,
            @NotNull Long warehouseId,
            @NotNull WarehouseAccessLevel accessLevel
    ) {
    }

    public record WarehouseAccessResponse(
            Long id,
            Long employeeId,
            Long warehouseId,
            String warehouseCode,
            String warehouseName,
            WarehouseAccessLevel accessLevel,
            boolean active,
            OffsetDateTime createdAt
    ) {
        public static WarehouseAccessResponse from(EmployeeWarehouse access) {
            return new WarehouseAccessResponse(
                    access.getId(),
                    access.getEmployeeId(),
                    access.getWarehouse().getId(),
                    access.getWarehouse().getWarehouseCode(),
                    access.getWarehouse().getWarehouseName(),
                    access.getAccessLevel(),
                    access.isActive(),
                    access.getCreatedAt()
            );
        }
    }
}

package com.chuanphat.warranty.dto;

import com.chuanphat.warranty.entity.ServiceTicketItem;
import com.chuanphat.warranty.enums.ComponentType;
import com.chuanphat.warranty.enums.ServiceTicketItemType;
import java.math.BigDecimal;

public record ServiceTicketItemResponse(
        Long id,
        ServiceTicketItemType type,
        String name,
        Long productId,
        Long warehouseId,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal unitCost,
        Boolean isWarrantyCovered,
        ComponentType componentType,
        BigDecimal lineTotal
) {
    public static ServiceTicketItemResponse from(ServiceTicketItem item) {
        return new ServiceTicketItemResponse(
                item.getId(),
                item.getType(),
                item.getName(),
                item.getProductId(),
                item.getWarehouseId(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getUnitCost(),
                item.isWarrantyCovered(),
                item.getComponentType(),
                item.lineTotal()
        );
    }
}

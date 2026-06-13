package com.chuanphat.warranty.dto;

import com.chuanphat.warranty.enums.ComponentType;
import com.chuanphat.warranty.enums.ServiceTicketItemType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record AddServiceTicketItemRequest(
        @NotNull ServiceTicketItemType type,
        @NotBlank String name,
        Long productId,
        Long warehouseId,
        @NotNull @Min(1) Integer quantity,
        @NotNull @DecimalMin("0.00") BigDecimal unitPrice,
        @DecimalMin("0.00") BigDecimal unitCost,
        Boolean isWarrantyCovered,
        ComponentType componentType
) {
}

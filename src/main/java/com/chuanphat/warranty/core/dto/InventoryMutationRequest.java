package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.enums.InventoryMutationType;
import java.math.BigDecimal;
import java.time.LocalDate;

public record InventoryMutationRequest(
        Long warehouseId,
        Long productId,
        int deltaQuantity,
        InventoryMutationType transactionType,
        String reason,
        String referenceType,
        String referenceId,
        String referenceNo,
        String performedBy,
        LocalDate transactionDate,
        BigDecimal unitCost
) {}

package com.chuanphat.warranty.core.dto;

import com.chuanphat.warranty.core.entity.InventoryTransaction;
import com.chuanphat.warranty.core.enums.InventoryTransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record InventoryTransactionDto(
        Long id,
        InventoryTransactionType type,
        String transactionNo,
        LocalDate transactionDate,
        @NotNull Long productId,
        String productName,
        Long fromBranchId,
        Long toBranchId,
        Long fromWarehouseId,
        Long toWarehouseId,
        @Min(1) int quantity,
        BigDecimal unitCost,
        BigDecimal totalCost,
        String note
) {
    public static InventoryTransactionDto from(InventoryTransaction transaction) {
        return new InventoryTransactionDto(
                transaction.getId(),
                transaction.getType(),
                transaction.getTransactionNo(),
                transaction.getTransactionDate(),
                transaction.getProduct().getId(),
                transaction.getProduct().getProductName(),
                transaction.getFromBranchId(),
                transaction.getToBranchId(),
                transaction.getFromWarehouseId(),
                transaction.getToWarehouseId(),
                transaction.getQuantity(),
                transaction.getUnitCost(),
                transaction.getTotalCost(),
                transaction.getNote()
        );
    }
}

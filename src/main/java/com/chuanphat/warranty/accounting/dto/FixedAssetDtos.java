package com.chuanphat.warranty.accounting.dto;

import com.chuanphat.warranty.accounting.entity.FixedAsset;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public class FixedAssetDtos {

    public record FixedAssetResponse(
            Long id,
            String assetCode,
            String assetName,
            String category,
            String status,
            LocalDate purchaseDate,
            BigDecimal costAmount,
            BigDecimal residualValue,
            Integer usefulLifeMonths,
            String depreciationMethod,
            BigDecimal accumulatedDepreciation,
            BigDecimal bookValue,
            Long branchId,
            String accountCode,
            String depreciationAccountCode,
            String expenseAccountCode,
            String purchaseOrderNo,
            String supplierName,
            String note,
            LocalDate disposedAt,
            BigDecimal disposalAmount,
            OffsetDateTime createdAt
    ) {
        public static FixedAssetResponse from(FixedAsset a) {
            return new FixedAssetResponse(
                    a.getId(), a.getAssetCode(), a.getAssetName(),
                    a.getCategory(), a.getStatus(), a.getPurchaseDate(),
                    a.getCostAmount(), a.getResidualValue(), a.getUsefulLifeMonths(),
                    a.getDepreciationMethod(), a.getAccumulatedDepreciation(),
                    a.getBookValue(), a.getBranchId(),
                    a.getAccountCode(), a.getDepreciationAccountCode(), a.getExpenseAccountCode(),
                    a.getPurchaseOrderNo(), a.getSupplierName(), a.getNote(),
                    a.getDisposedAt(), a.getDisposalAmount(), a.getCreatedAt()
            );
        }
    }

    public record CreateFixedAssetRequest(
            String assetName,
            String category,                // VEHICLE | MACHINE | EQUIPMENT | BUILDING | OTHER
            LocalDate purchaseDate,
            BigDecimal costAmount,
            BigDecimal residualValue,
            Integer usefulLifeMonths,
            String depreciationMethod,      // STRAIGHT_LINE | DECLINING_BALANCE
            Long branchId,
            String accountCode,             // null → 211
            String depreciationAccountCode, // null → 214
            String expenseAccountCode,      // null → 642
            String purchaseOrderNo,
            String supplierName,
            String note
    ) {}

    public record DisposeRequest(BigDecimal disposalAmount, String note) {}

    /** Kết quả chạy khấu hao 1 tháng */
    public record DepreciationRunResult(
            int year,
            int month,
            List<DepreciationLineResult> lines,
            BigDecimal totalAmount
    ) {}

    public record DepreciationLineResult(
            Long assetId,
            String assetCode,
            String assetName,
            BigDecimal amount,
            String result  // POSTED | SKIPPED | FULLY_DEPRECIATED
    ) {}
}

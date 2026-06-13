package com.chuanphat.warranty.marketing.dto;

import com.chuanphat.warranty.marketing.entity.Voucher;
import java.math.BigDecimal;
import java.time.LocalDate;

public record VoucherResponse(
        Long id,
        String code,
        String name,
        String discountType,
        BigDecimal discountValue,
        BigDecimal minimumOrderAmount,
        LocalDate startDate,
        LocalDate endDate,
        int usageLimit,
        int usedCount,
        String status,
        String applicableProductIds,
        String applicableBranchIds
) {
    public static VoucherResponse from(Voucher voucher) {
        return new VoucherResponse(
                voucher.getId(),
                voucher.getCode(),
                voucher.getName(),
                voucher.getDiscountType(),
                voucher.getDiscountValue(),
                voucher.getMinimumOrderAmount(),
                voucher.getStartDate(),
                voucher.getEndDate(),
                voucher.getUsageLimit(),
                voucher.getUsedCount(),
                voucher.getStatus(),
                voucher.getApplicableProductIds(),
                voucher.getApplicableBranchIds()
        );
    }
}

package com.chuanphat.warranty.pricing.dto;

import com.chuanphat.warranty.pricing.entity.PricePolicy;
import com.chuanphat.warranty.pricing.entity.PricePolicyTarget;
import com.chuanphat.warranty.pricing.entity.ProductPriceHistory;
import com.chuanphat.warranty.pricing.enums.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public final class PricingDtos {
    private PricingDtos() {}

    public record PricePolicyTargetRequest(Long branchId, Long productId, Long categoryId, Long brandId, String categoryCode, String brand) {}

    public record PricePolicyRequest(
            String policyCode,
            String policyName,
            String description,
            PricePolicyScopeType scopeType,
            PriceChangeType priceChangeType,
            BigDecimal value,
            LocalDate startDate,
            LocalDate endDate,
            Integer priority,
            String note,
            List<PricePolicyTargetRequest> targets
    ) {}

    public record PricePolicyTargetResponse(Long id, Long branchId, Long productId, Long categoryId, Long brandId, String categoryCode, String brand) {
        public static PricePolicyTargetResponse from(PricePolicyTarget target) {
            return new PricePolicyTargetResponse(target.getId(), target.getBranchId(), target.getProductId(), target.getCategoryId(), target.getBrandId(), target.getCategoryCode(), target.getBrand());
        }
    }

    public record PricePolicyResponse(
            Long id,
            String policyCode,
            String policyName,
            String description,
            PricePolicyScopeType scopeType,
            PriceChangeType priceChangeType,
            BigDecimal value,
            LocalDate startDate,
            LocalDate endDate,
            PricePolicyStatus status,
            int priority,
            String createdBy,
            OffsetDateTime createdAt,
            String approvedBy,
            OffsetDateTime approvedAt,
            String cancelledBy,
            OffsetDateTime cancelledAt,
            String note,
            List<PricePolicyTargetResponse> targets
    ) {
        public static PricePolicyResponse from(PricePolicy policy) {
            return new PricePolicyResponse(
                    policy.getId(),
                    policy.getPolicyCode(),
                    policy.getPolicyName(),
                    policy.getDescription(),
                    policy.getScopeType(),
                    policy.getPriceChangeType(),
                    policy.getValue(),
                    policy.getStartDate(),
                    policy.getEndDate(),
                    policy.getStatus(),
                    policy.getPriority(),
                    policy.getCreatedBy(),
                    policy.getCreatedAt(),
                    policy.getApprovedBy(),
                    policy.getApprovedAt(),
                    policy.getCancelledBy(),
                    policy.getCancelledAt(),
                    policy.getNote(),
                    policy.getTargets().stream().map(PricePolicyTargetResponse::from).toList()
            );
        }
    }

    public record EffectivePriceResponse(
            Long productId,
            Long branchId,
            BigDecimal listPrice,
            BigDecimal effectivePrice,
            BigDecimal policyDiscountAmount,
            Long policyId,
            String policyCode,
            String policyName,
            PriceChangeType priceChangeType
    ) {}

    public record ProductPriceHistoryResponse(
            Long id,
            Long productId,
            BigDecimal oldBasePrice,
            BigDecimal newBasePrice,
            BigDecimal oldSellingPrice,
            BigDecimal newSellingPrice,
            String reason,
            PriceHistorySourceType sourceType,
            Long sourceId,
            String changedBy,
            OffsetDateTime changedAt,
            Long branchId,
            String note
    ) {
        public static ProductPriceHistoryResponse from(ProductPriceHistory history) {
            return new ProductPriceHistoryResponse(
                    history.getId(),
                    history.getProductId(),
                    history.getOldBasePrice(),
                    history.getNewBasePrice(),
                    history.getOldSellingPrice(),
                    history.getNewSellingPrice(),
                    history.getReason(),
                    history.getSourceType(),
                    history.getSourceId(),
                    history.getChangedBy(),
                    history.getChangedAt(),
                    history.getBranchId(),
                    history.getNote()
            );
        }
    }

    public record PricePolicyPerformanceRow(
            Long policyId,
            String policyCode,
            String policyName,
            long orderCount,
            BigDecimal revenue,
            BigDecimal policyDiscountAmount,
            BigDecimal estimatedProfit
    ) {}
}

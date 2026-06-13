package com.chuanphat.warranty.pricing.service;

import com.chuanphat.warranty.audit.dto.CreateAuditLogRequest;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import com.chuanphat.warranty.audit.service.AuditLogService;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.repository.ProductRepository;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import com.chuanphat.warranty.pricing.dto.PricingDtos;
import com.chuanphat.warranty.pricing.entity.PricePolicy;
import com.chuanphat.warranty.pricing.entity.PricePolicyTarget;
import com.chuanphat.warranty.pricing.entity.ProductPriceHistory;
import com.chuanphat.warranty.pricing.enums.*;
import com.chuanphat.warranty.pricing.repository.PricePolicyRepository;
import com.chuanphat.warranty.pricing.repository.ProductPriceHistoryRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PriceCalculationService {
    private final PricePolicyRepository policyRepository;
    private final ProductPriceHistoryRepository historyRepository;
    private final ProductRepository productRepository;
    private final BranchSecurity branchSecurity;
    private final AuditLogService auditLogService;

    public PriceCalculationService(
            PricePolicyRepository policyRepository,
            ProductPriceHistoryRepository historyRepository,
            ProductRepository productRepository,
            BranchSecurity branchSecurity,
            AuditLogService auditLogService
    ) {
        this.policyRepository = policyRepository;
        this.historyRepository = historyRepository;
        this.productRepository = productRepository;
        this.branchSecurity = branchSecurity;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public PricingDtos.EffectivePriceResponse calculateEffectivePrice(Long productId, Long branchId, Long customerId, LocalDate date) {
        Product product = product(productId);
        LocalDate actualDate = date == null ? LocalDate.now() : date;
        PricePolicy policy = getActivePolicies(productId, branchId, actualDate).stream().findFirst().orElse(null);
        BigDecimal listPrice = product.getSalePrice();
        BigDecimal effectivePrice = policy == null ? listPrice : applyPolicy(listPrice, policy);
        return new PricingDtos.EffectivePriceResponse(
                productId,
                branchId,
                listPrice,
                effectivePrice,
                listPrice.subtract(effectivePrice).max(BigDecimal.ZERO),
                policy == null ? null : policy.getId(),
                policy == null ? null : policy.getPolicyCode(),
                policy == null ? null : policy.getPolicyName(),
                policy == null ? null : policy.getPriceChangeType()
        );
    }

    @Transactional(readOnly = true)
    public List<PricePolicy> getActivePolicies(Long productId, Long branchId, LocalDate date) {
        Product product = product(productId);
        LocalDate actualDate = date == null ? LocalDate.now() : date;
        return policyRepository.findEffectiveCandidates(List.of(PricePolicyStatus.APPROVED, PricePolicyStatus.ACTIVE), actualDate).stream()
                .filter(policy -> matches(policy, product, branchId))
                .sorted(Comparator.comparingInt(PricePolicy::getPriority).reversed().thenComparing(PricePolicy::getCreatedAt, Comparator.reverseOrder()))
                .toList();
    }

    public BigDecimal applyPolicy(BigDecimal basePrice, PricePolicy policy) {
        BigDecimal result = switch (policy.getPriceChangeType()) {
            case FIXED_PRICE -> policy.getValue();
            case DISCOUNT_AMOUNT -> basePrice.subtract(policy.getValue());
            case DISCOUNT_PERCENT -> basePrice.subtract(basePrice.multiply(policy.getValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
            case INCREASE_AMOUNT -> basePrice.add(policy.getValue());
            case INCREASE_PERCENT -> basePrice.add(basePrice.multiply(policy.getValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
        };
        return result.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    public void validatePricePolicy(PricePolicy policy) {
        if (policy.getEndDate().isBefore(policy.getStartDate())) {
            throw new BusinessException("Policy endDate must be on or after startDate");
        }
        if (policy.getValue().compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("Policy value cannot be negative");
        }
        if (policy.getPriceChangeType() == PriceChangeType.DISCOUNT_PERCENT && policy.getValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new BusinessException("Discount percent cannot exceed 100");
        }
        if (policy.getPriceChangeType() == PriceChangeType.FIXED_PRICE && policy.getValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Fixed price must be greater than zero");
        }
    }

    @Transactional
    public void recordPriceHistory(Long productId, BigDecimal oldPrice, BigDecimal newPrice, PriceHistorySourceType sourceType, Long sourceId, Long branchId, String reason, String note) {
        Product product = product(productId);
        recordPriceHistory(productId, product.getImportPrice(), product.getImportPrice(), oldPrice, newPrice, sourceType, sourceId, branchId, reason, note);
    }

    @Transactional
    public void recordPriceHistory(Long productId, BigDecimal oldBasePrice, BigDecimal newBasePrice, BigDecimal oldSellingPrice, BigDecimal newSellingPrice, PriceHistorySourceType sourceType, Long sourceId, Long branchId, String reason, String note) {
        ProductPriceHistory history = new ProductPriceHistory();
        history.setProductId(productId);
        history.setOldBasePrice(oldBasePrice);
        history.setNewBasePrice(newBasePrice);
        history.setOldSellingPrice(oldSellingPrice);
        history.setNewSellingPrice(newSellingPrice);
        history.setSourceType(sourceType);
        history.setSourceId(sourceId);
        history.setBranchId(branchId);
        history.setReason(reason);
        history.setNote(note);
        history.setChangedBy(currentUsername());
        historyRepository.save(history);
    }

    @Transactional
    public void recordPolicyPriceHistory(PricePolicy policy) {
        for (Product product : productsAffectedBy(policy)) {
            BigDecimal newPrice = applyPolicy(product.getSalePrice(), policy);
            Long branchId = policy.getScopeType() == PricePolicyScopeType.BRANCH
                    ? policy.getTargets().stream().map(PricePolicyTarget::getBranchId).filter(java.util.Objects::nonNull).findFirst().orElse(null)
                    : null;
            recordPriceHistory(product.getId(), product.getImportPrice(), product.getImportPrice(), product.getSalePrice(), newPrice,
                    PriceHistorySourceType.PRICE_POLICY, policy.getId(), branchId, "Approved price policy " + policy.getPolicyCode(), policy.getPolicyName());
        }
    }

    @Transactional(readOnly = true)
    public void validateNotBelowCostForApproval(PricePolicy policy) {
        if (hasAuthority("APPROVE_SELL_BELOW_COST")) {
            return;
        }
        List<Product> products = productsAffectedBy(policy);
        for (Product product : products) {
            BigDecimal price = applyPolicy(product.getSalePrice(), policy);
            if (price.compareTo(product.getImportPrice()) < 0) {
                throw new BusinessException("Policy makes selling price lower than cost for product " + product.getProductCode());
            }
        }
    }

    private List<Product> productsAffectedBy(PricePolicy policy) {
        return switch (policy.getScopeType()) {
            case PRODUCT -> policy.getTargets().stream()
                    .filter(target -> target.getProductId() != null)
                    .map(target -> productRepository.findById(target.getProductId()).orElse(null))
                    .filter(java.util.Objects::nonNull)
                    .toList();
            case CATEGORY -> productRepository.findAll().stream()
                    .filter(product -> policy.getTargets().stream().anyMatch(target -> target.getCategoryCode() != null && target.getCategoryCode().equals(product.getCategory().name())))
                    .toList();
            case BRAND -> productRepository.findAll().stream()
                    .filter(product -> policy.getTargets().stream().anyMatch(target -> target.getBrand() != null && target.getBrand().equalsIgnoreCase(product.getBrand())))
                    .toList();
            default -> productRepository.findAll();
        };
    }

    public void audit(AuditAction action, String entityId, String oldValue, String newValue) {
        auditLogService.record(new CreateAuditLogRequest(currentUsername(), action, AuditModule.PRICING, "PricePolicy", entityId, oldValue, newValue, null, null));
    }

    private boolean matches(PricePolicy policy, Product product, Long branchId) {
        if (policy.getStatus() == PricePolicyStatus.CANCELLED || policy.getStatus() == PricePolicyStatus.EXPIRED || policy.getStatus() == PricePolicyStatus.DRAFT || policy.getStatus() == PricePolicyStatus.PENDING_APPROVAL) {
            return false;
        }
        if (policy.getScopeType() == PricePolicyScopeType.GLOBAL) {
            return true;
        }
        return policy.getTargets().stream().anyMatch(target -> targetMatches(policy.getScopeType(), target, product, branchId));
    }

    private boolean targetMatches(PricePolicyScopeType scopeType, PricePolicyTarget target, Product product, Long branchId) {
        return switch (scopeType) {
            case BRANCH -> branchId != null && branchId.equals(target.getBranchId());
            case PRODUCT -> product.getId().equals(target.getProductId());
            case CATEGORY -> target.getCategoryCode() != null && target.getCategoryCode().equals(product.getCategory().name());
            case BRAND -> target.getBrand() != null && target.getBrand().equalsIgnoreCase(product.getBrand());
            case GLOBAL -> true;
        };
    }

    private Product product(Long productId) {
        return productRepository.findById(productId).orElseThrow(() -> new NotFoundException("Product not found: " + productId));
    }

    private String currentUsername() {
        try {
            return branchSecurity.currentUser().getUsername();
        } catch (RuntimeException ex) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            return authentication == null ? "system" : authentication.getName();
        }
    }

    private boolean hasAuthority(String authority) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream().anyMatch(item -> authority.equals(item.getAuthority()));
    }
}

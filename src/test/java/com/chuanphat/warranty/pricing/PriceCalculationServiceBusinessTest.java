package com.chuanphat.warranty.pricing;

import static com.chuanphat.warranty.BusinessCriticalTestSupport.withId;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.audit.service.AuditLogService;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.repository.ProductRepository;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.pricing.entity.PricePolicy;
import com.chuanphat.warranty.pricing.entity.PricePolicyTarget;
import com.chuanphat.warranty.pricing.enums.PriceChangeType;
import com.chuanphat.warranty.pricing.enums.PricePolicyScopeType;
import com.chuanphat.warranty.pricing.enums.PricePolicyStatus;
import com.chuanphat.warranty.pricing.repository.PricePolicyRepository;
import com.chuanphat.warranty.pricing.repository.ProductPriceHistoryRepository;
import com.chuanphat.warranty.pricing.service.PriceCalculationService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PriceCalculationServiceBusinessTest {
    @Mock PricePolicyRepository policyRepository;
    @Mock ProductPriceHistoryRepository historyRepository;
    @Mock ProductRepository productRepository;
    @Mock BranchSecurity branchSecurity;
    @Mock AuditLogService auditLogService;

    PriceCalculationService service;

    @BeforeEach
    void setUp() {
        service = new PriceCalculationService(policyRepository, historyRepository, productRepository, branchSecurity, auditLogService);
    }

    @Test
    void posUsesHighestPriorityActivePolicyAndIgnoresDraftOrWrongBranch() {
        Product product = product(10L, "XM-01", "VinFast", ProductCategory.ELECTRIC_MOTORBIKE, "20000000", "30000000");
        PricePolicy global = policy(1L, PricePolicyScopeType.GLOBAL, PriceChangeType.DISCOUNT_PERCENT, "10", 1, PricePolicyStatus.ACTIVE, 1);
        PricePolicy branch = policy(2L, PricePolicyScopeType.BRANCH, PriceChangeType.FIXED_PRICE, "25000000", 9, PricePolicyStatus.APPROVED, 3);
        PricePolicy draft = policy(3L, PricePolicyScopeType.GLOBAL, PriceChangeType.FIXED_PRICE, "10000000", 99, PricePolicyStatus.DRAFT, 4);
        PricePolicy wrongBranch = policy(4L, PricePolicyScopeType.BRANCH, PriceChangeType.FIXED_PRICE, "24000000", 20, PricePolicyStatus.ACTIVE, 5);
        branch.addTarget(targetBranch(3L));
        wrongBranch.addTarget(targetBranch(99L));

        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(policyRepository.findEffectiveCandidates(List.of(PricePolicyStatus.APPROVED, PricePolicyStatus.ACTIVE), LocalDate.of(2026, 6, 13)))
                .thenReturn(List.of(global, branch, draft, wrongBranch));

        var price = service.calculateEffectivePrice(10L, 3L, 100L, LocalDate.of(2026, 6, 13));

        assertThat(price.listPrice()).isEqualByComparingTo("30000000");
        assertThat(price.effectivePrice()).isEqualByComparingTo("25000000.00");
        assertThat(price.policyCode()).isEqualTo("POL-2");
    }

    @Test
    void validatesPricingRulesAndBelowCostApproval() {
        PricePolicy invalidDate = policy(1L, PricePolicyScopeType.GLOBAL, PriceChangeType.DISCOUNT_AMOUNT, "1", 1, PricePolicyStatus.DRAFT, 1);
        invalidDate.setEndDate(invalidDate.getStartDate().minusDays(1));
        assertThatThrownBy(() -> service.validatePricePolicy(invalidDate)).isInstanceOf(BusinessException.class);

        PricePolicy overPercent = policy(2L, PricePolicyScopeType.GLOBAL, PriceChangeType.DISCOUNT_PERCENT, "101", 1, PricePolicyStatus.DRAFT, 1);
        assertThatThrownBy(() -> service.validatePricePolicy(overPercent)).isInstanceOf(BusinessException.class);

        Product product = product(10L, "XM-01", "VinFast", ProductCategory.ELECTRIC_MOTORBIKE, "20000000", "30000000");
        PricePolicy belowCost = policy(3L, PricePolicyScopeType.PRODUCT, PriceChangeType.FIXED_PRICE, "10000000", 1, PricePolicyStatus.APPROVED, 1);
        belowCost.addTarget(targetProduct(10L));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> service.validateNotBelowCostForApproval(belowCost)).isInstanceOf(BusinessException.class);
    }

    private Product product(Long id, String code, String brand, ProductCategory category, String cost, String price) {
        Product product = withId(new Product(), id);
        product.setProductCode(code);
        product.setProductName(code);
        product.setBrand(brand);
        product.setCategory(category);
        product.setImportPrice(new BigDecimal(cost));
        product.setSalePrice(new BigDecimal(price));
        return product;
    }

    private PricePolicy policy(Long id, PricePolicyScopeType scope, PriceChangeType type, String value, int priority, PricePolicyStatus status, int createdOffset) {
        PricePolicy policy = withId(new PricePolicy(), id);
        policy.setPolicyCode("POL-" + id);
        policy.setPolicyName("Policy " + id);
        policy.setScopeType(scope);
        policy.setPriceChangeType(type);
        policy.setValue(new BigDecimal(value));
        policy.setPriority(priority);
        policy.setStatus(status);
        policy.setStartDate(LocalDate.of(2026, 1, 1));
        policy.setEndDate(LocalDate.of(2026, 12, 31));
        policy.setCreatedBy("marketing");
        com.chuanphat.warranty.BusinessCriticalTestSupport.setField(policy, "createdAt", java.time.OffsetDateTime.now().plusMinutes(createdOffset));
        return policy;
    }

    private PricePolicyTarget targetBranch(Long branchId) {
        PricePolicyTarget target = new PricePolicyTarget();
        target.setBranchId(branchId);
        return target;
    }

    private PricePolicyTarget targetProduct(Long productId) {
        PricePolicyTarget target = new PricePolicyTarget();
        target.setProductId(productId);
        return target;
    }
}

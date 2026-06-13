package com.chuanphat.warranty.pricing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.chuanphat.warranty.audit.service.AuditLogService;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.repository.ProductRepository;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.pricing.dto.PricingDtos;
import com.chuanphat.warranty.pricing.entity.PricePolicy;
import com.chuanphat.warranty.pricing.entity.PricePolicyTarget;
import com.chuanphat.warranty.pricing.enums.*;
import com.chuanphat.warranty.pricing.repository.PricePolicyRepository;
import com.chuanphat.warranty.pricing.repository.ProductPriceHistoryRepository;
import com.chuanphat.warranty.pricing.service.PriceCalculationService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class PriceCalculationServiceUnitTest {
    private PricePolicyRepository policies;
    private ProductRepository products;
    private PriceCalculationService service;

    @BeforeEach
    void setUp() {
        policies = mock(PricePolicyRepository.class);
        products = mock(ProductRepository.class);
        service = new PriceCalculationService(
                policies,
                mock(ProductPriceHistoryRepository.class),
                products,
                mock(BranchSecurity.class),
                mock(AuditLogService.class)
        );
        Product product = product(1L, "CP-S1", "BrandA", new BigDecimal("10000000"), new BigDecimal("15000000"));
        when(products.findById(1L)).thenReturn(Optional.of(product));
        when(products.findAll()).thenReturn(List.of(product));
    }

    @Test
    void globalPolicyAppliesToEveryBranch() {
        when(policies.findEffectiveCandidates(anyCollection(), any())).thenReturn(List.of(policy(1L, PricePolicyScopeType.GLOBAL, PriceChangeType.DISCOUNT_AMOUNT, "1000000", 1)));

        PricingDtos.EffectivePriceResponse result = service.calculateEffectivePrice(1L, 99L, null, LocalDate.now());

        assertThat(result.effectivePrice()).isEqualByComparingTo("14000000.00");
        assertThat(result.policyId()).isEqualTo(1L);
    }

    @Test
    void branchPolicyOnlyAppliesToMatchingBranch() {
        PricePolicy branchPolicy = policy(2L, PricePolicyScopeType.BRANCH, PriceChangeType.DISCOUNT_PERCENT, "10", 1);
        target(branchPolicy).setBranchId(2L);
        when(policies.findEffectiveCandidates(anyCollection(), any())).thenReturn(List.of(branchPolicy));

        assertThat(service.calculateEffectivePrice(1L, 2L, null, LocalDate.now()).effectivePrice()).isEqualByComparingTo("13500000.00");
        assertThat(service.calculateEffectivePrice(1L, 3L, null, LocalDate.now()).effectivePrice()).isEqualByComparingTo("15000000");
    }

    @Test
    void productPolicyOnlyAppliesToMatchingProduct() {
        PricePolicy productPolicy = policy(3L, PricePolicyScopeType.PRODUCT, PriceChangeType.FIXED_PRICE, "12000000", 1);
        target(productPolicy).setProductId(1L);
        when(policies.findEffectiveCandidates(anyCollection(), any())).thenReturn(List.of(productPolicy));

        assertThat(service.calculateEffectivePrice(1L, 1L, null, LocalDate.now()).effectivePrice()).isEqualByComparingTo("12000000.00");
    }

    @Test
    void pendingAndExpiredPoliciesAreNotReturnedByRepositoryCandidatesAndPriorityWins() {
        PricePolicy low = policy(4L, PricePolicyScopeType.GLOBAL, PriceChangeType.DISCOUNT_AMOUNT, "500000", 1);
        PricePolicy high = policy(5L, PricePolicyScopeType.GLOBAL, PriceChangeType.DISCOUNT_AMOUNT, "2000000", 10);
        when(policies.findEffectiveCandidates(anyCollection(), any())).thenReturn(List.of(low, high));

        PricingDtos.EffectivePriceResponse result = service.calculateEffectivePrice(1L, 1L, null, LocalDate.now());

        assertThat(result.policyId()).isEqualTo(5L);
        assertThat(result.effectivePrice()).isEqualByComparingTo("13000000.00");
    }

    @Test
    void approvalRejectsPriceBelowCostWithoutSpecialPermission() {
        PricePolicy policy = policy(6L, PricePolicyScopeType.GLOBAL, PriceChangeType.FIXED_PRICE, "9000000", 1);

        assertThatThrownBy(() -> service.validateNotBelowCostForApproval(policy))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("lower than cost");
    }

    private PricePolicy policy(Long id, PricePolicyScopeType scopeType, PriceChangeType changeType, String value, int priority) {
        PricePolicy policy = new PricePolicy();
        ReflectionTestUtils.setField(policy, "id", id);
        policy.setPolicyCode("PP-" + id);
        policy.setPolicyName("Policy " + id);
        policy.setScopeType(scopeType);
        policy.setPriceChangeType(changeType);
        policy.setValue(new BigDecimal(value));
        policy.setStartDate(LocalDate.now().minusDays(1));
        policy.setEndDate(LocalDate.now().plusDays(1));
        policy.setStatus(PricePolicyStatus.APPROVED);
        policy.setPriority(priority);
        policy.setCreatedBy("tester");
        if (scopeType != PricePolicyScopeType.GLOBAL) {
            target(policy);
        }
        return policy;
    }

    private PricePolicyTarget target(PricePolicy policy) {
        if (!policy.getTargets().isEmpty()) {
            return policy.getTargets().get(0);
        }
        PricePolicyTarget target = new PricePolicyTarget();
        policy.addTarget(target);
        return target;
    }

    private Product product(Long id, String code, String brand, BigDecimal importPrice, BigDecimal salePrice) {
        Product product = new Product();
        ReflectionTestUtils.setField(product, "id", id);
        product.setProductCode(code);
        product.setProductName(code);
        product.setBrand(brand);
        product.setCategory(ProductCategory.ELECTRIC_MOTORBIKE);
        product.setImportPrice(importPrice);
        product.setSalePrice(salePrice);
        return product;
    }
}

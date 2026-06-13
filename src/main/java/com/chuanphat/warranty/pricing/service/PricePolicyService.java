package com.chuanphat.warranty.pricing.service;

import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import com.chuanphat.warranty.pricing.dto.PricingDtos;
import com.chuanphat.warranty.pricing.entity.PricePolicy;
import com.chuanphat.warranty.pricing.entity.PricePolicyTarget;
import com.chuanphat.warranty.pricing.enums.PricePolicyStatus;
import com.chuanphat.warranty.pricing.repository.PricePolicyRepository;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PricePolicyService {
    private final PricePolicyRepository policyRepository;
    private final PriceCalculationService calculationService;

    public PricePolicyService(PricePolicyRepository policyRepository, PriceCalculationService calculationService) {
        this.policyRepository = policyRepository;
        this.calculationService = calculationService;
    }

    @Transactional(readOnly = true)
    public List<PricingDtos.PricePolicyResponse> list(PricePolicyStatus status) {
        List<PricePolicy> policies = status == null ? policyRepository.findAll() : policyRepository.findByStatusOrderByCreatedAtDesc(status);
        return policies.stream().map(PricingDtos.PricePolicyResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public PricingDtos.PricePolicyResponse detail(Long id) {
        return PricingDtos.PricePolicyResponse.from(policy(id));
    }

    @Transactional
    public PricingDtos.PricePolicyResponse create(PricingDtos.PricePolicyRequest request) {
        if (policyRepository.existsByPolicyCodeIgnoreCase(request.policyCode())) {
            throw new BusinessException("Price policy code already exists");
        }
        PricePolicy policy = new PricePolicy();
        policy.setCreatedBy(currentUsername());
        policy.setStatus(PricePolicyStatus.DRAFT);
        apply(policy, request);
        PricePolicy saved = policyRepository.save(policy);
        calculationService.audit(AuditAction.CREATE_PRICE_POLICY, String.valueOf(saved.getId()), null, saved.getPolicyCode());
        return PricingDtos.PricePolicyResponse.from(saved);
    }

    @Transactional
    public PricingDtos.PricePolicyResponse update(Long id, PricingDtos.PricePolicyRequest request) {
        PricePolicy policy = policy(id);
        if (policy.getStatus() != PricePolicyStatus.DRAFT) {
            throw new BusinessException("Only DRAFT price policy can be edited");
        }
        apply(policy, request);
        calculationService.audit(AuditAction.UPDATE_PRICE_POLICY, String.valueOf(policy.getId()), null, policy.getPolicyCode());
        return PricingDtos.PricePolicyResponse.from(policy);
    }

    @Transactional
    public PricingDtos.PricePolicyResponse submit(Long id) {
        PricePolicy policy = policy(id);
        if (policy.getStatus() != PricePolicyStatus.DRAFT) {
            throw new BusinessException("Only DRAFT price policy can be submitted");
        }
        policy.setStatus(PricePolicyStatus.PENDING_APPROVAL);
        calculationService.audit(AuditAction.SUBMIT_PRICE_POLICY, String.valueOf(policy.getId()), "DRAFT", "PENDING_APPROVAL");
        return PricingDtos.PricePolicyResponse.from(policy);
    }

    @Transactional
    public PricingDtos.PricePolicyResponse approve(Long id) {
        PricePolicy policy = policy(id);
        if (policy.getStatus() != PricePolicyStatus.PENDING_APPROVAL) {
            throw new BusinessException("Only PENDING_APPROVAL policy can be approved");
        }
        calculationService.validateNotBelowCostForApproval(policy);
        policy.setStatus(PricePolicyStatus.APPROVED);
        policy.setApprovedBy(currentUsername());
        policy.setApprovedAt(OffsetDateTime.now());
        calculationService.recordPolicyPriceHistory(policy);
        calculationService.audit(AuditAction.APPROVE_PRICE_POLICY, String.valueOf(policy.getId()), "PENDING_APPROVAL", "APPROVED");
        return PricingDtos.PricePolicyResponse.from(policy);
    }

    @Transactional
    public PricingDtos.PricePolicyResponse cancel(Long id) {
        PricePolicy policy = policy(id);
        if (policy.getStatus() == PricePolicyStatus.CANCELLED || policy.getStatus() == PricePolicyStatus.EXPIRED) {
            throw new BusinessException("Policy is already closed");
        }
        policy.setStatus(PricePolicyStatus.CANCELLED);
        policy.setCancelledBy(currentUsername());
        policy.setCancelledAt(OffsetDateTime.now());
        calculationService.audit(AuditAction.CANCEL_PRICE_POLICY, String.valueOf(policy.getId()), null, "CANCELLED");
        return PricingDtos.PricePolicyResponse.from(policy);
    }

    private void apply(PricePolicy policy, PricingDtos.PricePolicyRequest request) {
        policy.setPolicyCode(request.policyCode());
        policy.setPolicyName(request.policyName());
        policy.setDescription(request.description());
        policy.setScopeType(request.scopeType());
        policy.setPriceChangeType(request.priceChangeType());
        policy.setValue(request.value());
        policy.setStartDate(request.startDate());
        policy.setEndDate(request.endDate());
        policy.setPriority(request.priority() == null ? 0 : request.priority());
        policy.setNote(request.note());
        policy.getTargets().clear();
        if (request.targets() != null) {
            for (PricingDtos.PricePolicyTargetRequest targetRequest : request.targets()) {
                PricePolicyTarget target = new PricePolicyTarget();
                target.setBranchId(targetRequest.branchId());
                target.setProductId(targetRequest.productId());
                target.setCategoryId(targetRequest.categoryId());
                target.setBrandId(targetRequest.brandId());
                target.setCategoryCode(targetRequest.categoryCode());
                target.setBrand(targetRequest.brand());
                policy.addTarget(target);
            }
        }
        calculationService.validatePricePolicy(policy);
    }

    private PricePolicy policy(Long id) {
        return policyRepository.findWithTargetsById(id).orElseThrow(() -> new NotFoundException("Price policy not found: " + id));
    }

    private String currentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication == null ? "system" : authentication.getName();
    }
}

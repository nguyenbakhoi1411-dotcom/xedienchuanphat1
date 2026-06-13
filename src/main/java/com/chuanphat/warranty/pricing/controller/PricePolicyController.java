package com.chuanphat.warranty.pricing.controller;

import com.chuanphat.warranty.pricing.dto.PricingDtos;
import com.chuanphat.warranty.pricing.enums.PricePolicyStatus;
import com.chuanphat.warranty.pricing.service.PriceCalculationService;
import com.chuanphat.warranty.pricing.service.PricePolicyService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/price-policies")
public class PricePolicyController {
    private final PricePolicyService policyService;
    private final PriceCalculationService calculationService;

    public PricePolicyController(PricePolicyService policyService, PriceCalculationService calculationService) {
        this.policyService = policyService;
        this.calculationService = calculationService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_PRICE_POLICY')")
    public List<PricingDtos.PricePolicyResponse> list(@RequestParam(required = false) PricePolicyStatus status) {
        return policyService.list(status);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_PRICE_POLICY')")
    public PricingDtos.PricePolicyResponse detail(@PathVariable Long id) {
        return policyService.detail(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_PRICE_POLICY')")
    public PricingDtos.PricePolicyResponse create(@RequestBody PricingDtos.PricePolicyRequest request) {
        return policyService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('EDIT_PRICE_POLICY')")
    public PricingDtos.PricePolicyResponse update(@PathVariable Long id, @RequestBody PricingDtos.PricePolicyRequest request) {
        return policyService.update(id, request);
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAuthority('CREATE_PRICE_POLICY')")
    public PricingDtos.PricePolicyResponse submit(@PathVariable Long id) {
        return policyService.submit(id);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('APPROVE_PRICE_POLICY')")
    public PricingDtos.PricePolicyResponse approve(@PathVariable Long id) {
        return policyService.approve(id);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('CANCEL_PRICE_POLICY')")
    public PricingDtos.PricePolicyResponse cancel(@PathVariable Long id) {
        return policyService.cancel(id);
    }

    @GetMapping("/active-price")
    @PreAuthorize("hasAnyAuthority('SALES_VIEW','VIEW_PRICE_POLICY')")
    public PricingDtos.EffectivePriceResponse activePrice(@RequestParam Long productId,
                                                          @RequestParam(required = false) Long branchId,
                                                          @RequestParam(required = false) Long customerId,
                                                          @RequestParam(required = false) LocalDate date) {
        return calculationService.calculateEffectivePrice(productId, branchId, customerId, date);
    }
}

package com.chuanphat.warranty.pricing.controller;

import com.chuanphat.warranty.core.repository.SalesOrderItemRepository;
import com.chuanphat.warranty.pricing.dto.PricingDtos;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class PricePolicyReportController {
    private final SalesOrderItemRepository salesOrderItemRepository;

    public PricePolicyReportController(SalesOrderItemRepository salesOrderItemRepository) {
        this.salesOrderItemRepository = salesOrderItemRepository;
    }

    @GetMapping("/price-policy-performance")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public List<PricingDtos.PricePolicyPerformanceRow> performance() {
        boolean viewProfit = hasAuthority("VIEW_PROFIT");
        return salesOrderItemRepository.pricePolicyPerformance().stream()
                .map(row -> new PricingDtos.PricePolicyPerformanceRow(
                        row.getPolicyId(),
                        row.getPolicyCode(),
                        row.getPolicyName(),
                        row.getOrderCount(),
                        row.getRevenue(),
                        row.getDiscountAmount(),
                        viewProfit ? row.getEstimatedProfit() : null
                ))
                .toList();
    }

    private boolean hasAuthority(String authority) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream().anyMatch(item -> authority.equals(item.getAuthority()));
    }
}

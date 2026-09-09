package com.chuanphat.warranty.marketing.controller;

import com.chuanphat.warranty.marketing.dto.CustomerPriceGroupDTO;
import com.chuanphat.warranty.marketing.entity.CustomerPriceGroup;
import com.chuanphat.warranty.marketing.service.CustomerPriceGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marketing/customer-price-groups")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN')")
public class CustomerPriceGroupController {

    private final CustomerPriceGroupService service;

    @GetMapping
    public ResponseEntity<List<CustomerPriceGroup>> getAllGroups() {
        return ResponseEntity.ok(service.getAllGroups());
    }

    @PostMapping
    public ResponseEntity<CustomerPriceGroup> createGroup(@RequestBody CustomerPriceGroupDTO dto) {
        return ResponseEntity.ok(service.createGroup(dto));
    }

    @PostMapping("/{id}/assign-customers")
    public ResponseEntity<Void> assignCustomers(@PathVariable Long id, @RequestBody Map<String, List<Long>> request) {
        List<Long> customerIds = request.get("customerIds");
        service.assignCustomers(id, customerIds);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/auto-classify")
    public ResponseEntity<Map<String, Integer>> autoClassify() {
        int changed = service.autoClassifyCustomers();
        return ResponseEntity.ok(Map.of("soLuongThayDoi", changed));
    }
    
    @PostMapping("/recalculate-history")
    public ResponseEntity<Void> recalculateHistory() {
        service.recalculateHistoricalPurchases();
        return ResponseEntity.ok().build();
    }
}


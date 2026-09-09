package com.chuanphat.warranty.inventory.controller;

import com.chuanphat.warranty.inventory.dto.*;
import com.chuanphat.warranty.inventory.service.InventoryModuleService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
@RestController("inventoryModuleController")
@RequestMapping("/api/inventory")
@PreAuthorize("hasAnyRole('ADMIN')")
public class InventoryController {

    private final InventoryModuleService inventoryService;

    public InventoryController(InventoryModuleService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/dashboard")
    public DashboardMetricsDTO getDashboard() {
        return inventoryService.getDashboardMetrics();
    }

    @GetMapping("/inwards")
    public Page<InwardReceiptDTO> getInwards(Pageable pageable) {
        return inventoryService.getInwardReceipts(pageable);
    }

    @GetMapping("/outwards")
    public Page<OutwardIssueDTO> getOutwards(Pageable pageable) {
        return inventoryService.getOutwardIssues(pageable);
    }

    @GetMapping("/transfers")
    public Page<TransferDTO> getTransfers(Pageable pageable) {
        return inventoryService.getTransfers(pageable);
    }
}



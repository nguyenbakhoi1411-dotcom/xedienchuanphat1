package com.chuanphat.warranty.core.controller;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.core.dto.InventoryCountDto;
import com.chuanphat.warranty.core.dto.InventoryCountItemSubmit;
import com.chuanphat.warranty.core.dto.InventoryCountRequest;
import com.chuanphat.warranty.core.enums.InventoryCountStatus;
import com.chuanphat.warranty.core.service.InventoryCountService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * InventoryCountController — Phieu kiem ke ton kho.
 *
 * GET  /api/inventory/counts                       — Danh sach
 * GET  /api/inventory/counts/{id}                  — Chi tiet + items
 * POST /api/inventory/counts                       — Tao phieu (snapshot stock)
 * POST /api/inventory/counts/{id}/start            — Bat dau dem (COUNTING)
 * POST /api/inventory/counts/{id}/submit-counts    — Nhap so luong thuc te
 * POST /api/inventory/counts/{id}/request-approval — Gui duyet
 * POST /api/inventory/counts/{id}/approve          — Duyet + dieu chinh kho
 * POST /api/inventory/counts/{id}/cancel           — Huy
 */
@RestController
@RequestMapping("/api/inventory/counts")
public class InventoryCountController {

    private final InventoryCountService service;

    public InventoryCountController(InventoryCountService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('INVENTORY_VIEW')")
    public PageResponse<InventoryCountDto> list(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) InventoryCountStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int pageSize
    ) {
        return service.list(branchId, status, page, pageSize);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('INVENTORY_VIEW')")
    public InventoryCountDto get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('INVENTORY_ADJUST')")
    public InventoryCountDto create(@Valid @RequestBody InventoryCountRequest request) {
        return service.create(request);
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasAuthority('INVENTORY_ADJUST')")
    public InventoryCountDto start(@PathVariable Long id) {
        return service.startCounting(id);
    }

    @PostMapping("/{id}/submit-counts")
    @PreAuthorize("hasAuthority('INVENTORY_ADJUST')")
    public InventoryCountDto submitCounts(
            @PathVariable Long id,
            @Valid @RequestBody List<InventoryCountItemSubmit> submissions
    ) {
        return service.submitCounts(id, submissions);
    }

    @PostMapping("/{id}/request-approval")
    @PreAuthorize("hasAuthority('INVENTORY_ADJUST')")
    public InventoryCountDto requestApproval(@PathVariable Long id) {
        return service.requestApproval(id);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('INVENTORY_ADJUST_APPROVE')")
    public InventoryCountDto approve(@PathVariable Long id) {
        return service.approve(id);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('INVENTORY_ADJUST')")
    public InventoryCountDto cancel(@PathVariable Long id) {
        return service.cancel(id);
    }
}

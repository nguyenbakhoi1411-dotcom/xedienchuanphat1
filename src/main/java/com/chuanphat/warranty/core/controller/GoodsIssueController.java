package com.chuanphat.warranty.core.controller;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.core.dto.GoodsIssueDto;
import com.chuanphat.warranty.core.dto.GoodsIssueRequest;
import com.chuanphat.warranty.core.enums.GoodsIssueType;
import com.chuanphat.warranty.core.service.GoodsIssueService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * GoodsIssueController — Phieu xuat kho.
 *
 * GET  /api/inventory/goods-issues                 — Danh sach
 * GET  /api/inventory/goods-issues/{id}            — Chi tiet
 * POST /api/inventory/goods-issues                 — Tao phieu (DRAFT)
 * POST /api/inventory/goods-issues/{id}/issue      — Xuat kho
 * POST /api/inventory/goods-issues/{id}/cancel     — Huy
 */
@RestController
@RequestMapping("/api/inventory/goods-issues")
public class GoodsIssueController {

    private final GoodsIssueService service;

    public GoodsIssueController(GoodsIssueService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('INVENTORY_VIEW')")
    public PageResponse<GoodsIssueDto> list(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) GoodsIssueType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int pageSize
    ) {
        return service.list(branchId, status, type, page, pageSize);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('INVENTORY_VIEW')")
    public GoodsIssueDto get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('INVENTORY_EXPORT')")
    public GoodsIssueDto create(@Valid @RequestBody GoodsIssueRequest request) {
        return service.create(request);
    }

    @PostMapping("/{id}/issue")
    @PreAuthorize("hasAuthority('INVENTORY_EXPORT')")
    public GoodsIssueDto issue(@PathVariable Long id) {
        return service.issue(id);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('INVENTORY_EXPORT')")
    public GoodsIssueDto cancel(@PathVariable Long id) {
        return service.cancel(id);
    }
}

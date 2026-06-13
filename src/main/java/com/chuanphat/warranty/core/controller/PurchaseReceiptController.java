package com.chuanphat.warranty.core.controller;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.core.dto.PurchaseReceiptDto;
import com.chuanphat.warranty.core.dto.PurchaseReceiptRequest;
import com.chuanphat.warranty.core.enums.ReceiptStatus;
import com.chuanphat.warranty.core.service.PurchaseReceiptService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * PurchaseReceiptController — Phieu nhap kho.
 *
 * GET  /api/inventory/receipts                    — Danh sach
 * GET  /api/inventory/receipts/{id}               — Chi tiet
 * POST /api/inventory/receipts                    — Tao phieu nhap (DRAFT)
 * POST /api/inventory/receipts/{id}/confirm       — Xac nhan nhap kho (tao serial xe)
 * POST /api/inventory/receipts/{id}/cancel        — Huy phieu
 */
@RestController
@RequestMapping("/api/inventory/receipts")
public class PurchaseReceiptController {

    private final PurchaseReceiptService service;

    public PurchaseReceiptController(PurchaseReceiptService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('INVENTORY_VIEW')")
    public PageResponse<PurchaseReceiptDto> list(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) ReceiptStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int pageSize
    ) {
        return service.list(branchId, status, page, pageSize);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('INVENTORY_VIEW')")
    public PurchaseReceiptDto get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('INVENTORY_IMPORT')")
    public PurchaseReceiptDto create(@Valid @RequestBody PurchaseReceiptRequest request) {
        return service.create(request);
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAuthority('INVENTORY_IMPORT')")
    public PurchaseReceiptDto confirm(@PathVariable Long id) {
        return service.confirm(id);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('INVENTORY_IMPORT')")
    public PurchaseReceiptDto cancel(@PathVariable Long id) {
        return service.cancel(id);
    }
}

package com.chuanphat.warranty.core.controller;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.core.dto.PurchaseOrderDto;
import com.chuanphat.warranty.core.dto.PurchaseOrderRequest;
import com.chuanphat.warranty.core.enums.PurchaseOrderStatus;
import com.chuanphat.warranty.core.service.PurchaseOrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    private final PurchaseOrderService poService;

    public PurchaseOrderController(PurchaseOrderService poService) {
        this.poService = poService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PURCHASE_VIEW')")
    public PageResponse<PurchaseOrderDto> list(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) PurchaseOrderStatus status,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return poService.list(branchId, status, supplierId, page, size);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PURCHASE_VIEW')")
    public PurchaseOrderDto get(@PathVariable Long id) {
        return poService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('PURCHASE_CREATE')")
    public PurchaseOrderDto create(@Valid @RequestBody PurchaseOrderRequest req) {
        return poService.create(req);
    }

    /** Gui duyet (DRAFT -> SUBMITTED) */
    @PatchMapping("/{id}/submit")
    @PreAuthorize("hasAuthority('PURCHASE_UPDATE')")
    public PurchaseOrderDto submit(@PathVariable Long id) {
        return poService.submit(id);
    }

    /** Duyet (SUBMITTED -> APPROVED) */
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('PURCHASE_APPROVE')")
    public PurchaseOrderDto approve(@PathVariable Long id) {
        return poService.approve(id);
    }

    /** Tu choi (SUBMITTED -> REJECTED) */
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('PURCHASE_APPROVE')")
    public PurchaseOrderDto reject(@PathVariable Long id,
                                   @RequestParam(defaultValue = "") String reason) {
        return poService.reject(id, reason);
    }

    /** Huy don (DRAFT / PENDING_APPROVAL -> CANCELLED) */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('PURCHASE_CANCEL')")
    public PurchaseOrderDto cancel(@PathVariable Long id,
                                    @RequestParam(defaultValue = "") String reason) {
        return poService.cancel(id, reason);
    }
}

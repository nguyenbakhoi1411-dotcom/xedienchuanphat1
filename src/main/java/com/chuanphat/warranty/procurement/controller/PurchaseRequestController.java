package com.chuanphat.warranty.procurement.controller;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.core.enums.PurchaseRequestStatus;
import com.chuanphat.warranty.core.service.PayableService;
import com.chuanphat.warranty.procurement.dto.CreatePurchaseRequestRequest;
import com.chuanphat.warranty.procurement.dto.PurchaseRequestResponse;
import com.chuanphat.warranty.procurement.dto.ConvertResponse;
import com.chuanphat.warranty.procurement.dto.RejectRequest;
import com.chuanphat.warranty.procurement.service.PurchaseRequestService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/purchasing")
@PreAuthorize("hasAnyRole('ADMIN')")
public class PurchaseRequestController {

    private final PurchaseRequestService prService;
    private final PayableService payableService;

    public PurchaseRequestController(PurchaseRequestService prService, PayableService payableService) {
        this.prService = prService;
        this.payableService = payableService;
    }

    @GetMapping("/requests")
    @PreAuthorize("hasAuthority('PURCHASE_CREATE')")
    public PageResponse<PurchaseRequestResponse> list(
            @RequestParam(required = false) PurchaseRequestStatus status,
            @RequestParam(required = false) Long branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return prService.list(status, branchId, page, size);
    }

    @PostMapping("/requests")
    @PreAuthorize("hasAuthority('PURCHASE_CREATE')")
    public PurchaseRequestResponse create(
            @RequestBody CreatePurchaseRequestRequest req,
            @RequestParam Long branchId) {
        return prService.create(req, branchId);
    }

    @GetMapping("/requests/{id}")
    @PreAuthorize("hasAuthority('PURCHASE_CREATE')")
    public PurchaseRequestResponse get(@PathVariable Long id) {
        return prService.get(id);
    }

    @PutMapping("/requests/{id}")
    @PreAuthorize("hasAuthority('PURCHASE_CREATE')")
    public PurchaseRequestResponse update(
            @PathVariable Long id,
            @RequestBody CreatePurchaseRequestRequest req) {
        return prService.update(id, req);
    }

    @PostMapping("/requests/{id}/submit")
    @PreAuthorize("hasAuthority('PURCHASE_CREATE')")
    public PurchaseRequestResponse submit(@PathVariable Long id) {
        return prService.submit(id);
    }

    @PostMapping("/requests/{id}/approve")
    @PreAuthorize("hasAuthority('APPROVE_PURCHASE_ORDER')")
    public PurchaseRequestResponse approve(@PathVariable Long id) {
        return prService.approve(id);
    }

    @PostMapping("/requests/{id}/reject")
    @PreAuthorize("hasAuthority('APPROVE_PURCHASE_ORDER')")
    public PurchaseRequestResponse reject(
            @PathVariable Long id,
            @RequestBody RejectRequest req) {
        return prService.reject(id, req.reason());
    }

    @PostMapping("/requests/{id}/convert-to-po")
    @PreAuthorize("hasAuthority('PURCHASE_CREATE')")
    public ConvertResponse convertToPo(@PathVariable Long id) {
        return prService.convertToPo(id);
    }

    @GetMapping("/ap-aging")
    @PreAuthorize("hasAuthority('PURCHASE_CREATE')")
    public List<PayableService.AgingBucket> apAging(@RequestParam(required = false) Long branchId) {
        return payableService.agingReport(branchId);
    }
}


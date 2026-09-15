package com.chuanphat.warranty.core.controller;

import com.chuanphat.warranty.core.dto.ResolveSupplierInvoiceMismatchRequest;
import com.chuanphat.warranty.core.dto.SupplierInvoiceDto;
import com.chuanphat.warranty.core.service.ThreeWayMatchService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/purchase/invoices")
public class SupplierInvoiceController {
    private final ThreeWayMatchService matchService;

    public SupplierInvoiceController(ThreeWayMatchService matchService) {
        this.matchService = matchService;
    }

    @PatchMapping("/{id}/match")
    @PreAuthorize("hasAuthority('PURCHASE_APPROVE')")
    public SupplierInvoiceDto match(@PathVariable Long id) {
        return matchService.match(id);
    }

    @PatchMapping("/{id}/resolve-mismatch")
    @PreAuthorize("hasAuthority('PURCHASE_APPROVE')")
    public SupplierInvoiceDto resolveMismatch(@PathVariable Long id,
                                              @Valid @RequestBody ResolveSupplierInvoiceMismatchRequest request) {
        return matchService.resolveMismatch(id, request.reason());
    }
}

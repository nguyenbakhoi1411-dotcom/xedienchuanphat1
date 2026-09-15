package com.chuanphat.warranty.core.controller;

import com.chuanphat.warranty.core.dto.ResolveSupplierInvoiceMismatchRequest;
import com.chuanphat.warranty.core.dto.PurchasePaymentDto;
import com.chuanphat.warranty.core.dto.PurchasePaymentRequest;
import com.chuanphat.warranty.core.dto.PurchasePaymentResultDto;
import com.chuanphat.warranty.core.dto.SupplierPayableAgingDto;
import com.chuanphat.warranty.core.dto.SupplierInvoiceDto;
import com.chuanphat.warranty.core.service.PurchasePaymentService;
import com.chuanphat.warranty.core.service.ThreeWayMatchService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/purchase/invoices")
public class SupplierInvoiceController {
    private final ThreeWayMatchService matchService;
    private final PurchasePaymentService paymentService;

    public SupplierInvoiceController(ThreeWayMatchService matchService,
                                     PurchasePaymentService paymentService) {
        this.matchService = matchService;
        this.paymentService = paymentService;
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

    @PostMapping("/{id}/payments")
    @PreAuthorize("hasAuthority('PURCHASE_PAY')")
    public PurchasePaymentResultDto pay(@PathVariable Long id,
                                        @Valid @RequestBody PurchasePaymentRequest request) {
        return paymentService.pay(new PurchasePaymentRequest(
                id,
                request.amount(),
                request.paymentDate(),
                request.paymentMethod(),
                request.referenceNo(),
                request.note()));
    }

    @GetMapping("/{id}/payments")
    @PreAuthorize("hasAuthority('PURCHASE_VIEW')")
    public List<PurchasePaymentDto> paymentHistory(@PathVariable Long id) {
        return paymentService.paymentHistory(id);
    }

    @GetMapping("/aging-report")
    @PreAuthorize("hasAuthority('PURCHASE_VIEW')")
    public List<SupplierPayableAgingDto> agingReport(@RequestParam(required = false) Long branchId) {
        return paymentService.agingReport(branchId);
    }
}

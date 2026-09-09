package com.chuanphat.warranty.core.controller;

import com.chuanphat.warranty.core.entity.PurchaseReturn;
import com.chuanphat.warranty.core.service.PurchaseReturnService;
import com.chuanphat.warranty.core.service.PurchaseReturnService.ReturnItemRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/purchase-returns")
@PreAuthorize("hasAnyRole('ADMIN')")
public class PurchaseReturnController {

    private final PurchaseReturnService returnService;

    public PurchaseReturnController(PurchaseReturnService returnService) {
        this.returnService = returnService;
    }

    @GetMapping
    public Page<PurchaseReturn> list(
            @RequestParam(required = false) Long branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return returnService.list(branchId, page, size);
    }

    @GetMapping("/{id}")
    public PurchaseReturn get(@PathVariable Long id) {
        return returnService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseReturn create(@Valid @RequestBody CreateReturnRequest req) {
        return returnService.create(
                req.supplierId(), req.branchId(), req.purchaseOrderId(),
                req.refundMethod(), req.reason(), req.note(), req.items());
    }

    @PostMapping("/{id}/complete")
    public PurchaseReturn complete(@PathVariable Long id) {
        return returnService.complete(id);
    }

    @PostMapping("/{id}/cancel")
    public PurchaseReturn cancel(@PathVariable Long id) {
        return returnService.cancel(id);
    }

    public record CreateReturnRequest(
            @NotNull Long supplierId,
            @NotNull Long branchId,
            Long purchaseOrderId,
            String refundMethod,    // DEDUCT_PAYABLE | CASH_REFUND
            String reason,
            String note,
            @NotNull List<ReturnItemRequest> items
    ) {}
}


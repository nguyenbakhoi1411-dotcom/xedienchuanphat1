package com.chuanphat.warranty.core.controller;

import com.chuanphat.warranty.core.entity.PurchaseReturn;
import com.chuanphat.warranty.core.enums.PurchaseReturnReasonCode;
import com.chuanphat.warranty.core.service.PurchaseReturnService;
import com.chuanphat.warranty.core.service.PurchaseReturnService.ReturnItemRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/purchase-returns")
@PreAuthorize("hasRole('ADMIN')")
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
                req.purchaseReceiptId(), req.reasonCode(), req.reasonNote(), req.note(), req.items());
    }

    @PostMapping("/{id}/approve")
    public PurchaseReturn approve(@PathVariable Long id) {
        return returnService.approve(id);
    }

    @PostMapping("/{id}/ship-back")
    public PurchaseReturn shipBack(@PathVariable Long id) {
        return returnService.shipBack(id);
    }

    @PostMapping("/{id}/complete")
    public PurchaseReturn complete(@PathVariable Long id) {
        return returnService.complete(id);
    }

    @PostMapping("/{id}/reject")
    public PurchaseReturn reject(@PathVariable Long id, @RequestBody(required = false) RejectReturnRequest req) {
        return returnService.reject(id, req == null ? null : req.reason());
    }

    public record CreateReturnRequest(
            @NotNull Long purchaseReceiptId,
            @NotNull PurchaseReturnReasonCode reasonCode,
            String reasonNote,
            String note,
            @NotNull List<ReturnItemRequest> items
    ) {}

    public record RejectReturnRequest(String reason) {}
}

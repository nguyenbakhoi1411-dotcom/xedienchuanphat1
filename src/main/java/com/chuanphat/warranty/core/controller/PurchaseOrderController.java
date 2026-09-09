package com.chuanphat.warranty.core.controller;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.core.dto.PurchaseOrderDto;
import com.chuanphat.warranty.core.dto.PurchaseOrderRequest;
import com.chuanphat.warranty.core.enums.PurchaseOrderStatus;
import com.chuanphat.warranty.core.service.PurchaseOrderService;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/purchase-orders")
@PreAuthorize("hasAnyRole('ADMIN')")
public class PurchaseOrderController {

    private final PurchaseOrderService poService;

    public PurchaseOrderController(PurchaseOrderService poService) {
        this.poService = poService;
    }

    @GetMapping
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
    public PurchaseOrderDto get(@PathVariable Long id) {
        return poService.get(id);
    }

    /** Don mua co han thanh toan qua han */
    @GetMapping("/overdue")
    public List<PurchaseOrderDto> overdue(@RequestParam(required = false) Long branchId) {
        return poService.getOverduePayments(branchId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseOrderDto create(@Valid @RequestBody PurchaseOrderRequest req) {
        return poService.create(req);
    }

    /** Gui duyet (DRAFT -> PENDING_APPROVAL / APPROVED) */
    @PostMapping("/{id}/submit")
    public PurchaseOrderDto submit(@PathVariable Long id) {
        return poService.submit(id);
    }

    /** Duyet (PENDING_APPROVAL -> APPROVED) */
    @PostMapping("/{id}/approve")
    public PurchaseOrderDto approve(@PathVariable Long id) {
        return poService.approve(id);
    }

    /** Tu choi (PENDING_APPROVAL -> REJECTED) */
    @PostMapping("/{id}/reject")
    public PurchaseOrderDto reject(@PathVariable Long id,
                                   @RequestParam(defaultValue = "") String reason) {
        return poService.reject(id, reason);
    }

    /** Huy don (DRAFT / PENDING_APPROVAL -> CANCELLED) */
    @PostMapping("/{id}/cancel")
    public PurchaseOrderDto cancel(@PathVariable Long id,
                                    @RequestParam(defaultValue = "") String reason) {
        return poService.cancel(id, reason);
    }

    /** Ghi nhan thanh toan NCC */
    @PostMapping("/{id}/pay")
    public PurchaseOrderDto pay(@PathVariable Long id,
                                 @RequestBody Map<String, Object> body) {
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        return poService.pay(id, amount);
    }
}


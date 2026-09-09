package com.chuanphat.warranty.core.controller;

import com.chuanphat.warranty.audit.annotation.Audited;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import com.chuanphat.warranty.core.dto.CreateDepositRequest;
import com.chuanphat.warranty.core.dto.DepositResponse;
import com.chuanphat.warranty.core.service.DepositService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller expose DepositService (dat coc xe).
 *
 * Tat ca endpoint nam trong /api/sales/deposits de nham chung voi prefix sales.
 *
 * Luong:
 *   POST   /deposits          — Tao phieu dat coc moi
 *   GET    /deposits          — Danh sach theo chi nhanh
 *   GET    /deposits/customer/{customerId} — Theo khach hang
 *   GET    /deposits/{id}     — Chi tiet
 *   POST   /deposits/{id}/convert — Chuyen thanh don hang (kem salesOrderId)
 *   POST   /deposits/{id}/refund  — Hoan coc
 */
@RestController
@RequestMapping("/api/sales/deposits")
@PreAuthorize("hasAnyRole('ADMIN')")
public class DepositController {

    private final DepositService depositService;

    public DepositController(DepositService depositService) {
        this.depositService = depositService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SALES_VIEW')")
    public List<DepositResponse> list(@RequestParam(required = false) Long branchId) {
        return depositService.listByBranch(branchId);
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAuthority('SALES_VIEW')")
    public List<DepositResponse> byCustomer(@PathVariable Long customerId) {
        return depositService.listByCustomer(customerId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SALES_VIEW')")
    public DepositResponse get(@PathVariable Long id) {
        return depositService.get(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SALES_CREATE')")
    @Audited(action = AuditAction.CREATE_DEPOSIT, module = AuditModule.SALES, entityType = "Deposit")
    public DepositResponse create(@Valid @RequestBody CreateDepositRequest request) {
        return depositService.create(request);
    }

    @PostMapping("/{id}/convert")
    @PreAuthorize("hasAuthority('SALES_UPDATE')")
    @Audited(action = AuditAction.UPDATE_ORDER, module = AuditModule.SALES, entityType = "Deposit", entityIdParam = "id")
    public DepositResponse convert(@PathVariable Long id,
                                   @RequestBody ConvertDepositRequest request) {
        return depositService.convertToOrder(id, request.salesOrderId(), request.salesOrderNo());
    }

    @PostMapping("/{id}/refund")
    @PreAuthorize("hasAuthority('SALES_RETURN')")
    @Audited(action = AuditAction.CREATE_RETURN, module = AuditModule.SALES, entityType = "Deposit", entityIdParam = "id")
    public DepositResponse refund(@PathVariable Long id) {
        return depositService.refund(id, null);
    }

    record ConvertDepositRequest(Long salesOrderId, String salesOrderNo) {}
}


package com.chuanphat.warranty.cash.controller;

import com.chuanphat.warranty.cash.dto.*;
import com.chuanphat.warranty.cash.entity.CashVoucherStatus;
import com.chuanphat.warranty.cash.entity.CashVoucherType;
import com.chuanphat.warranty.cash.service.CashVoucherService;
import com.chuanphat.warranty.common.security.BranchSecurity;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/cash")
@PreAuthorize("hasAnyRole('ADMIN')")
public class CashVoucherController {

    private final CashVoucherService service;
    private final BranchSecurity branchSecurity;

    public CashVoucherController(CashVoucherService service, BranchSecurity branchSecurity) {
        this.service = service;
        this.branchSecurity = branchSecurity;
    }

    @PostMapping("/vouchers")
    @PreAuthorize("hasAuthority('RECEIPT_CREATE') or hasAuthority('PAYMENT_CREATE')")
    public CashVoucherResponse create(
            @Valid @RequestBody CreateCashVoucherRequest request,
            @RequestParam(required = false) Long branchId
    ) {
        Long targetBranchId = branchSecurity.scopedBranchId(branchId);
        return service.createVoucher(request, targetBranchId);
    }

    @GetMapping("/vouchers")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public Page<CashVoucherResponse> list(
            @RequestParam(required = false) CashVoucherType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) CashVoucherStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long branchId
    ) {
        return service.listVouchers(type, fromDate, toDate, status, page, size, branchId);
    }

    @GetMapping("/vouchers/{id}")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public CashVoucherResponse get(@PathVariable Long id) {
        return service.getVoucher(id);
    }

    @PutMapping("/vouchers/{id}")
    @PreAuthorize("hasAuthority('RECEIPT_CREATE') or hasAuthority('PAYMENT_CREATE')")
    public CashVoucherResponse update(
            @PathVariable Long id,
            @Valid @RequestBody CreateCashVoucherRequest request
    ) {
        return service.updateVoucher(id, request);
    }

    @PostMapping("/vouchers/{id}/post")
    @PreAuthorize("hasAuthority('ACCOUNTING_POST')")
    public CashVoucherResponse post(@PathVariable Long id) {
        return service.postVoucher(id);
    }

    @PostMapping("/vouchers/{id}/cancel")
    @PreAuthorize("hasAuthority('ACCOUNTING_CANCEL')")
    public CashVoucherResponse cancel(
            @PathVariable Long id,
            @RequestBody CancelRequest request
    ) {
        String reason = request != null ? request.reason() : "";
        return service.cancelVoucher(id, reason);
    }

    @GetMapping("/cashbook")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public List<CashBookResponse> cashbook(
            @RequestParam(required = false) String accountCode,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam Long branchId
    ) {
        return service.getCashBook(accountCode, fromDate, toDate, branchId);
    }

    @GetMapping("/balance")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public CashBalanceResponse balance(@RequestParam Long branchId) {
        return service.getBalance(branchId);
    }

    public record CancelRequest(String reason) {}
}


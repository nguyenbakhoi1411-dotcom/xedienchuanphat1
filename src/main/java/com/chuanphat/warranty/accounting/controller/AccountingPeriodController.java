package com.chuanphat.warranty.accounting.controller;

import com.chuanphat.warranty.accounting.dto.AccountingPeriodDtos;
import com.chuanphat.warranty.accounting.service.AccountingPeriodService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/accounting/periods", "/api/v1/accounting/periods"})
@PreAuthorize("hasAnyRole('ADMIN')")
public class AccountingPeriodController {

    private final AccountingPeriodService periodService;

    public AccountingPeriodController(AccountingPeriodService periodService) {
        this.periodService = periodService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ACCOUNTING_VIEW', 'VIEW_ACCOUNTING', 'LOCK_ACCOUNTING_PERIOD')")
    public ResponseEntity<List<AccountingPeriodDtos.PeriodResponse>> getAll() {
        return ResponseEntity.ok(periodService.getAllPeriods());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('LOCK_ACCOUNTING_PERIOD')")
    public ResponseEntity<AccountingPeriodDtos.PeriodResponse> create(
            @RequestBody AccountingPeriodDtos.CreatePeriodRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(periodService.createPeriod(req, user.getUsername()));
    }

    @PatchMapping("/{id}/lock")
    @PreAuthorize("hasAuthority('LOCK_ACCOUNTING_PERIOD')")
    public ResponseEntity<AccountingPeriodDtos.PeriodResponse> lock(
            @PathVariable Long id,
            @RequestBody AccountingPeriodDtos.LockUnlockRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(periodService.lockPeriod(id, user.getUsername(), req.note()));
    }

    @PatchMapping("/{id}/unlock")
    @PreAuthorize("hasAuthority('UNLOCK_ACCOUNTING_PERIOD')")
    public ResponseEntity<AccountingPeriodDtos.PeriodResponse> unlock(
            @PathVariable Long id,
            @RequestBody AccountingPeriodDtos.LockUnlockRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(periodService.unlockPeriod(id, user.getUsername(), req.note()));
    }
}


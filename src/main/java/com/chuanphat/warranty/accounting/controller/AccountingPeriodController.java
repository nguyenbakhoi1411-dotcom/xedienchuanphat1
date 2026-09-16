package com.chuanphat.warranty.accounting.controller;

import com.chuanphat.warranty.accounting.dto.AccountingPeriodDtos;
import com.chuanphat.warranty.accounting.service.AccountingPeriodService;
import com.chuanphat.warranty.audit.annotation.Audited;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounting/periods")
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
    @PreAuthorize("hasAnyRole('ADMIN','CHIEF_ACCOUNTANT')")
    @Audited(action = AuditAction.LOCK_ACCOUNTING_PERIOD, module = AuditModule.ACCOUNTING, entityType = "AccountingPeriod")
    public ResponseEntity<AccountingPeriodDtos.PeriodResponse> create(
            @RequestBody AccountingPeriodDtos.CreatePeriodRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(periodService.createPeriod(req, user.getUsername()));
    }

    @PatchMapping("/{id}/lock")
    @PreAuthorize("hasAnyRole('ADMIN','CHIEF_ACCOUNTANT')")
    @Audited(action = AuditAction.LOCK_ACCOUNTING_PERIOD, module = AuditModule.ACCOUNTING, entityType = "AccountingPeriod", entityIdParam = "id")
    public ResponseEntity<AccountingPeriodDtos.PeriodResponse> lock(
            @PathVariable Long id,
            @RequestBody AccountingPeriodDtos.LockUnlockRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(periodService.lockPeriod(id, user.getUsername(), req.note()));
    }

    @PatchMapping("/{year}/{month}/lock")
    @PreAuthorize("hasAnyRole('ADMIN','CHIEF_ACCOUNTANT')")
    @Audited(action = AuditAction.LOCK_ACCOUNTING_PERIOD, module = AuditModule.ACCOUNTING, entityType = "AccountingPeriod")
    public ResponseEntity<AccountingPeriodDtos.PeriodResponse> lockByMonth(
            @PathVariable int year,
            @PathVariable int month,
            @RequestBody(required = false) AccountingPeriodDtos.LockUnlockRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(periodService.lockMonthlyPeriod(year, month, user.getUsername(), req == null ? null : req.note()));
    }

    @PatchMapping("/{id}/unlock")
    @PreAuthorize("hasAnyRole('ADMIN','CHIEF_ACCOUNTANT')")
    @Audited(action = AuditAction.UNLOCK_ACCOUNTING_PERIOD, module = AuditModule.ACCOUNTING, entityType = "AccountingPeriod", entityIdParam = "id")
    public ResponseEntity<AccountingPeriodDtos.PeriodResponse> unlock(
            @PathVariable Long id,
            @RequestBody AccountingPeriodDtos.LockUnlockRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(periodService.unlockPeriod(id, user.getUsername(), req.note(), req.reason()));
    }

    @PatchMapping("/{year}/{month}/unlock")
    @PreAuthorize("hasAnyRole('ADMIN','CHIEF_ACCOUNTANT')")
    @Audited(action = AuditAction.UNLOCK_ACCOUNTING_PERIOD, module = AuditModule.ACCOUNTING, entityType = "AccountingPeriod")
    public ResponseEntity<AccountingPeriodDtos.PeriodResponse> unlockByMonth(
            @PathVariable int year,
            @PathVariable int month,
            @RequestBody AccountingPeriodDtos.LockUnlockRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(periodService.unlockMonthlyPeriod(year, month, user.getUsername(), req.note(), req.reason()));
    }
}

package com.chuanphat.warranty.accounting.controller;

import com.chuanphat.warranty.accounting.dto.OpeningBalanceLockRequest;
import com.chuanphat.warranty.accounting.dto.OpeningBalanceResponse;
import com.chuanphat.warranty.accounting.dto.OpeningBalanceRowRequest;
import com.chuanphat.warranty.accounting.service.OpeningBalanceService;
import com.chuanphat.warranty.audit.annotation.Audited;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/accounting/opening-balances")
@PreAuthorize("hasAnyRole('ADMIN')")
public class OpeningBalanceController {
    private final OpeningBalanceService openingBalanceService;

    public OpeningBalanceController(OpeningBalanceService openingBalanceService) {
        this.openingBalanceService = openingBalanceService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('OPENING_BALANCE_MANAGE')")
    public List<OpeningBalanceResponse> getOpeningBalances(
            @RequestParam Long periodId,
            @RequestParam(required = false) Long branchId
    ) {
        return openingBalanceService.getOpeningBalances(periodId, branchId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('OPENING_BALANCE_MANAGE')")
    @Audited(action = AuditAction.UPDATE_SETTING, module = AuditModule.ACCOUNTING, entityType = "OpeningBalance")
    public List<OpeningBalanceResponse> bulkUpsert(@Valid @RequestBody List<OpeningBalanceRowRequest> requests) {
        return openingBalanceService.bulkUpsert(requests);
    }

    @PostMapping("/lock")
    @PreAuthorize("hasAuthority('OPENING_BALANCE_MANAGE')")
    @Audited(action = AuditAction.UPDATE_SETTING, module = AuditModule.ACCOUNTING, entityType = "OpeningBalance")
    public List<OpeningBalanceResponse> lockOpeningBalances(
            @Valid @RequestBody OpeningBalanceLockRequest request,
            @RequestParam(required = false) Long branchId
    ) {
        return openingBalanceService.lockOpeningBalances(request.periodId(), branchId);
    }
}


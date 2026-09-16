package com.chuanphat.warranty.accounting.controller;

import com.chuanphat.warranty.accounting.dto.AccountMappingDtos;
import com.chuanphat.warranty.accounting.enums.AccountMappingTransactionType;
import com.chuanphat.warranty.accounting.service.AccountMappingService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/accounting/account-mappings")
public class AccountMappingController {
    private final AccountMappingService accountMappingService;

    public AccountMappingController(AccountMappingService accountMappingService) {
        this.accountMappingService = accountMappingService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public List<AccountMappingDtos.AccountMappingResponse> listMappings() {
        return accountMappingService.listMappings();
    }

    @PatchMapping
    @PreAuthorize("hasAnyRole('ADMIN','CHIEF_ACCOUNTANT')")
    public AccountMappingDtos.AccountMappingResponse updateMapping(
            @Valid @RequestBody AccountMappingDtos.UpdateAccountMappingRequest request,
            @AuthenticationPrincipal UserDetails user
    ) {
        return accountMappingService.updateMapping(request, user == null ? "system" : user.getUsername());
    }

    @GetMapping("/history")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public List<AccountMappingDtos.AccountMappingHistoryResponse> history(@RequestParam AccountMappingTransactionType transactionType) {
        return accountMappingService.history(transactionType);
    }
}

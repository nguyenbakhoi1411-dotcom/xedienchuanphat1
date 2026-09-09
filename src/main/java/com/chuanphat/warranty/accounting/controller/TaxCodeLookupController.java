package com.chuanphat.warranty.accounting.controller;

import com.chuanphat.warranty.accounting.dto.TaxCodeLookupDto;
import com.chuanphat.warranty.accounting.service.TaxCodeLookupService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounting/tax-code-lookup")
@PreAuthorize("hasAnyRole('ADMIN')")
public class TaxCodeLookupController {

    private final TaxCodeLookupService taxCodeLookupService;

    public TaxCodeLookupController(TaxCodeLookupService taxCodeLookupService) {
        this.taxCodeLookupService = taxCodeLookupService;
    }

    @GetMapping("/{taxCode}")
    @PreAuthorize("hasAuthority('TAX_VIEW') or hasAuthority('PURCHASE_MANAGE')")
    public ResponseEntity<TaxCodeLookupDto> lookupTaxCode(@PathVariable String taxCode) {
        return ResponseEntity.ok(taxCodeLookupService.lookupTaxCode(taxCode));
    }
}


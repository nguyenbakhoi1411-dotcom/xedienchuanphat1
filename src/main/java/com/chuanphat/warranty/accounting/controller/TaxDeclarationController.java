package com.chuanphat.warranty.accounting.controller;

import com.chuanphat.warranty.accounting.dto.GenerateTaxDeclarationRequest;
import com.chuanphat.warranty.accounting.dto.TaxDeclarationDto;
import com.chuanphat.warranty.accounting.service.TaxDeclarationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounting/tax-declarations")
@PreAuthorize("hasAnyRole('ADMIN')")
public class TaxDeclarationController {

    private final TaxDeclarationService declarationService;

    public TaxDeclarationController(TaxDeclarationService declarationService) {
        this.declarationService = declarationService;
    }

    @PostMapping("/generate")
    @PreAuthorize("hasAuthority('TAX_MANAGE')")
    public ResponseEntity<TaxDeclarationDto> generateDeclaration(@Valid @RequestBody GenerateTaxDeclarationRequest request) {
        return ResponseEntity.ok(declarationService.generateDeclaration(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('TAX_VIEW')")
    public ResponseEntity<TaxDeclarationDto> getDeclaration(@PathVariable Long id) {
        return ResponseEntity.ok(declarationService.getDeclaration(id));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAuthority('TAX_MANAGE')")
    public ResponseEntity<TaxDeclarationDto> submitDeclaration(@PathVariable Long id) {
        // Mock user details since we don't have authentication context easily accessible in this simple controller
        String user = "system"; 
        return ResponseEntity.ok(declarationService.submitDeclaration(id, user));
    }
}


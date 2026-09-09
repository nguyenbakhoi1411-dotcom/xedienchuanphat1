package com.chuanphat.warranty.accounting.controller;

import com.chuanphat.warranty.accounting.dto.RunVatOffsetRequest;
import com.chuanphat.warranty.accounting.dto.VatOffsetPreviewDto;
import com.chuanphat.warranty.accounting.dto.VatOffsetRunDto;
import com.chuanphat.warranty.accounting.service.VatOffsetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounting/vat-offset")
@PreAuthorize("hasAnyRole('ADMIN')")
public class VatOffsetController {

    private final VatOffsetService vatOffsetService;

    public VatOffsetController(VatOffsetService vatOffsetService) {
        this.vatOffsetService = vatOffsetService;
    }

    @GetMapping("/preview")
    @PreAuthorize("hasAuthority('TAX_VIEW')")
    public ResponseEntity<VatOffsetPreviewDto> previewOffset(@RequestParam Integer month, 
                                                             @RequestParam Integer year, 
                                                             @RequestParam Long branchId) {
        return ResponseEntity.ok(vatOffsetService.previewOffset(month, year, branchId));
    }

    @PostMapping("/run")
    @PreAuthorize("hasAuthority('TAX_MANAGE')")
    public ResponseEntity<VatOffsetRunDto> runOffset(@Valid @RequestBody RunVatOffsetRequest request) {
        // Mock user details
        String user = "system"; 
        return ResponseEntity.ok(vatOffsetService.runOffset(request, user));
    }
}


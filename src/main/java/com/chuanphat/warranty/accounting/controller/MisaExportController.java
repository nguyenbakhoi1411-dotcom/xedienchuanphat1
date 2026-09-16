package com.chuanphat.warranty.accounting.controller;

import com.chuanphat.warranty.accounting.dto.MisaExportReconciliationResult;
import com.chuanphat.warranty.accounting.service.MisaExportReconciliationService;
import com.chuanphat.warranty.accounting.service.MisaExportService;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MisaExportController {
    private final MisaExportReconciliationService reconciliationService;
    private final MisaExportService misaExportService;

    public MisaExportController(MisaExportReconciliationService reconciliationService, MisaExportService misaExportService) {
        this.reconciliationService = reconciliationService;
        this.misaExportService = misaExportService;
    }

    @GetMapping({"/api/accounting/misa-export", "/api/v1/sales/misa-export"})
    @PreAuthorize("hasAnyAuthority('INVOICE_EXPORT','ACCOUNTING_VIEW')")
    public ResponseEntity<?> export(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        MisaExportReconciliationResult result = reconciliationService.checkBeforeExport(fromDate, toDate);
        if (result.hasIssues()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(result);
        }

        byte[] csv = misaExportService.exportCsv(fromDate, toDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=misa-export-" + fromDate + "-" + toDate + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}

package com.chuanphat.warranty.accounting.controller;

import com.chuanphat.warranty.accounting.dto.MisaExportReconciliationResult;
import com.chuanphat.warranty.accounting.service.MisaExportReconciliationService;
import com.chuanphat.warranty.accounting.service.MisaExportService;
import com.chuanphat.warranty.audit.dto.CreateAuditLogRequest;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import com.chuanphat.warranty.audit.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import com.chuanphat.warranty.reports.ReportSnapshotService;
import java.time.LocalDate;
import java.util.Map;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MisaExportController {
    private final MisaExportReconciliationService reconciliationService;
    private final MisaExportService misaExportService;
    private final ReportSnapshotService snapshotService;
    private final AuditLogService auditLogService;

    public MisaExportController(
            MisaExportReconciliationService reconciliationService,
            MisaExportService misaExportService,
            ReportSnapshotService snapshotService,
            AuditLogService auditLogService
    ) {
        this.reconciliationService = reconciliationService;
        this.misaExportService = misaExportService;
        this.snapshotService = snapshotService;
        this.auditLogService = auditLogService;
    }

    @GetMapping({"/api/accounting/misa-export", "/api/v1/sales/misa-export"})
    @PreAuthorize("hasAnyAuthority('INVOICE_EXPORT','ACCOUNTING_VIEW')")
    public ResponseEntity<?> export(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            Authentication authentication,
            HttpServletRequest request
    ) {
        MisaExportReconciliationResult result = reconciliationService.checkBeforeExport(fromDate, toDate);
        if (result.hasIssues()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(result);
        }

        byte[] csv = misaExportService.exportCsv(fromDate, toDate);
        snapshotService.createOfficialSnapshot(
                ReportSnapshotService.MISA_EXPORT,
                "csv",
                fromDate,
                toDate,
                Map.of("fromDate", fromDate, "toDate", toDate),
                misaExportService.exportRows(fromDate, toDate),
                authentication == null ? "system" : authentication.getName()
        );
        auditLogService.record(new CreateAuditLogRequest(
                authentication == null ? "system" : authentication.getName(),
                AuditAction.EXPORT_REPORT,
                AuditModule.ACCOUNTING,
                "MisaExport",
                fromDate + ":" + toDate,
                null,
                "csv",
                clientIp(request),
                request.getHeader("User-Agent")
        ));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=misa-export-" + fromDate + "-" + toDate + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

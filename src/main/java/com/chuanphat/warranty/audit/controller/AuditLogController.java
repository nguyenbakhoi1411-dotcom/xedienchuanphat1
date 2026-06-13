package com.chuanphat.warranty.audit.controller;

import com.chuanphat.warranty.audit.dto.AuditLogFilter;
import com.chuanphat.warranty.audit.dto.AuditLogPageResponse;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import com.chuanphat.warranty.audit.service.AuditLogService;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {
    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('AUDIT_VIEW','VIEW_AUDIT_LOG')")
    public AuditLogPageResponse search(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) AuditAction action,
            @RequestParam(required = false) AuditModule module,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String entityId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        return auditLogService.search(
                new AuditLogFilter(userId, action, module, entityType, entityId, fromDate, toDate),
                page,
                pageSize
        );
    }

    @GetMapping("/export")
    @PreAuthorize("hasAnyAuthority('AUDIT_VIEW','VIEW_AUDIT_LOG')")
    public ResponseEntity<byte[]> export(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) AuditAction action,
            @RequestParam(required = false) AuditModule module,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String entityId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime toDate
    ) {
        byte[] content = auditLogService.exportCsv(new AuditLogFilter(userId, action, module, entityType, entityId, fromDate, toDate));
        String fileName = "audit-log-" + OffsetDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")) + ".csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(content);
    }
}

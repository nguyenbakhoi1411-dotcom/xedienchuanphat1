package com.chuanphat.warranty.operations;

import com.chuanphat.warranty.common.dto.PageResponse;
import java.time.OffsetDateTime;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.chuanphat.warranty.security.PublicEndpoint;

@RestController
@RequestMapping("/api/v1/system/operations")
@PublicEndpoint
public class SystemOperationController {
    private final SystemOperationService service;

    public SystemOperationController(SystemOperationService service) {
        this.service = service;
    }

    @GetMapping("/api/system/health")
    @PreAuthorize("isAuthenticated()")
    public OperationDtos.SystemHealthResponse health() {
        return service.health();
    }

    @GetMapping("/api/system/info")
    @PreAuthorize("isAuthenticated()")
    public OperationDtos.SystemInfoResponse info() {
        return service.info();
    }

    @PostMapping("/api/system/backup")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public OperationDtos.BackupResponse backup() {
        return service.backup();
    }

    @PatchMapping("/api/system/restore")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public OperationDtos.BackupResponse restore(@RequestBody OperationDtos.RestoreRequest request) {
        return service.restore(request);
    }

    @GetMapping("/api/system/error-logs")
    @PreAuthorize("hasAuthority('AUDIT_VIEW')")
    public PageResponse<OperationDtos.ErrorLogResponse> errorLogs(
            @RequestParam(required = false) ErrorSeverity severity,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        return service.errorLogs(severity, module, fromDate, toDate, page, pageSize);
    }
}

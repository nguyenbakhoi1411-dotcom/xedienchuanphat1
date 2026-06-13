package com.chuanphat.warranty.reports;

import com.chuanphat.warranty.audit.dto.CreateAuditLogRequest;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import com.chuanphat.warranty.audit.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.util.Map;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportService service;
    private final AuditLogService auditLogService;

    public ReportController(ReportService service, AuditLogService auditLogService) {
        this.service = service;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/{type}")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public Map<String, Object> report(
            @PathVariable String type,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String productCategory,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int pageSize
    ) {
        DateRange range = defaultRange(fromDate, toDate);
        return service.report(type, range.fromDate(), range.toDate(), branchId, employeeId, productId, customerId, status, productCategory, page, pageSize);
    }

    @GetMapping("/{type}/export")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> export(
            @PathVariable String type,
            @RequestParam(defaultValue = "excel") String format,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) String productCategory,
            Authentication authentication,
            HttpServletRequest request
    ) {
        DateRange range = defaultRange(fromDate, toDate);
        ReportService.ExportFile file = service.export(type, format, range.fromDate(), range.toDate(), branchId, employeeId, productId, productCategory);
        auditLogService.record(new CreateAuditLogRequest(
                authentication == null ? "system" : authentication.getName(),
                AuditAction.EXPORT_REPORT,
                AuditModule.SYSTEM,
                "Report",
                type,
                null,
                format,
                clientIp(request),
                request.getHeader("User-Agent")
        ));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(file.fileName()).build().toString())
                .contentType(MediaType.parseMediaType(file.contentType()))
                .body(file.content());
    }

    @GetMapping("/{type}/export/excel")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportExcel(
            @PathVariable String type,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) String productCategory,
            Authentication authentication,
            HttpServletRequest request
    ) {
        return export(type, "excel", fromDate, toDate, branchId, employeeId, productId, productCategory, authentication, request);
    }

    @GetMapping("/{type}/export/pdf")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportPdf(
            @PathVariable String type,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) String productCategory,
            Authentication authentication,
            HttpServletRequest request
    ) {
        return export(type, "pdf", fromDate, toDate, branchId, employeeId, productId, productCategory, authentication, request);
    }

    @GetMapping("/revenue-time")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public Map<String, Object> revenueTime(@RequestParam(required = false) LocalDate fromDate, @RequestParam(required = false) LocalDate toDate, @RequestParam(required = false) Long branchId, @RequestParam(required = false) Long employeeId, @RequestParam(required = false) Long productId) {
        DateRange range = defaultRange(fromDate, toDate);
        return service.revenueTime(range.fromDate(), range.toDate(), branchId, employeeId, productId);
    }

    @GetMapping("/revenue-branch")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public Map<String, Object> revenueBranch(@RequestParam(required = false) LocalDate fromDate, @RequestParam(required = false) LocalDate toDate, @RequestParam(required = false) Long branchId) {
        DateRange range = defaultRange(fromDate, toDate);
        return service.revenueBranch(range.fromDate(), range.toDate(), branchId);
    }

    @GetMapping("/revenue-employee")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public Map<String, Object> revenueEmployee(@RequestParam(required = false) LocalDate fromDate, @RequestParam(required = false) LocalDate toDate, @RequestParam(required = false) Long branchId, @RequestParam(required = false) Long employeeId, @RequestParam(required = false) Long productId) {
        DateRange range = defaultRange(fromDate, toDate);
        return service.revenueEmployee(range.fromDate(), range.toDate(), branchId, employeeId, productId);
    }

    @GetMapping("/top-products")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public Map<String, Object> topProducts(@RequestParam(required = false) LocalDate fromDate, @RequestParam(required = false) LocalDate toDate, @RequestParam(required = false) Long branchId, @RequestParam(required = false) Long employeeId, @RequestParam(required = false) Long productId) {
        DateRange range = defaultRange(fromDate, toDate);
        return service.topProducts(range.fromDate(), range.toDate(), branchId, employeeId, productId);
    }

    @GetMapping("/inventory")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public Map<String, Object> inventory(
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long productId
    ) {
        return service.inventory(branchId, productId);
    }

    @GetMapping("/debt")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public Map<String, Object> debt(
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long productId
    ) { return service.debt(branchId); }

    @GetMapping("/profit")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public Map<String, Object> profit(
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long productId
    ) {
        DateRange range = defaultRange(fromDate, toDate);
        return service.profit(range.fromDate(), range.toDate(), branchId, employeeId, productId);
    }

    @GetMapping("/warranty-repair")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public Map<String, Object> warrantyRepair(
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long productId
    ) {
        DateRange range = defaultRange(fromDate, toDate);
        return service.warrantyRepair(range.fromDate(), range.toDate(), branchId);
    }

    private DateRange defaultRange(LocalDate fromDate, LocalDate toDate) {
        LocalDate today = LocalDate.now();
        return new DateRange(
                fromDate == null ? today.withDayOfMonth(1) : fromDate,
                toDate == null ? today : toDate
        );
    }

    private record DateRange(LocalDate fromDate, LocalDate toDate) {
    }

    private String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

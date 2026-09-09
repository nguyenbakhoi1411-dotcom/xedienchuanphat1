package com.chuanphat.warranty.dashboard;

import com.chuanphat.warranty.dashboard.DashboardService.DashboardFilter;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@PreAuthorize("hasAnyRole('ADMIN')")
public class DashboardController {
    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAuthority('DASHBOARD_VIEW')")
    public Map<String, Object> summary(@RequestParam(required = false) Long branchId) { return service.summary(branchId); }

    @GetMapping("/revenue-by-month")
    @PreAuthorize("hasAuthority('DASHBOARD_VIEW')")
    public List<Map<String, Object>> revenueByMonth(@RequestParam(required = false) Long branchId) { return service.revenueByMonth(branchId); }

    @GetMapping("/revenue-by-branch")
    @PreAuthorize("hasAuthority('DASHBOARD_VIEW')")
    public List<Map<String, Object>> revenueByBranch(@RequestParam(required = false) Long branchId) { return service.revenueByBranch(branchId); }

    @GetMapping("/top-products")
    @PreAuthorize("hasAuthority('DASHBOARD_VIEW')")
    public List<Map<String, Object>> topProducts(@RequestParam(required = false) Long branchId) { return service.topProducts(branchId); }

    @GetMapping("/warranty-tickets")
    @PreAuthorize("hasAuthority('DASHBOARD_VIEW')")
    public List<Map<String, Object>> warrantyTickets(@RequestParam(required = false) Long branchId) { return service.warrantyTickets(branchId); }

    @GetMapping
    @PreAuthorize("hasAuthority('DASHBOARD_VIEW')")
    public Map<String, Object> dashboard(
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) String timeRange,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String productCategory
    ) {
        return service.dashboard(new DashboardFilter(fromDate, toDate, month, timeRange, branchId, employeeId, productCategory));
    }
}


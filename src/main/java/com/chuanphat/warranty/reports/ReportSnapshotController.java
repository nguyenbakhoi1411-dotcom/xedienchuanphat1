package com.chuanphat.warranty.reports;

import com.chuanphat.warranty.reports.dto.ReportSnapshotDtos;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/report-snapshots")
public class ReportSnapshotController {
    private final ReportSnapshotService snapshotService;

    public ReportSnapshotController(ReportSnapshotService snapshotService) {
        this.snapshotService = snapshotService;
    }

    @GetMapping("/{id}/comparison")
    @PreAuthorize("hasAnyAuthority('REPORT_VIEW','ACCOUNTING_VIEW')")
    public ReportSnapshotDtos.ReportSnapshotComparisonResponse compare(@PathVariable Long id) {
        return snapshotService.compareWithCurrent(id);
    }
}

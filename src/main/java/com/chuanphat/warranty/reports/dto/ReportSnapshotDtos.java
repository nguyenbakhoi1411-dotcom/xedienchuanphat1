package com.chuanphat.warranty.reports.dto;

import com.chuanphat.warranty.reports.entity.ReportExportSnapshot;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public final class ReportSnapshotDtos {
    private ReportSnapshotDtos() {
    }

    public record ReportSnapshotResponse(
            Long id,
            String reportType,
            String format,
            LocalDate fromDate,
            LocalDate toDate,
            String contentHash,
            String exportedBy,
            OffsetDateTime exportedAt,
            String dataJson
    ) {
        public static ReportSnapshotResponse from(ReportExportSnapshot snapshot) {
            return new ReportSnapshotResponse(
                    snapshot.getId(),
                    snapshot.getReportType(),
                    snapshot.getFormat(),
                    snapshot.getFromDate(),
                    snapshot.getToDate(),
                    snapshot.getContentHash(),
                    snapshot.getExportedBy(),
                    snapshot.getExportedAt(),
                    snapshot.getDataJson()
            );
        }
    }

    public record ReportSnapshotComparisonResponse(
            Long snapshotId,
            boolean hasDelta,
            String snapshotDataJson,
            String currentDataJson,
            String snapshotHash,
            String currentHash
    ) {
    }
}

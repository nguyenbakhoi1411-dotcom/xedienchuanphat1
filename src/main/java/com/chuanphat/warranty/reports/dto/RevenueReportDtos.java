package com.chuanphat.warranty.reports.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class RevenueReportDtos {
    private RevenueReportDtos() {
    }

    public enum PeriodGrouping {
        DAY,
        WEEK,
        MONTH
    }

    public enum BusinessLine {
        FOOD,
        EV
    }

    public record RevenueReportResponse(
            LocalDate fromDate,
            LocalDate toDate,
            PeriodGrouping grouping,
            BigDecimal totalRevenue,
            BigDecimal previousPeriodRevenue,
            BigDecimal changeAmount,
            List<RevenueReportRow> rows
    ) {
    }

    public record RevenueReportRow(
            LocalDate periodStart,
            BusinessLine businessLine,
            Long warehouseId,
            String warehouseName,
            Long employeeId,
            BigDecimal revenue
    ) {
    }
}

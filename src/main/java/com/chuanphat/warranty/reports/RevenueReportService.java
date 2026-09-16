package com.chuanphat.warranty.reports;

import com.chuanphat.warranty.core.entity.SalesOrder;
import com.chuanphat.warranty.core.entity.SalesOrderItem;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.SalesOrderStatus;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import com.chuanphat.warranty.reports.dto.RevenueReportDtos;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RevenueReportService {
    private final SalesOrderRepository salesOrderRepository;

    public RevenueReportService(SalesOrderRepository salesOrderRepository) {
        this.salesOrderRepository = salesOrderRepository;
    }

    @Transactional(readOnly = true)
    public RevenueReportDtos.RevenueReportResponse report(
            LocalDate fromDate,
            LocalDate toDate,
            RevenueReportDtos.PeriodGrouping grouping
    ) {
        validateRange(fromDate, toDate);
        RevenueReportDtos.PeriodGrouping effectiveGrouping = grouping == null ? RevenueReportDtos.PeriodGrouping.DAY : grouping;

        List<SalesOrder> currentOrders = salesOrderRepository.findByOrderDateBetween(fromDate, toDate);
        BigDecimal totalRevenue = totalRevenue(currentOrders);
        BigDecimal previousPeriodRevenue = totalRevenue(salesOrderRepository.findByOrderDateBetween(previousFrom(fromDate, toDate), fromDate.minusDays(1)));

        return new RevenueReportDtos.RevenueReportResponse(
                fromDate,
                toDate,
                effectiveGrouping,
                totalRevenue,
                previousPeriodRevenue,
                totalRevenue.subtract(previousPeriodRevenue),
                rows(currentOrders, effectiveGrouping)
        );
    }

    private List<RevenueReportDtos.RevenueReportRow> rows(List<SalesOrder> orders, RevenueReportDtos.PeriodGrouping grouping) {
        Map<RowKey, BigDecimal> revenueByKey = new LinkedHashMap<>();
        for (SalesOrder order : orders) {
            if (order.getStatus() == SalesOrderStatus.CANCELLED) {
                continue;
            }
            for (SalesOrderItem item : order.getItems()) {
                RowKey key = new RowKey(
                        periodStart(order.getOrderDate(), grouping),
                        businessLine(item),
                        item.getWarehouse() == null ? null : item.getWarehouse().getId(),
                        item.getWarehouse() == null ? "UNASSIGNED" : item.getWarehouse().getWarehouseName(),
                        order.getEmployeeId()
                );
                revenueByKey.merge(key, money(item.getLineTotal()), BigDecimal::add);
            }
        }

        List<RevenueReportDtos.RevenueReportRow> rows = new ArrayList<>();
        revenueByKey.forEach((key, revenue) -> rows.add(new RevenueReportDtos.RevenueReportRow(
                key.periodStart(),
                key.businessLine(),
                key.warehouseId(),
                key.warehouseName(),
                key.employeeId(),
                revenue
        )));
        rows.sort(Comparator.comparing(RevenueReportDtos.RevenueReportRow::periodStart)
                .thenComparing(row -> row.businessLine().name())
                .thenComparing(row -> row.warehouseName() == null ? "" : row.warehouseName())
                .thenComparing(RevenueReportDtos.RevenueReportRow::employeeId));
        return rows;
    }

    private BigDecimal totalRevenue(List<SalesOrder> orders) {
        return orders.stream()
                .filter(order -> order.getStatus() != SalesOrderStatus.CANCELLED)
                .flatMap(order -> order.getItems().stream())
                .map(item -> money(item.getLineTotal()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private RevenueReportDtos.BusinessLine businessLine(SalesOrderItem item) {
        return item.getProduct() != null && item.getProduct().getCategory() == ProductCategory.ELECTRIC_MOTORBIKE
                ? RevenueReportDtos.BusinessLine.EV
                : RevenueReportDtos.BusinessLine.FOOD;
    }

    private LocalDate periodStart(LocalDate date, RevenueReportDtos.PeriodGrouping grouping) {
        return switch (grouping) {
            case DAY -> date;
            case WEEK -> date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            case MONTH -> date.withDayOfMonth(1);
        };
    }

    private LocalDate previousFrom(LocalDate fromDate, LocalDate toDate) {
        long days = ChronoUnit.DAYS.between(fromDate, toDate) + 1;
        return fromDate.minusDays(days);
    }

    private void validateRange(LocalDate fromDate, LocalDate toDate) {
        if (fromDate == null || toDate == null || fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException("Invalid revenue report date range");
        }
    }

    private static BigDecimal money(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private record RowKey(
            LocalDate periodStart,
            RevenueReportDtos.BusinessLine businessLine,
            Long warehouseId,
            String warehouseName,
            Long employeeId
    ) {
    }
}

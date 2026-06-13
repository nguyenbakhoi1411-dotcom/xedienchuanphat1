package com.chuanphat.warranty.dashboard;

import com.chuanphat.warranty.common.security.BranchSecurity;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    private final JdbcTemplate jdbcTemplate;
    private final BranchSecurity branchSecurity;

    public DashboardService(JdbcTemplate jdbcTemplate, BranchSecurity branchSecurity) {
        this.jdbcTemplate = jdbcTemplate;
        this.branchSecurity = branchSecurity;
    }

    public Map<String, Object> dashboard(DashboardFilter filter) {
        DashboardFilter resolved = filter.withDefaults();
        Long scopedBranchId = branchSecurity.scopedBranchId(resolved.branchId());
        LocalDate nextDate = resolved.toDate().plusDays(1);

        BigDecimal revenue = money("""
                select coalesce(sum(so.total_amount), 0)
                from sales_orders so
                where so.status <> 'CANCELLED'
                  and so.order_date >= ? and so.order_date <= ?
                  and (? is null or so.branch_id = ?)
                  and (? is null or so.employee_id = ?)
                  and (? is null or exists (
                      select 1 from sales_order_items soi
                      join products p on p.id = soi.product_id
                      where soi.order_id = so.id and p.category = ?
                  ))
                """, resolved.fromDate(), resolved.toDate(), scopedBranchId, scopedBranchId,
                resolved.employeeId(), resolved.employeeId(), resolved.productCategory(), resolved.productCategory());
        BigDecimal cogs = money("""
                select coalesce(sum(soi.quantity * p.import_price), 0)
                from sales_order_items soi
                join sales_orders so on so.id = soi.order_id
                join products p on p.id = soi.product_id
                where so.status <> 'CANCELLED'
                  and so.order_date >= ? and so.order_date <= ?
                  and (? is null or so.branch_id = ?)
                  and (? is null or so.employee_id = ?)
                  and (? is null or p.category = ?)
                """, resolved.fromDate(), resolved.toDate(), scopedBranchId, scopedBranchId,
                resolved.employeeId(), resolved.employeeId(), resolved.productCategory(), resolved.productCategory());
        BigDecimal todayRevenue = money("""
                select coalesce(sum(so.total_amount), 0)
                from sales_orders so
                where so.status <> 'CANCELLED' and so.order_date = ?
                  and (? is null or so.branch_id = ?)
                  and (? is null or so.employee_id = ?)
                  and (? is null or exists (
                      select 1 from sales_order_items soi
                      join products p on p.id = soi.product_id
                      where soi.order_id = so.id and p.category = ?
                  ))
                """, LocalDate.now(), scopedBranchId, scopedBranchId,
                resolved.employeeId(), resolved.employeeId(), resolved.productCategory(), resolved.productCategory());
        BigDecimal monthRevenue = money("""
                select coalesce(sum(so.total_amount), 0)
                from sales_orders so
                where so.status <> 'CANCELLED' and so.order_date >= ? and so.order_date < ?
                  and (? is null or so.branch_id = ?)
                  and (? is null or so.employee_id = ?)
                  and (? is null or exists (
                      select 1 from sales_order_items soi
                      join products p on p.id = soi.product_id
                      where soi.order_id = so.id and p.category = ?
                  ))
                """, LocalDate.now().withDayOfMonth(1), LocalDate.now().withDayOfMonth(1).plusMonths(1), scopedBranchId, scopedBranchId,
                resolved.employeeId(), resolved.employeeId(), resolved.productCategory(), resolved.productCategory());
        Number orders = number("""
                select count(*)
                from sales_orders so
                where so.order_date >= ? and so.order_date <= ?
                  and (? is null or so.branch_id = ?)
                  and (? is null or so.employee_id = ?)
                  and (? is null or exists (
                      select 1 from sales_order_items soi
                      join products p on p.id = soi.product_id
                      where soi.order_id = so.id and p.category = ?
                  ))
                """, resolved.fromDate(), resolved.toDate(), scopedBranchId, scopedBranchId,
                resolved.employeeId(), resolved.employeeId(), resolved.productCategory(), resolved.productCategory());
        Number cancelled = number("""
                select count(*)
                from sales_orders so
                where so.status = 'CANCELLED' and so.order_date >= ? and so.order_date <= ?
                  and (? is null or so.branch_id = ?)
                  and (? is null or so.employee_id = ?)
                  and (? is null or exists (
                      select 1 from sales_order_items soi
                      join products p on p.id = soi.product_id
                      where soi.order_id = so.id and p.category = ?
                  ))
                """, resolved.fromDate(), resolved.toDate(), scopedBranchId, scopedBranchId,
                resolved.employeeId(), resolved.employeeId(), resolved.productCategory(), resolved.productCategory());
        Number newCustomers = number("""
                select count(*)
                from customers
                where status <> 'DELETED' and created_at >= ? and created_at < ? and (? is null or branch_id = ?)
                """, Date.valueOf(resolved.fromDate()), Date.valueOf(nextDate), scopedBranchId, scopedBranchId);
        BigDecimal receivable = money("""
                select coalesce(sum(r.debit_amount), 0) - coalesce(sum(r.credit_amount), 0)
                from receivables r
                join customers c on c.id = r.customer_id
                where (? is null or c.branch_id = ?)
                """, scopedBranchId, scopedBranchId);
        BigDecimal overdueReceivable = money("""
                select coalesce(sum(r.debit_amount), 0) - coalesce(sum(r.credit_amount), 0)
                from receivables r
                join customers c on c.id = r.customer_id
                where r.due_date < ? and r.status <> 'PAID' and (? is null or c.branch_id = ?)
                """, LocalDate.now(), scopedBranchId, scopedBranchId);
        Number lowStock = number("""
                select count(*)
                from inventory_stocks s
                join products p on p.id = s.product_id
                where s.quantity_on_hand <= s.min_quantity
                  and (? is null or s.branch_id = ?)
                  and (? is null or p.category = ?)
                """, scopedBranchId, scopedBranchId, resolved.productCategory(), resolved.productCategory());
        Number activeWarranty = number("""
                select count(*)
                from service_tickets st
                left join product_serials ps on ps.id = st.vehicle_id
                left join products p on p.id = ps.product_id
                left join app_users au on au.username = st.technician_username
                where st.status in ('ASSIGNED', 'IN_PROGRESS', 'WAITING_PARTS', 'DIAGNOSING', 'REPAIRING')
                  and (? is null or ps.branch_id = ?)
                  and (? is null or au.id = ?)
                  and (? is null or p.category = ?)
                """, scopedBranchId, scopedBranchId, resolved.employeeId(), resolved.employeeId(), resolved.productCategory(), resolved.productCategory());

        BigDecimal grossProfit = revenue.subtract(cogs);
        double cancelRate = orders.longValue() == 0 ? 0 : cancelled.doubleValue() * 100.0 / orders.doubleValue();

        return Map.of(
                "kpis", List.of(
                        kpi("todayRevenue", "Doanh thu hom nay", compact(todayRevenue), "Doanh thu ghi nhan trong ngay", "", "orange"),
                        kpi("monthRevenue", "Doanh thu thang nay", compact(monthRevenue), "Tong doanh thu tu dau thang", "", "green"),
                        kpi("grossProfit", "Loi nhuan gop", compact(grossProfit), "Doanh thu tru gia von", marginText(grossProfit, revenue), "green"),
                        kpi("orders", "So don hang", orders.toString(), "Tong don trong ky loc", "", "blue"),
                        kpi("cancelRate", "Ty le don huy", percent(cancelRate), cancelled + " don huy", "", "red"),
                        kpi("newCustomers", "Khach hang moi", newCustomers.toString(), "Khach hang tao moi trong ky", "", "slate"),
                        kpi("receivable", "Cong no phai thu", compact(receivable), "So du cong no khach hang", "", "blue"),
                        kpi("overdueReceivable", "Cong no qua han", compact(overdueReceivable.max(BigDecimal.ZERO)), "Can uu tien thu hoi", "", "red"),
                        kpi("lowStock", "Ton kho thap", lowStock.toString(), "Mat hang duoi nguong toi thieu", "", "orange"),
                        kpi("activeWarranty", "Phieu bao hanh dang xu ly", activeWarranty.toString(), "Phieu chua hoan tat", "", "blue")
                ),
                "revenueByMonth", revenueByMonth(scopedBranchId, resolved.employeeId(), resolved.productCategory()),
                "revenueByBranch", revenueByBranch(resolved.fromDate(), resolved.toDate(), scopedBranchId, resolved.employeeId(), resolved.productCategory()),
                "profitByMonth", profitByMonth(scopedBranchId, resolved.employeeId(), resolved.productCategory()),
                "topProducts", topProducts(resolved.fromDate(), resolved.toDate(), scopedBranchId, resolved.employeeId(), resolved.productCategory()),
                "topEmployees", topEmployees(resolved.fromDate(), resolved.toDate(), scopedBranchId, resolved.productCategory()),
                "customerSources", customerSources(resolved.fromDate(), resolved.toDate(), scopedBranchId, resolved.employeeId(), resolved.productCategory()),
                "warrantyStatus", warrantyStatus(resolved.fromDate(), resolved.toDate(), scopedBranchId, resolved.employeeId(), resolved.productCategory()),
                "warrantyTickets", queryWarrantyTickets(scopedBranchId, resolved.employeeId(), resolved.productCategory())
        );
    }

    public Map<String, Object> summary(Long branchId) {
        return dashboard(new DashboardFilter(null, null, null, null, branchId, null, null));
    }

    public List<Map<String, Object>> revenueByMonth(Long branchId) {
        return revenueByMonth(branchSecurity.scopedBranchId(branchId), null, null);
    }

    public List<Map<String, Object>> revenueByBranch(Long branchId) {
        return revenueByBranch(LocalDate.now().withDayOfMonth(1), LocalDate.now(), branchSecurity.scopedBranchId(branchId));
    }

    public List<Map<String, Object>> topProducts(Long branchId) {
        return topProducts(LocalDate.now().withDayOfMonth(1), LocalDate.now(), branchSecurity.scopedBranchId(branchId), null, null);
    }

    public List<Map<String, Object>> warrantyTickets(Long branchId) {
        return queryWarrantyTickets(branchSecurity.scopedBranchId(branchId));
    }

    private List<Map<String, Object>> revenueByBranch(LocalDate fromDate, LocalDate toDate, Long branchId) {
        return revenueByBranch(fromDate, toDate, branchId, null, null);
    }

    private List<Map<String, Object>> queryWarrantyTickets(Long branchId) {
        return queryWarrantyTickets(branchId, null, null);
    }

    private List<Map<String, Object>> revenueByMonth(Long branchId, Long employeeId, String productCategory) {
        YearMonth firstMonth = YearMonth.now().minusMonths(11);
        Map<YearMonth, BigDecimal> values = emptyMonths(firstMonth);
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                select so.order_date, so.total_amount
                from sales_orders so
                where so.status <> 'CANCELLED' and so.order_date >= ?
                  and (? is null or so.branch_id = ?)
                  and (? is null or so.employee_id = ?)
                  and (? is null or exists (
                      select 1 from sales_order_items soi join products p on p.id = soi.product_id
                      where soi.order_id = so.id and p.category = ?
                  ))
                order by so.order_date
                """, firstMonth.atDay(1), branchId, branchId, employeeId, employeeId, productCategory, productCategory);
        for (Map<String, Object> row : rows) {
            YearMonth month = YearMonth.from(asLocalDate(valueOf(row, "order_date")));
            values.computeIfPresent(month, (key, current) -> current.add(toBigDecimal(valueOf(row, "total_amount"))));
        }
        return values.entrySet().stream()
                .map(entry -> map("month", entry.getKey().toString(), "revenue", entry.getValue()))
                .toList();
    }

    private List<Map<String, Object>> profitByMonth(Long branchId, Long employeeId, String productCategory) {
        YearMonth firstMonth = YearMonth.now().minusMonths(11);
        Map<YearMonth, BigDecimal> revenue = emptyMonths(firstMonth);
        Map<YearMonth, BigDecimal> cogs = emptyMonths(firstMonth);
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                select so.order_date, soi.line_total revenue, soi.quantity * p.import_price cogs
                from sales_order_items soi
                join sales_orders so on so.id = soi.order_id
                join products p on p.id = soi.product_id
                where so.status <> 'CANCELLED' and so.order_date >= ?
                  and (? is null or so.branch_id = ?)
                  and (? is null or so.employee_id = ?)
                  and (? is null or p.category = ?)
                order by so.order_date
                """, firstMonth.atDay(1), branchId, branchId, employeeId, employeeId, productCategory, productCategory);
        for (Map<String, Object> row : rows) {
            YearMonth month = YearMonth.from(asLocalDate(valueOf(row, "order_date")));
            revenue.computeIfPresent(month, (key, current) -> current.add(toBigDecimal(valueOf(row, "revenue"))));
            cogs.computeIfPresent(month, (key, current) -> current.add(toBigDecimal(valueOf(row, "cogs"))));
        }
        return revenue.entrySet().stream()
                .map(entry -> map("month", entry.getKey().toString(), "profit", entry.getValue().subtract(cogs.get(entry.getKey()))))
                .toList();
    }

    private List<Map<String, Object>> revenueByBranch(LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, String productCategory) {
        return normalizeRows(jdbcTemplate.queryForList("""
                select b.name branchName, count(distinct so.id) orders, coalesce(sum(so.total_amount), 0) revenue
                from branches b
                left join sales_orders so on so.branch_id = b.id and so.status <> 'CANCELLED' and so.order_date >= ? and so.order_date <= ?
                  and (? is null or so.employee_id = ?)
                  and (? is null or exists (
                      select 1 from sales_order_items soi join products p on p.id = soi.product_id
                      where soi.order_id = so.id and p.category = ?
                  ))
                where (? is null or b.id = ?)
                group by b.id, b.name
                order by coalesce(sum(so.total_amount), 0) desc
                """, fromDate, toDate, employeeId, employeeId, productCategory, productCategory, branchId, branchId), "branchName", "orders", "revenue");
    }

    private List<Map<String, Object>> topProducts(LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, String productCategory) {
        return normalizeRows(jdbcTemplate.queryForList("""
                select p.id productId, p.product_name productName, p.product_code sku,
                       coalesce(sum(soi.quantity), 0) quantitySold,
                       coalesce(sum(soi.line_total), 0) revenue
                from products p
                join sales_order_items soi on soi.product_id = p.id
                join sales_orders so on so.id = soi.order_id and so.status <> 'CANCELLED'
                where so.order_date >= ? and so.order_date <= ?
                  and (? is null or so.branch_id = ?)
                  and (? is null or so.employee_id = ?)
                  and (? is null or p.category = ?)
                group by p.id, p.product_name, p.product_code
                order by coalesce(sum(soi.quantity), 0) desc
                limit 10
                """, fromDate, toDate, branchId, branchId, employeeId, employeeId, productCategory, productCategory),
                "productId", "productName", "sku", "quantitySold", "revenue");
    }

    private List<Map<String, Object>> topEmployees(LocalDate fromDate, LocalDate toDate, Long branchId, String productCategory) {
        return normalizeRows(jdbcTemplate.queryForList("""
                select au.id employeeId, au.full_name employeeName, count(distinct so.id) orders, coalesce(sum(so.total_amount), 0) revenue
                from sales_orders so
                join app_users au on au.id = so.employee_id
                where so.status <> 'CANCELLED' and so.order_date >= ? and so.order_date <= ?
                  and (? is null or so.branch_id = ?)
                  and (? is null or exists (
                      select 1 from sales_order_items soi join products p on p.id = soi.product_id
                      where soi.order_id = so.id and p.category = ?
                  ))
                group by au.id, au.full_name
                order by coalesce(sum(so.total_amount), 0) desc
                limit 10
                """, fromDate, toDate, branchId, branchId, productCategory, productCategory),
                "employeeId", "employeeName", "orders", "revenue");
    }

    private List<Map<String, Object>> customerSources(LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, String productCategory) {
        return normalizeRows(jdbcTemplate.queryForList("""
                select coalesce(c.source, 'UNKNOWN') source, count(distinct c.id) customers
                from customers c
                left join sales_orders so on so.customer_id = c.id and so.status <> 'CANCELLED' and so.order_date >= ? and so.order_date <= ?
                  and (? is null or so.employee_id = ?)
                  and (? is null or exists (
                      select 1 from sales_order_items soi join products p on p.id = soi.product_id
                      where soi.order_id = so.id and p.category = ?
                  ))
                where c.status <> 'DELETED' and c.created_at >= ? and c.created_at < ? and (? is null or c.branch_id = ?)
                group by c.source
                order by count(distinct c.id) desc
                """, fromDate, toDate, employeeId, employeeId, productCategory, productCategory,
                Date.valueOf(fromDate), Date.valueOf(toDate.plusDays(1)), branchId, branchId), "source", "customers");
    }

    private List<Map<String, Object>> warrantyStatus(LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, String productCategory) {
        return normalizeRows(jdbcTemplate.queryForList("""
                select st.status status, count(*) tickets, coalesce(sum(st.total_cost), 0) cost
                from service_tickets st
                left join product_serials ps on ps.id = st.vehicle_id
                left join products p on p.id = ps.product_id
                left join app_users au on au.username = st.technician_username
                where st.created_at >= ? and st.created_at < ?
                  and (? is null or ps.branch_id = ?)
                  and (? is null or au.id = ?)
                  and (? is null or p.category = ?)
                group by st.status
                order by count(*) desc
                """, Date.valueOf(fromDate), Date.valueOf(toDate.plusDays(1)), branchId, branchId, employeeId, employeeId, productCategory, productCategory), "status", "tickets", "cost");
    }

    private List<Map<String, Object>> queryWarrantyTickets(Long branchId, Long employeeId, String productCategory) {
        return normalizeRows(jdbcTemplate.queryForList("""
                select st.id, st.customer_name customerName, st.serial_number serialNumber,
                       st.technician_username technicianName, st.status, st.created_at createdAt
                from service_tickets st
                left join product_serials ps on ps.id = st.vehicle_id
                left join products p on p.id = ps.product_id
                left join app_users au on au.username = st.technician_username
                where st.status in ('ASSIGNED', 'IN_PROGRESS', 'WAITING_PARTS', 'DIAGNOSING', 'REPAIRING')
                  and (? is null or ps.branch_id = ?)
                  and (? is null or au.id = ?)
                  and (? is null or p.category = ?)
                order by st.created_at desc
                limit 10
                """, branchId, branchId, employeeId, employeeId, productCategory, productCategory), "id", "customerName", "serialNumber", "technicianName", "status", "createdAt")
                .stream()
                .map(row -> {
                    Map<String, Object> next = new LinkedHashMap<>(row);
                    next.put("ticketNo", "SC-" + String.format("%06d", ((Number) row.get("id")).longValue()));
                    return next;
                })
                .toList();
    }

    private BigDecimal money(String sql, Object... args) {
        return toBigDecimal(jdbcTemplate.queryForObject(sql, Object.class, args));
    }

    private Number number(String sql, Object... args) {
        Number value = jdbcTemplate.queryForObject(sql, Number.class, args);
        return value == null ? 0 : value;
    }

    private Map<YearMonth, BigDecimal> emptyMonths(YearMonth firstMonth) {
        Map<YearMonth, BigDecimal> values = new LinkedHashMap<>();
        for (int i = 0; i < 12; i++) {
            values.put(firstMonth.plusMonths(i), BigDecimal.ZERO);
        }
        return values;
    }

    private Object valueOf(Map<String, Object> row, String key) {
        return row.entrySet().stream()
                .filter(entry -> entry.getKey().equalsIgnoreCase(key))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElseThrow();
    }

    private LocalDate asLocalDate(Object value) {
        if (value instanceof LocalDate localDate) return localDate;
        if (value instanceof Date date) return date.toLocalDate();
        if (value instanceof java.sql.Timestamp timestamp) return timestamp.toLocalDateTime().toLocalDate();
        return LocalDate.parse(String.valueOf(value).substring(0, 10));
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal bd) return bd;
        if (value instanceof Number number) return BigDecimal.valueOf(number.doubleValue());
        return new BigDecimal(String.valueOf(value));
    }

    private List<Map<String, Object>> normalizeRows(List<Map<String, Object>> rows, String... keys) {
        return rows.stream()
                .map(row -> {
                    Map<String, Object> normalized = new LinkedHashMap<>();
                    for (String key : keys) {
                        normalized.put(key, valueOf(row, key));
                    }
                    return normalized;
                })
                .toList();
    }

    private Map<String, Object> kpi(String key, String label, String value, String helper, String trend, String tone) {
        return Map.of("key", key, "label", label, "value", value, "helper", helper, "trend", trend, "tone", tone);
    }

    private String compact(BigDecimal value) {
        BigDecimal abs = value.abs();
        if (abs.compareTo(BigDecimal.valueOf(1_000_000_000L)) >= 0) {
            return value.divide(BigDecimal.valueOf(1_000_000_000L), 1, RoundingMode.HALF_UP) + "B";
        }
        if (abs.compareTo(BigDecimal.valueOf(1_000_000L)) >= 0) {
            return value.divide(BigDecimal.valueOf(1_000_000L), 1, RoundingMode.HALF_UP) + "M";
        }
        return value.setScale(0, RoundingMode.HALF_UP).toPlainString();
    }

    private String percent(double value) {
        return BigDecimal.valueOf(value).setScale(1, RoundingMode.HALF_UP) + "%";
    }

    private String marginText(BigDecimal profit, BigDecimal revenue) {
        if (revenue.compareTo(BigDecimal.ZERO) <= 0) return "Bien gop 0%";
        return "Bien gop " + percent(profit.multiply(BigDecimal.valueOf(100)).divide(revenue, 4, RoundingMode.HALF_UP).doubleValue());
    }

    private Map<String, Object> map(String key1, Object value1, String key2, Object value2) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put(key1, value1);
        row.put(key2, value2);
        return row;
    }

    public record DashboardFilter(
            LocalDate fromDate,
            LocalDate toDate,
            Integer month,
            String timeRange,
            Long branchId,
            Long employeeId,
            String productCategory
    ) {
        DashboardFilter withDefaults() {
            LocalDate today = LocalDate.now();
            if (fromDate != null || toDate != null) {
                return new DashboardFilter(fromDate == null ? today.withDayOfMonth(1) : fromDate, toDate == null ? today : toDate, month, timeRange, branchId, employeeId, productCategory);
            }
            if (month != null) {
                LocalDate start = LocalDate.of(today.getYear(), month, 1);
                return new DashboardFilter(start, start.plusMonths(1).minusDays(1), month, timeRange, branchId, employeeId, productCategory);
            }
            if ("TODAY".equals(timeRange)) {
                return new DashboardFilter(today, today, month, timeRange, branchId, employeeId, productCategory);
            }
            if ("LAST_30_DAYS".equals(timeRange)) {
                return new DashboardFilter(today.minusDays(29), today, month, timeRange, branchId, employeeId, productCategory);
            }
            if ("THIS_YEAR".equals(timeRange)) {
                return new DashboardFilter(today.withDayOfYear(1), today, month, timeRange, branchId, employeeId, productCategory);
            }
            return new DashboardFilter(today.withDayOfMonth(1), today, month, timeRange, branchId, employeeId, productCategory);
        }
    }
}

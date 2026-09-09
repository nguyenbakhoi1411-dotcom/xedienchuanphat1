package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class SalesSummaryReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public SalesSummaryReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "bh-tong-mat-hang".equals(reportType) || "bh-tong-khach-hang".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        boolean byCustomer = "bh-tong-khach-hang".equals(criteria.reportType());
        
        String groupBy = byCustomer ? "c.id, c.name" : "p.id, p.name";
        String selectName = byCustomer ? "c.name as groupName" : "p.name as groupName";
        String joinTable = byCustomer 
            ? "LEFT JOIN customers c ON so.customer_id = c.id" 
            : "JOIN products p ON soi.product_id = p.id";

        String sql = """
            SELECT %s,
                   SUM(soi.quantity) as totalQuantity,
                   SUM(soi.line_total) as totalAmount
            FROM sales_orders so
            JOIN sales_order_items soi ON so.id = soi.order_id
            %s
            WHERE so.status <> 'CANCELLED' 
              AND so.order_date >= ? 
              AND so.order_date <= ?
              AND (? IS NULL OR so.branch_id = ?)
            GROUP BY %s
            ORDER BY totalAmount DESC
        """.formatted(selectName, joinTable, groupBy);
        
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            sql, 
            criteria.fromDate(), 
            criteria.toDate(),
            criteria.branchId(), criteria.branchId()
        );
        
        double totalQuantity = 0;
        double totalAmount = 0;
        for (Map<String, Object> row : rows) {
            if (row.get("totalQuantity") instanceof Number n) totalQuantity += n.doubleValue();
            if (row.get("totalAmount") instanceof Number n) totalAmount += n.doubleValue();
        }
        
        return Map.of(
            "title", byCustomer ? "Tổng hợp bán hàng theo khách hàng" : "Tổng hợp bán hàng theo mặt hàng",
            "columns", List.of(
                Map.of("key", "groupName", "label", byCustomer ? "Khách hàng" : "Mặt hàng"),
                Map.of("key", "totalQuantity", "label", "Tổng số lượng"),
                Map.of("key", "totalAmount", "label", "Tổng thành tiền")
            ),
            "data", rows,
            "totalQuantity", totalQuantity,
            "totalAmount", totalAmount
        );
    }
}

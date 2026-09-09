package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class CustomerDebtReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public CustomerDebtReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "bh-cn-tong".equals(reportType) || "bh-cn-chi-tiet".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        String sql = """
            SELECT r.customer_name as customerName,
                   COALESCE(SUM(r.debit_amount - r.credit_amount), 0) as totalDebt
            FROM receivables r
            JOIN customers c ON c.id = r.customer_id
            WHERE r.status <> 'PAID'
              AND (? IS NULL OR c.branch_id = ?)
            GROUP BY r.customer_name
            HAVING COALESCE(SUM(r.debit_amount - r.credit_amount), 0) > 0
            ORDER BY totalDebt DESC
            LIMIT ? OFFSET ?
        """;
        
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            sql, 
            criteria.branchId(), criteria.branchId(),
            criteria.pageSize(), criteria.page() * criteria.pageSize()
        );
        
        double totalDebt = 0;
        for (Map<String, Object> row : rows) {
            if (row.get("totalDebt") instanceof Number n) totalDebt += n.doubleValue();
        }
        
        return Map.of(
            "title", "bh-cn-chi-tiet".equals(criteria.reportType()) ? "Chi tiết công nợ phải thu khách hàng" : "Tổng hợp công nợ phải thu khách hàng",
            "columns", List.of(
                Map.of("key", "customerName", "label", "Khách hàng"),
                Map.of("key", "totalDebt", "label", "Công nợ còn lại")
            ),
            "data", rows,
            "totalDebt", totalDebt
        );
    }
}

package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class SupplierDebtReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public SupplierDebtReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "mh-cn-tong".equals(reportType) || "mh-cn-chi-tiet".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        String sql = """
            SELECT p.supplier_name as supplierName,
                   COALESCE(SUM(p.credit_amount - p.debit_amount), 0) as totalDebt
            FROM accounting_payables p
            LEFT JOIN purchase_orders po ON po.purchase_order_no = p.source_no
            WHERE p.status <> 'PAID'
              AND (? IS NULL OR po.branch_id = ?)
            GROUP BY p.supplier_name
            HAVING COALESCE(SUM(p.credit_amount - p.debit_amount), 0) > 0
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
            "title", "mh-cn-chi-tiet".equals(criteria.reportType()) ? "Chi tiết công nợ phải trả nhà cung cấp" : "Tổng hợp công nợ phải trả nhà cung cấp",
            "columns", List.of(
                Map.of("key", "supplierName", "label", "Nhà cung cấp"),
                Map.of("key", "totalDebt", "label", "Công nợ còn lại")
            ),
            "data", rows,
            "totalDebt", totalDebt
        );
    }
}

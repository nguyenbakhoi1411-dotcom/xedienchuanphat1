package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class CustomerDebtReconciliationGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public CustomerDebtReconciliationGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "bh-dc-cn-pt".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        // Report reconciling sales invoices and payments.
        String sql = """
            SELECT so.order_no as orderNo,
                   so.order_date as orderDate,
                   c.name as customerName,
                   so.total_amount as orderAmount,
                   COALESCE(SUM(cb.amount_in), 0) as paidAmount,
                   so.total_amount - COALESCE(SUM(cb.amount_in), 0) as diffAmount
            FROM sales_orders so
            JOIN customers c ON so.customer_id = c.id
            LEFT JOIN cash_books cb ON so.order_no = cb.source_no AND cb.type = 'RECEIPT'
            WHERE so.status <> 'CANCELLED'
              AND so.order_date >= ? AND so.order_date <= ?
              AND (? IS NULL OR so.branch_id = ?)
            GROUP BY so.id, so.order_no, so.order_date, c.name, so.total_amount
            HAVING diffAmount <> 0
            ORDER BY so.order_date DESC
            LIMIT ? OFFSET ?
        """;
        
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            sql, 
            criteria.fromDate(), criteria.toDate(),
            criteria.branchId(), criteria.branchId(),
            criteria.pageSize(), criteria.page() * criteria.pageSize()
        );
        
        return Map.of(
            "title", "Đối chiếu chứng từ công nợ phải thu và thanh toán",
            "columns", List.of(
                Map.of("key", "orderDate", "label", "Ngày"),
                Map.of("key", "orderNo", "label", "Số chứng từ"),
                Map.of("key", "customerName", "label", "Khách hàng"),
                Map.of("key", "orderAmount", "label", "Phải thu"),
                Map.of("key", "paidAmount", "label", "Đã thu"),
                Map.of("key", "diffAmount", "label", "Chênh lệch")
            ),
            "data", rows
        );
    }
}

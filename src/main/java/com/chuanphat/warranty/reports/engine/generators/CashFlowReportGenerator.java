package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class CashFlowReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public CashFlowReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "tien-luu-chuyen".equals(reportType) || "CASH_FLOW".equalsIgnoreCase(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        String sql = """
            SELECT transaction_date as date, 
                   source_type as sourceType,
                   COALESCE(SUM(amount_in), 0) as cashIn,
                   COALESCE(SUM(amount_out), 0) as cashOut,
                   COALESCE(SUM(amount_in - amount_out), 0) as net
            FROM cash_books
            WHERE transaction_date >= ? AND transaction_date <= ?
              AND (
                  ? IS NULL
                  OR EXISTS (SELECT 1 FROM sales_orders so WHERE so.order_no = cash_books.source_no AND so.branch_id = ?)
                  OR EXISTS (SELECT 1 FROM purchase_orders po WHERE po.purchase_order_no = cash_books.source_no AND po.branch_id = ?)
              )
            GROUP BY transaction_date, source_type
            ORDER BY transaction_date DESC
            LIMIT ? OFFSET ?
        """;
        
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            sql, 
            criteria.fromDate(), criteria.toDate(),
            criteria.branchId(), criteria.branchId(), criteria.branchId(),
            criteria.pageSize(), criteria.page() * criteria.pageSize()
        );
        
        return Map.of(
            "title", "Báo cáo lưu chuyển tiền tệ",
            "columns", List.of(
                Map.of("key", "date", "label", "Ngày"),
                Map.of("key", "sourceType", "label", "Nguồn"),
                Map.of("key", "cashIn", "label", "Tiền vào"),
                Map.of("key", "cashOut", "label", "Tiền ra"),
                Map.of("key", "net", "label", "Dòng tiền ròng")
            ),
            "data", rows
        );
    }
}

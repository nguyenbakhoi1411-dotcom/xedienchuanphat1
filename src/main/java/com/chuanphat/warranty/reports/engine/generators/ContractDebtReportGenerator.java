package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class ContractDebtReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public ContractDebtReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "hd-cn-chi-tiet".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        // Report reconciling sales contracts and payments.
        String sql = """
            SELECT sc.contract_no as contractNo,
                   sc.contract_date as contractDate,
                   c.name as customerName,
                   sc.total_amount as contractAmount,
                   COALESCE(SUM(cb.amount_in), 0) as paidAmount,
                   sc.total_amount - COALESCE(SUM(cb.amount_in), 0) as diffAmount
            FROM sales_contracts sc
            JOIN customers c ON sc.customer_id = c.id
            LEFT JOIN cash_books cb ON sc.contract_no = cb.source_no AND cb.type = 'RECEIPT'
            WHERE sc.contract_date >= ? AND sc.contract_date <= ?
              AND (? IS NULL OR sc.branch_id = ?)
            GROUP BY sc.id, sc.contract_no, sc.contract_date, c.name, sc.total_amount
            HAVING diffAmount <> 0
            ORDER BY sc.contract_date DESC
            LIMIT ? OFFSET ?
        """;
        
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            sql, 
            criteria.fromDate(), criteria.toDate(),
            criteria.branchId(), criteria.branchId(),
            criteria.pageSize(), criteria.page() * criteria.pageSize()
        );
        
        return Map.of(
            "title", "Chi tiết công nợ phải thu theo hợp đồng",
            "columns", List.of(
                Map.of("key", "contractNo", "label", "Số hợp đồng"),
                Map.of("key", "contractDate", "label", "Ngày ký"),
                Map.of("key", "customerName", "label", "Khách hàng"),
                Map.of("key", "contractAmount", "label", "Giá trị HĐ"),
                Map.of("key", "paidAmount", "label", "Đã thu"),
                Map.of("key", "diffAmount", "label", "Còn phải thu")
            ),
            "data", rows
        );
    }
}

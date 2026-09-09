package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class ContractImplementationReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public ContractImplementationReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "hd-thuc-hien".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        String sql = """
            SELECT sc.contract_no as contractNo,
                   sc.contract_date as contractDate,
                   c.name as customerName,
                   sc.project_name as projectName,
                   sc.total_amount as contractAmount,
                   sc.liquidated_amount as liquidatedAmount,
                   sc.total_amount - sc.liquidated_amount as remainingAmount,
                   sc.status as status,
                   sc.delivery_status as deliveryStatus
            FROM sales_contracts sc
            JOIN customers c ON sc.customer_id = c.id
            WHERE sc.contract_date >= ? AND sc.contract_date <= ?
              AND (? IS NULL OR sc.branch_id = ?)
            ORDER BY sc.contract_date DESC, sc.id DESC
            LIMIT ? OFFSET ?
        """;
        
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            sql, 
            criteria.fromDate(), criteria.toDate(),
            criteria.branchId(), criteria.branchId(),
            criteria.pageSize(), criteria.page() * criteria.pageSize()
        );
        
        return Map.of(
            "title", "Tình hình thực hiện hợp đồng",
            "columns", List.of(
                Map.of("key", "contractNo", "label", "Số hợp đồng"),
                Map.of("key", "contractDate", "label", "Ngày ký"),
                Map.of("key", "customerName", "label", "Khách hàng"),
                Map.of("key", "projectName", "label", "Tên dự án"),
                Map.of("key", "contractAmount", "label", "Giá trị HĐ"),
                Map.of("key", "liquidatedAmount", "label", "Đã nghiệm thu"),
                Map.of("key", "remainingAmount", "label", "Còn lại"),
                Map.of("key", "status", "label", "Trạng thái TH"),
                Map.of("key", "deliveryStatus", "label", "Trạng thái giao")
            ),
            "data", rows
        );
    }
}

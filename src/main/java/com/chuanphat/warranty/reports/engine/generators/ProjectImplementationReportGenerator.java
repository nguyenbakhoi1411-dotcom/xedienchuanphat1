package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class ProjectImplementationReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public ProjectImplementationReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "ct-thuc-hien".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        String sql = """
            SELECT p.project_code as projectCode,
                   p.project_name as projectName,
                   p.start_date as startDate,
                   p.end_date as endDate,
                   c.name as customerName,
                   p.budget_amount as budgetAmount,
                   p.actual_cost as actualCost,
                   p.budget_amount - p.actual_cost as varianceAmount,
                   p.status as status
            FROM projects p
            LEFT JOIN customers c ON p.customer_id = c.id
            WHERE p.start_date >= ? AND p.start_date <= ?
              AND (? IS NULL OR p.branch_id = ?)
            ORDER BY p.start_date DESC
            LIMIT ? OFFSET ?
        """;
        
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            sql, 
            criteria.fromDate(), criteria.toDate(),
            criteria.branchId(), criteria.branchId(),
            criteria.pageSize(), criteria.page() * criteria.pageSize()
        );
        
        return Map.of(
            "title", "Tình hình thực hiện công trình",
            "columns", List.of(
                Map.of("key", "projectCode", "label", "Mã công trình"),
                Map.of("key", "projectName", "label", "Tên công trình"),
                Map.of("key", "customerName", "label", "Khách hàng"),
                Map.of("key", "startDate", "label", "Ngày bắt đầu"),
                Map.of("key", "endDate", "label", "Ngày kết thúc"),
                Map.of("key", "budgetAmount", "label", "Dự toán (Ngân sách)"),
                Map.of("key", "actualCost", "label", "Thực tế phát sinh"),
                Map.of("key", "varianceAmount", "label", "Chênh lệch"),
                Map.of("key", "status", "label", "Trạng thái")
            ),
            "data", rows
        );
    }
}

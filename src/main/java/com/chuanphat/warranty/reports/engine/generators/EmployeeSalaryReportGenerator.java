package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class EmployeeSalaryReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public EmployeeSalaryReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "tl-tong-hop".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        String sql = """
            SELECT e.full_name as employeeName,
                   d.name as departmentName,
                   COALESCE(SUM(p.base_salary), 0) as totalBaseSalary,
                   COALESCE(SUM(p.allowance + p.kpi_bonus + p.commission + p.overtime_pay), 0) as totalAdditional,
                   COALESCE(SUM(p.gross_salary), 0) as totalGrossSalary,
                   COALESCE(SUM(p.deduction_late + p.advance_taken), 0) as totalDeduction,
                   COALESCE(SUM(p.net_salary), 0) as totalNetSalary
            FROM payrolls p
            JOIN employees e ON p.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE p.payroll_year >= ? AND p.payroll_year <= ?
              AND (? IS NULL OR e.id = ?)
              AND (? IS NULL OR p.branch_id = ?)
            GROUP BY e.id, e.full_name, d.name
            ORDER BY d.name, e.full_name
        """;
        
        int startYear = criteria.fromDate().getYear();
        int endYear = criteria.toDate().getYear();
        
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            sql, 
            startYear, endYear,
            criteria.employeeId(), criteria.employeeId(),
            criteria.branchId(), criteria.branchId()
        );
        
        return Map.of(
            "title", "Báo cáo tổng hợp lương nhân viên",
            "columns", List.of(
                Map.of("key", "employeeName", "label", "Họ và tên"),
                Map.of("key", "departmentName", "label", "Phòng ban"),
                Map.of("key", "totalBaseSalary", "label", "Tổng lương CB"),
                Map.of("key", "totalAdditional", "label", "Tổng phụ cấp/thưởng"),
                Map.of("key", "totalGrossSalary", "label", "Tổng thu nhập"),
                Map.of("key", "totalDeduction", "label", "Tổng khấu trừ"),
                Map.of("key", "totalNetSalary", "label", "Tổng thực lĩnh")
            ),
            "data", rows
        );
    }
}

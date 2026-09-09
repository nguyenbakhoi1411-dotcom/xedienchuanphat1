package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class PayrollSummaryReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public PayrollSummaryReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "tl-bang-thanh-toan".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        String sql = """
            SELECT e.full_name as employeeName,
                   d.name as departmentName,
                   p.base_salary as baseSalary,
                   p.allowance as allowance,
                   p.commission as commission,
                   p.kpi_bonus as kpiBonus,
                   p.overtime_pay as overtimePay,
                   p.gross_salary as grossSalary,
                   p.deduction_late as deductionLate,
                   p.advance_taken as advanceTaken,
                   p.net_salary as netSalary
            FROM payrolls p
            JOIN employees e ON p.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE p.payroll_month = ? AND p.payroll_year = ?
              AND (? IS NULL OR p.branch_id = ?)
            ORDER BY d.name, e.full_name
        """;
        
        // Use fromDate to derive month and year since our criteria standardizes on dates
        int month = criteria.fromDate().getMonthValue();
        int year = criteria.fromDate().getYear();
        
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            sql, 
            month, year,
            criteria.branchId(), criteria.branchId()
        );
        
        return Map.of(
            "title", "Bảng tổng hợp thanh toán tiền lương",
            "columns", List.of(
                Map.of("key", "employeeName", "label", "Họ và tên"),
                Map.of("key", "departmentName", "label", "Phòng ban"),
                Map.of("key", "baseSalary", "label", "Lương cơ bản"),
                Map.of("key", "allowance", "label", "Phụ cấp"),
                Map.of("key", "kpiBonus", "label", "Thưởng KPI"),
                Map.of("key", "commission", "label", "Hoa hồng"),
                Map.of("key", "overtimePay", "label", "Tăng ca"),
                Map.of("key", "grossSalary", "label", "Tổng thu nhập"),
                Map.of("key", "advanceTaken", "label", "Tạm ứng"),
                Map.of("key", "deductionLate", "label", "Khấu trừ"),
                Map.of("key", "netSalary", "label", "Thực lĩnh")
            ),
            "data", rows
        );
    }
}

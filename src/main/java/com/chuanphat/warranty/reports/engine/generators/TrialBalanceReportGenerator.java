package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class TrialBalanceReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public TrialBalanceReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "kt-can-doi-ps".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        String sql = """
            SELECT coa.account_code as accountCode,
                   coa.account_name as accountName,
                   COALESCE(SUM(jel.debit_amount), 0) as periodDebit,
                   COALESCE(SUM(jel.credit_amount), 0) as periodCredit
            FROM journal_entries je
            JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
            JOIN chart_of_accounts coa ON jel.account_id = coa.id
            WHERE je.entry_date >= ? AND je.entry_date <= ?
              AND je.status = 'POSTED'
              AND (? IS NULL OR je.branch_id = ?)
            GROUP BY coa.id, coa.account_code, coa.account_name
            HAVING periodDebit > 0 OR periodCredit > 0
            ORDER BY coa.account_code ASC
        """;
        
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            sql, 
            criteria.fromDate(), criteria.toDate(),
            criteria.branchId(), criteria.branchId()
        );
        
        return Map.of(
            "title", "Bảng cân đối số phát sinh",
            "columns", List.of(
                Map.of("key", "accountCode", "label", "Mã tài khoản"),
                Map.of("key", "accountName", "label", "Tên tài khoản"),
                Map.of("key", "periodDebit", "label", "Phát sinh Nợ"),
                Map.of("key", "periodCredit", "label", "Phát sinh Có")
            ),
            "data", rows
        );
    }
}

package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class JournalEntryReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public JournalEntryReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "kt-nhat-ky-chung".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        String sql = """
            SELECT je.entry_date as entryDate,
                   je.entry_code as documentNumber,
                   jel.description as description,
                   coa.account_code as accountCode,
                   jel.debit_amount as debitAmount,
                   jel.credit_amount as creditAmount
            FROM journal_entries je
            JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
            JOIN chart_of_accounts coa ON jel.account_id = coa.id
            WHERE je.entry_date >= ? AND je.entry_date <= ?
              AND je.status = 'POSTED'
              AND (? IS NULL OR je.branch_id = ?)
            ORDER BY je.entry_date ASC, je.id ASC
            LIMIT ? OFFSET ?
        """;
        
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            sql, 
            criteria.fromDate(), criteria.toDate(),
            criteria.branchId(), criteria.branchId(),
            criteria.pageSize(), criteria.page() * criteria.pageSize()
        );
        
        return Map.of(
            "title", "Sổ nhật ký chung",
            "columns", List.of(
                Map.of("key", "entryDate", "label", "Ngày"),
                Map.of("key", "documentNumber", "label", "Số chứng từ"),
                Map.of("key", "description", "label", "Diễn giải"),
                Map.of("key", "accountCode", "label", "Tài khoản"),
                Map.of("key", "debitAmount", "label", "Phát sinh Nợ"),
                Map.of("key", "creditAmount", "label", "Phát sinh Có")
            ),
            "data", rows
        );
    }
}

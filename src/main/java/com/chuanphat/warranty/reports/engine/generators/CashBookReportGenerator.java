package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class CashBookReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public CashBookReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "tien-mat-so-quy".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        // Tồn đầu kỳ
        String initSql = """
            SELECT COALESCE(SUM(amount_in - amount_out), 0) as initBalance
            FROM cash_books
            WHERE transaction_date < ?
              AND (? IS NULL OR branch_id = ?)
        """;
        Double initBalance = jdbcTemplate.queryForObject(initSql, Double.class, 
            criteria.fromDate(), criteria.branchId(), criteria.branchId());
        if (initBalance == null) initBalance = 0.0;

        // Phát sinh trong kỳ
        String sql = """
            SELECT transaction_date as transactionDate,
                   source_no as documentNumber,
                   description as description,
                   amount_in as amountIn,
                   amount_out as amountOut,
                   balance_after as balanceAfter
            FROM cash_books
            WHERE transaction_date >= ? 
              AND transaction_date <= ?
              AND (? IS NULL OR branch_id = ?)
            ORDER BY transaction_date ASC, id ASC
        """;
        
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            sql, 
            criteria.fromDate(), criteria.toDate(),
            criteria.branchId(), criteria.branchId()
        );
        
        double totalIn = 0;
        double totalOut = 0;
        for (Map<String, Object> row : rows) {
            if (row.get("amountIn") instanceof Number n) totalIn += n.doubleValue();
            if (row.get("amountOut") instanceof Number n) totalOut += n.doubleValue();
        }
        
        return Map.of(
            "title", "Sổ quỹ tiền mặt",
            "columns", List.of(
                Map.of("key", "transactionDate", "label", "Ngày"),
                Map.of("key", "documentNumber", "label", "Số chứng từ"),
                Map.of("key", "description", "label", "Diễn giải"),
                Map.of("key", "amountIn", "label", "Thu"),
                Map.of("key", "amountOut", "label", "Chi"),
                Map.of("key", "balanceAfter", "label", "Tồn quỹ")
            ),
            "data", rows,
            "initBalance", initBalance,
            "totalIn", totalIn,
            "totalOut", totalOut,
            "endBalance", initBalance + totalIn - totalOut
        );
    }
}

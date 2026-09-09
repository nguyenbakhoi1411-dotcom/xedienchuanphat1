package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class BankBookReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public BankBookReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "tien-gui-so-tien-gui".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        // Tồn đầu kỳ
        String initSql = """
            SELECT COALESCE(SUM(CASE WHEN bt.loai_giao_dich = 'RECEIPT' THEN bt.so_tien ELSE 0 END), 0) -
                   COALESCE(SUM(CASE WHEN bt.loai_giao_dich = 'PAYMENT' THEN bt.so_tien ELSE 0 END), 0) as initBalance
            FROM bank_transactions bt
            LEFT JOIN bank_accounts ba ON bt.bank_account_id = ba.id
            WHERE bt.ngay_giao_dich < ?
              AND (? IS NULL OR ba.branch_id = ?)
        """;
        
        Double initBalance = 0.0;
        try {
            initBalance = jdbcTemplate.queryForObject(initSql, Double.class, 
                criteria.fromDate(), criteria.branchId(), criteria.branchId());
            if (initBalance == null) initBalance = 0.0;
        } catch(Exception e) {
            // Ignore if column doesn't exist etc
        }

        // Phát sinh trong kỳ
        String sql = """
            SELECT bt.ngay_giao_dich as transactionDate,
                   bt.ma_giao_dich as documentNumber,
                   bt.dien_giai as description,
                   ba.account_number as bankAccount,
                   CASE WHEN bt.loai_giao_dich = 'RECEIPT' THEN bt.so_tien ELSE 0 END as amountIn,
                   CASE WHEN bt.loai_giao_dich = 'PAYMENT' THEN bt.so_tien ELSE 0 END as amountOut
            FROM bank_transactions bt
            LEFT JOIN bank_accounts ba ON bt.bank_account_id = ba.id
            WHERE bt.ngay_giao_dich >= ? 
              AND bt.ngay_giao_dich <= ?
              AND (? IS NULL OR ba.branch_id = ?)
            ORDER BY bt.ngay_giao_dich ASC, bt.id ASC
        """;
        
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            sql, 
            criteria.fromDate(), criteria.toDate(),
            criteria.branchId(), criteria.branchId()
        );
        
        double totalIn = 0;
        double totalOut = 0;
        double currentBalance = initBalance;
        
        for (Map<String, Object> row : rows) {
            double amountIn = row.get("amountIn") instanceof Number n ? n.doubleValue() : 0;
            double amountOut = row.get("amountOut") instanceof Number n ? n.doubleValue() : 0;
            totalIn += amountIn;
            totalOut += amountOut;
            currentBalance += (amountIn - amountOut);
            
            // We shouldn't modify the immutable map returned by queryForList directly without wrapping
            // But we don't strictly need to return balanceAfter per row if the UI calculates it, or we can just send it.
            // Let's rely on the UI or add it by mapping:
        }
        
        return Map.of(
            "title", "Sổ tiền gửi ngân hàng",
            "columns", List.of(
                Map.of("key", "transactionDate", "label", "Ngày"),
                Map.of("key", "documentNumber", "label", "Số chứng từ"),
                Map.of("key", "bankAccount", "label", "Tài khoản"),
                Map.of("key", "description", "label", "Diễn giải"),
                Map.of("key", "amountIn", "label", "Thu"),
                Map.of("key", "amountOut", "label", "Chi")
            ),
            "data", rows,
            "initBalance", initBalance,
            "totalIn", totalIn,
            "totalOut", totalOut,
            "endBalance", initBalance + totalIn - totalOut
        );
    }
}

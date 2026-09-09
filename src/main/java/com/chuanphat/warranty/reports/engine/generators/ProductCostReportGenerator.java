package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class ProductCostReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public ProductCostReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "gt-the".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        String sql = """
            SELECT it.transaction_date as transactionDate,
                   it.transaction_no as documentNumber,
                   p.name as productName,
                   it.quantity as quantity,
                   it.unit_cost as unitCost,
                   it.total_cost as totalCost,
                   it.type as transactionType
            FROM inventory_transactions it
            JOIN products p ON it.product_id = p.id
            WHERE it.transaction_date >= ? AND it.transaction_date <= ?
              AND (? IS NULL OR p.id = ?)
              AND (? IS NULL OR it.from_branch_id = ? OR it.to_branch_id = ?)
            ORDER BY it.transaction_date ASC, it.id ASC
        """;
        
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            sql, 
            criteria.fromDate(), criteria.toDate(),
            criteria.productId(), criteria.productId(),
            criteria.branchId(), criteria.branchId(), criteria.branchId()
        );
        
        return Map.of(
            "title", "Thẻ tính giá thành sản phẩm",
            "columns", List.of(
                Map.of("key", "transactionDate", "label", "Ngày giao dịch"),
                Map.of("key", "documentNumber", "label", "Số chứng từ"),
                Map.of("key", "productName", "label", "Sản phẩm"),
                Map.of("key", "quantity", "label", "Số lượng"),
                Map.of("key", "unitCost", "label", "Giá đơn vị"),
                Map.of("key", "totalCost", "label", "Tổng giá"),
                Map.of("key", "transactionType", "label", "Loại giao dịch")
            ),
            "data", rows
        );
    }
}

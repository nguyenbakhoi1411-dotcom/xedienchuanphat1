package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class InventorySummaryReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public InventorySummaryReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "kho-tong-hop".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        String sql = """
            SELECT p.id as productId,
                   p.code as productCode,
                   p.name as productName,
                   COALESCE(SUM(CASE WHEN it.type IN ('RECEIPT', 'INBOUND_TRANSFER', 'RETURN_IN') THEN it.quantity ELSE 0 END), 0) -
                   COALESCE(SUM(CASE WHEN it.type IN ('ISSUE', 'OUTBOUND_TRANSFER', 'RETURN_OUT') THEN it.quantity ELSE 0 END), 0) as endingStock
            FROM inventory_transactions it
            JOIN products p ON it.product_id = p.id
            WHERE it.transaction_date <= ?
              AND (? IS NULL OR it.from_branch_id = ? OR it.to_branch_id = ?)
            GROUP BY p.id, p.code, p.name
            HAVING endingStock <> 0
            ORDER BY endingStock DESC
            LIMIT ? OFFSET ?
        """;
        
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            sql, 
            criteria.toDate(),
            criteria.branchId(), criteria.branchId(), criteria.branchId(),
            criteria.pageSize(), criteria.page() * criteria.pageSize()
        );
        
        return Map.of(
            "title", "Tổng hợp tồn kho",
            "columns", List.of(
                Map.of("key", "productCode", "label", "Mã vật tư"),
                Map.of("key", "productName", "label", "Tên vật tư"),
                Map.of("key", "endingStock", "label", "Tồn cuối kỳ")
            ),
            "data", rows
        );
    }
}

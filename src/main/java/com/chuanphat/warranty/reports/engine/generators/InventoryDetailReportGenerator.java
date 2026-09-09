package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class InventoryDetailReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public InventoryDetailReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "kho-chi-tiet".equals(reportType) || "kho-the".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        String sql = """
            SELECT it.transaction_date as transactionDate,
                   it.transaction_no as documentNumber,
                   it.reference_type as referenceType,
                   it.reference_no as referenceNo,
                   p.name as productName,
                   it.note as description,
                   CASE WHEN it.type IN ('RECEIPT', 'INBOUND_TRANSFER', 'RETURN_IN') THEN it.quantity ELSE 0 END as quantityIn,
                   CASE WHEN it.type IN ('ISSUE', 'OUTBOUND_TRANSFER', 'RETURN_OUT') THEN it.quantity ELSE 0 END as quantityOut
            FROM inventory_transactions it
            JOIN products p ON it.product_id = p.id
            WHERE it.transaction_date >= ? 
              AND it.transaction_date <= ?
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
            "title", "kho-the".equals(criteria.reportType()) ? "Thẻ kho" : "Sổ chi tiết vật tư, hàng hóa",
            "columns", List.of(
                Map.of("key", "transactionDate", "label", "Ngày"),
                Map.of("key", "documentNumber", "label", "Số chứng từ"),
                Map.of("key", "productName", "label", "Mặt hàng"),
                Map.of("key", "description", "label", "Diễn giải"),
                Map.of("key", "quantityIn", "label", "Nhập"),
                Map.of("key", "quantityOut", "label", "Xuất")
            ),
            "data", rows
        );
    }
}

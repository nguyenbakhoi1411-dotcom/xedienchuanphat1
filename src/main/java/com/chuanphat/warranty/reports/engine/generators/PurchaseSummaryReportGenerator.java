package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class PurchaseSummaryReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public PurchaseSummaryReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "mh-tong-ncc".equals(reportType) || "mh-tong-mat-hang".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        boolean bySupplier = "mh-tong-ncc".equals(criteria.reportType());
        
        String groupBy = bySupplier ? "s.id, s.name" : "p.id, p.name";
        String selectName = bySupplier ? "s.name as groupName" : "p.name as groupName";
        String joinTable = bySupplier 
            ? "LEFT JOIN suppliers s ON po.supplier_id = s.id" 
            : "JOIN products p ON poi.product_id = p.id";

        String sql = """
            SELECT %s,
                   SUM(poi.quantity) as totalQuantity,
                   SUM(poi.total_price) as totalAmount
            FROM purchase_orders po
            JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
            %s
            WHERE po.status <> 'CANCELLED' 
              AND po.order_date >= ? 
              AND po.order_date <= ?
              AND (? IS NULL OR po.branch_id = ?)
            GROUP BY %s
            ORDER BY totalAmount DESC
        """.formatted(selectName, joinTable, groupBy);
        
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            sql, 
            criteria.fromDate(), 
            criteria.toDate(),
            criteria.branchId(), criteria.branchId()
        );
        
        double totalQuantity = 0;
        double totalAmount = 0;
        for (Map<String, Object> row : rows) {
            if (row.get("totalQuantity") instanceof Number n) totalQuantity += n.doubleValue();
            if (row.get("totalAmount") instanceof Number n) totalAmount += n.doubleValue();
        }
        
        return Map.of(
            "title", bySupplier ? "Tổng hợp mua hàng theo nhà cung cấp" : "Tổng hợp mua hàng theo mặt hàng",
            "columns", List.of(
                Map.of("key", "groupName", "label", bySupplier ? "Nhà cung cấp" : "Mặt hàng"),
                Map.of("key", "totalQuantity", "label", "Tổng số lượng"),
                Map.of("key", "totalAmount", "label", "Tổng thành tiền")
            ),
            "data", rows,
            "totalQuantity", totalQuantity,
            "totalAmount", totalAmount
        );
    }
}

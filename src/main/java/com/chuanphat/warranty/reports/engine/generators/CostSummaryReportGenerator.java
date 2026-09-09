package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class CostSummaryReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public CostSummaryReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "gt-tong-hop".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        String sql = """
            SELECT p.code as productCode,
                   p.name as productName,
                   w.name as warehouseName,
                   iac.quantity as quantity,
                   iac.average_cost as unitCost,
                   iac.quantity * iac.average_cost as totalCost
            FROM inventory_average_costs iac
            JOIN products p ON iac.product_id = p.id
            JOIN warehouses w ON iac.warehouse_id = w.id
            WHERE iac.quantity > 0
              AND (? IS NULL OR iac.branch_id = ?)
            ORDER BY p.code ASC
        """;
        
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            sql, 
            criteria.branchId(), criteria.branchId()
        );
        
        return Map.of(
            "title", "Bảng tổng hợp giá thành bình quân",
            "columns", List.of(
                Map.of("key", "productCode", "label", "Mã sản phẩm"),
                Map.of("key", "productName", "label", "Tên sản phẩm"),
                Map.of("key", "warehouseName", "label", "Kho"),
                Map.of("key", "quantity", "label", "Số lượng tồn"),
                Map.of("key", "unitCost", "label", "Giá thành đơn vị"),
                Map.of("key", "totalCost", "label", "Tổng giá thành")
            ),
            "data", rows
        );
    }
}

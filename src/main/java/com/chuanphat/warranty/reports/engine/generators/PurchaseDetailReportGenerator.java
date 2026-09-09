package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class PurchaseDetailReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public PurchaseDetailReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "mh-s16".equals(reportType) || "mh-so-chi-tiet".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        String sql = """
            SELECT po.order_date as transactionDate, 
                   po.purchase_order_no as documentNumber, 
                   s.name as supplierName,
                   p.name as productName,
                   poi.quantity as quantity,
                   poi.unit_price as unitPrice,
                   poi.total_price as totalAmount,
                   e.full_name as employeeName
            FROM purchase_orders po
            LEFT JOIN suppliers s ON po.supplier_id = s.id
            JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
            JOIN products p ON poi.product_id = p.id
            LEFT JOIN employees e ON po.employee_id = e.id
            WHERE po.status <> 'CANCELLED' 
              AND po.order_date >= ? 
              AND po.order_date <= ?
              AND (? IS NULL OR po.branch_id = ?)
        """;
        
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            sql, 
            criteria.fromDate(), 
            criteria.toDate(),
            criteria.branchId(), criteria.branchId()
        );
        
        double totalQuantity = 0;
        double totalAmount = 0;
        for (Map<String, Object> row : rows) {
            if (row.get("quantity") instanceof Number n) totalQuantity += n.doubleValue();
            if (row.get("totalAmount") instanceof Number n) totalAmount += n.doubleValue();
        }
        
        return Map.of(
            "title", "Sổ chi tiết mua hàng",
            "columns", List.of(
                Map.of("key", "transactionDate", "label", "Ngày"),
                Map.of("key", "documentNumber", "label", "Số chứng từ"),
                Map.of("key", "supplierName", "label", "Nhà cung cấp"),
                Map.of("key", "productName", "label", "Mặt hàng"),
                Map.of("key", "quantity", "label", "Số lượng"),
                Map.of("key", "unitPrice", "label", "Đơn giá"),
                Map.of("key", "totalAmount", "label", "Thành tiền"),
                Map.of("key", "employeeName", "label", "Nhân viên")
            ),
            "data", rows,
            "totalQuantity", totalQuantity,
            "totalAmount", totalAmount
        );
    }
}

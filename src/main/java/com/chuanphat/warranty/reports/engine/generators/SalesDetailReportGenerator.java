package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class SalesDetailReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public SalesDetailReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "bh-s16".equals(reportType) || "bh-so-chi-tiet".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        String sql = """
            SELECT so.order_date as transactionDate, 
                   so.order_no as documentNumber, 
                   c.name as customerName,
                   p.name as productName,
                   soi.quantity as quantity,
                   soi.unit_price as unitPrice,
                   soi.line_total as totalAmount,
                   e.full_name as employeeName
            FROM sales_orders so
            LEFT JOIN customers c ON so.customer_id = c.id
            JOIN sales_order_items soi ON so.id = soi.order_id
            JOIN products p ON soi.product_id = p.id
            LEFT JOIN employees e ON so.employee_id = e.id
            WHERE so.status <> 'CANCELLED' 
              AND so.order_date >= ? 
              AND so.order_date <= ?
              AND (? IS NULL OR so.branch_id = ?)
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
            "title", "Sổ chi tiết bán hàng",
            "columns", List.of(
                Map.of("key", "transactionDate", "label", "Ngày"),
                Map.of("key", "documentNumber", "label", "Số chứng từ"),
                Map.of("key", "customerName", "label", "Khách hàng"),
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

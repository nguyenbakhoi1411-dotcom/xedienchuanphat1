package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class OutputTaxReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public OutputTaxReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "thue-dau-ra".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        String sql = """
            SELECT i.ngay_xuat as invoiceDate,
                   i.so_hoa_don as invoiceNumber,
                   i.mau_so as formNo,
                   i.ky_hieu as serialNo,
                   i.ten_nguoi_mua as customerName,
                   i.ma_so_thue_nguoi_mua as taxCode,
                   i.tong_tien_truoc_thue as totalAmountBeforeTax,
                   i.thue_suat as taxRate,
                   i.tong_thue_gtgt as taxAmount,
                   i.trang_thai as status
            FROM invoices i
            WHERE i.ngay_xuat >= ? AND i.ngay_xuat <= ?
              AND i.trang_thai <> 'HUY'
            ORDER BY i.ngay_xuat ASC, i.id ASC
        """;
        
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            sql, 
            criteria.fromDate(), criteria.toDate()
        );
        
        return Map.of(
            "title", "Bảng kê hóa đơn, chứng từ hàng hóa, dịch vụ bán ra",
            "columns", List.of(
                Map.of("key", "formNo", "label", "Mẫu số"),
                Map.of("key", "serialNo", "label", "Ký hiệu"),
                Map.of("key", "invoiceNumber", "label", "Số hóa đơn"),
                Map.of("key", "invoiceDate", "label", "Ngày hóa đơn"),
                Map.of("key", "customerName", "label", "Tên người mua"),
                Map.of("key", "taxCode", "label", "MST người mua"),
                Map.of("key", "totalAmountBeforeTax", "label", "Doanh số bán chưa thuế"),
                Map.of("key", "taxRate", "label", "Thuế suất (%)"),
                Map.of("key", "taxAmount", "label", "Thuế GTGT"),
                Map.of("key", "status", "label", "Trạng thái")
            ),
            "data", rows
        );
    }
}

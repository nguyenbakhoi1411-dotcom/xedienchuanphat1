package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class InputTaxReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public InputTaxReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "thue-dau-vao".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        String sql = """
            SELECT ii.ngay_hoa_don as invoiceDate,
                   ii.so_hoa_don_ncc as invoiceNumber,
                   ii.mau_so_ncc as formNo,
                   ii.ky_hieu_ncc as serialNo,
                   ii.ten_ncc as supplierName,
                   ii.ma_so_thue_ncc as taxCode,
                   ii.tong_tien_hang as totalAmountBeforeTax,
                   ii.thue_suat as taxRate,
                   ii.tong_thue_gtgt as taxAmount,
                   ii.ghi_chu as note
            FROM invoice_input ii
            WHERE ii.ngay_hoa_don >= ? AND ii.ngay_hoa_don <= ?
              AND ii.trang_thai <> 'CANCELLED'
            ORDER BY ii.ngay_hoa_don ASC, ii.id ASC
        """;
        
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            sql, 
            criteria.fromDate(), criteria.toDate()
        );
        
        return Map.of(
            "title", "Bảng kê hóa đơn, chứng từ hàng hóa, dịch vụ mua vào",
            "columns", List.of(
                Map.of("key", "formNo", "label", "Mẫu số"),
                Map.of("key", "serialNo", "label", "Ký hiệu"),
                Map.of("key", "invoiceNumber", "label", "Số hóa đơn"),
                Map.of("key", "invoiceDate", "label", "Ngày hóa đơn"),
                Map.of("key", "supplierName", "label", "Tên người bán"),
                Map.of("key", "taxCode", "label", "MST người bán"),
                Map.of("key", "totalAmountBeforeTax", "label", "Doanh số mua chưa thuế"),
                Map.of("key", "taxRate", "label", "Thuế suất (%)"),
                Map.of("key", "taxAmount", "label", "Thuế GTGT"),
                Map.of("key", "note", "label", "Ghi chú")
            ),
            "data", rows
        );
    }
}

package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class FixedAssetDepreciationReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public FixedAssetDepreciationReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "ts-khau-hao".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        String sql = """
            SELECT fa.asset_code as assetCode,
                   fa.asset_name as assetName,
                   fa.cost_amount as costAmount,
                   fad.depreciation_month as month,
                   fad.depreciation_year as year,
                   fad.amount as depreciationAmount,
                   fa.accumulated_depreciation as accumulatedDepreciation,
                   fa.cost_amount - fa.accumulated_depreciation as bookValue
            FROM fixed_asset_depreciation fad
            JOIN fixed_assets fa ON fad.asset_id = fa.id
            WHERE fad.depreciation_year = ?
              AND (? IS NULL OR fa.branch_id = ?)
            ORDER BY fad.depreciation_month DESC, fa.asset_code ASC
        """;
        
        int year = criteria.fromDate().getYear();
        
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            sql, 
            year,
            criteria.branchId(), criteria.branchId()
        );
        
        return Map.of(
            "title", "Bảng tính khấu hao tài sản cố định",
            "columns", List.of(
                Map.of("key", "assetCode", "label", "Mã tài sản"),
                Map.of("key", "assetName", "label", "Tên tài sản"),
                Map.of("key", "costAmount", "label", "Nguyên giá"),
                Map.of("key", "month", "label", "Tháng"),
                Map.of("key", "year", "label", "Năm"),
                Map.of("key", "depreciationAmount", "label", "Mức khấu hao kỳ này"),
                Map.of("key", "accumulatedDepreciation", "label", "Hao mòn lũy kế"),
                Map.of("key", "bookValue", "label", "Giá trị còn lại")
            ),
            "data", rows
        );
    }
}

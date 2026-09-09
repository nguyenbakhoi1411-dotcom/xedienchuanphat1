package com.chuanphat.warranty.reports.engine.generators;

import com.chuanphat.warranty.reports.engine.ReportCriteria;
import com.chuanphat.warranty.reports.engine.ReportGenerator;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class FixedAssetListReportGenerator implements ReportGenerator {
    private final JdbcTemplate jdbcTemplate;

    public FixedAssetListReportGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean supports(String reportType) {
        return "ts-so-tai-san".equals(reportType);
    }

    @Override
    public Map<String, Object> generate(ReportCriteria criteria) {
        String sql = """
            SELECT fa.asset_code as assetCode,
                   fa.asset_name as assetName,
                   fa.category as category,
                   fa.purchase_date as purchaseDate,
                   fa.cost_amount as costAmount,
                   fa.accumulated_depreciation as accumulatedDepreciation,
                   fa.cost_amount - fa.accumulated_depreciation as bookValue,
                   fa.useful_life_months as usefulLife,
                   fa.status as status
            FROM fixed_assets fa
            WHERE fa.purchase_date <= ?
              AND (? IS NULL OR fa.branch_id = ?)
            ORDER BY fa.purchase_date DESC, fa.id DESC
        """;
        
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            sql, 
            criteria.toDate(),
            criteria.branchId(), criteria.branchId()
        );
        
        return Map.of(
            "title", "Sổ tài sản cố định",
            "columns", List.of(
                Map.of("key", "assetCode", "label", "Mã tài sản"),
                Map.of("key", "assetName", "label", "Tên tài sản"),
                Map.of("key", "category", "label", "Loại tài sản"),
                Map.of("key", "purchaseDate", "label", "Ngày ghi tăng"),
                Map.of("key", "costAmount", "label", "Nguyên giá"),
                Map.of("key", "accumulatedDepreciation", "label", "Hao mòn lũy kế"),
                Map.of("key", "bookValue", "label", "Giá trị còn lại"),
                Map.of("key", "usefulLife", "label", "Thời gian KH (tháng)"),
                Map.of("key", "status", "label", "Trạng thái")
            ),
            "data", rows
        );
    }
}

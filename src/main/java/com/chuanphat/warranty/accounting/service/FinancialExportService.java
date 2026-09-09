package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.dto.TrialBalanceResponse;
import com.chuanphat.warranty.accounting.dto.TrialBalanceRowResponse;
import com.chuanphat.warranty.reports.ExportDocumentService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FinancialExportService {

    private final FinancialReportService financialReportService;
    private final ExportDocumentService exportDocumentService;

    public FinancialExportService(FinancialReportService financialReportService,
                                  ExportDocumentService exportDocumentService) {
        this.financialReportService = financialReportService;
        this.exportDocumentService = exportDocumentService;
    }

    public byte[] exportTrialBalance(LocalDate fromDate, LocalDate toDate, Long branchId, String format) {
        TrialBalanceResponse response = financialReportService.getTrialBalance(fromDate, toDate, branchId);
        
        List<Map<String, String>> columns = List.of(
                Map.of("key", "maTK", "label", "Mã TK"),
                Map.of("key", "tenTK", "label", "Tên Tài Khoản"),
                Map.of("key", "duNoDauKy", "label", "Dư Nợ ĐK"),
                Map.of("key", "duCoDauKy", "label", "Dư Có ĐK"),
                Map.of("key", "phatSinhNo", "label", "Phát Sinh Nợ"),
                Map.of("key", "phatSinhCo", "label", "Phát Sinh Có"),
                Map.of("key", "duNoCuoiKy", "label", "Dư Nợ CK"),
                Map.of("key", "duCoCuoiKy", "label", "Dư Có CK")
        );

        List<Map<String, Object>> rows = new ArrayList<>();
        for (TrialBalanceRowResponse rowDto : response.rows()) {
            Map<String, Object> row = new HashMap<>();
            row.put("maTK", rowDto.accountCode());
            row.put("tenTK", rowDto.accountName());
            row.put("duNoDauKy", rowDto.openingDebit());
            row.put("duCoDauKy", rowDto.openingCredit());
            row.put("phatSinhNo", rowDto.periodDebit());
            row.put("phatSinhCo", rowDto.periodCredit());
            row.put("duNoCuoiKy", rowDto.closingDebit());
            row.put("duCoCuoiKy", rowDto.closingCredit());
            rows.add(row);
        }

        Map<String, Object> report = new HashMap<>();
        report.put("title", "BẢNG CÂN ĐỐI SỐ PHÁT SINH");
        report.put("tableColumns", columns);
        report.put("tableRows", rows);

        ExportDocumentService.ExportMeta meta = new ExportDocumentService.ExportMeta(
                "Bảng CĐSPS", fromDate, toDate, "Tất cả", "Kế toán trưởng"
        );

        if ("pdf".equalsIgnoreCase(format)) {
            // Document orientation handling isn't natively supported in ExportDocumentService yet,
            // but the existing method handles up to 80 rows and columns fine.
            return exportDocumentService.reportPdf(report, meta);
        }
        return exportDocumentService.reportExcel(report, meta);
    }

    public byte[] exportBalanceSheet(LocalDate fromDate, LocalDate toDate, Long branchId, String format) {
        Map<String, Object> response = financialReportService.getBalanceSheet(fromDate, toDate, branchId);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> dataRows = (List<Map<String, Object>>) response.get("rows");

        List<Map<String, String>> columns = List.of(
                Map.of("key", "maChiTieu", "label", "Mã Chỉ Tiêu"),
                Map.of("key", "tenChiTieu", "label", "Tên Chỉ Tiêu"),
                Map.of("key", "soCuoiKy", "label", "Số Cuối Kỳ"),
                Map.of("key", "soDauNam", "label", "Số Đầu Năm")
        );

        List<Map<String, Object>> rows = new ArrayList<>();
        for (Map<String, Object> rowDto : dataRows) {
            Map<String, Object> row = new HashMap<>();
            row.put("maChiTieu", rowDto.get("maChiTieu"));
            row.put("tenChiTieu", rowDto.get("tenChiTieu"));
            row.put("soCuoiKy", rowDto.get("soCuoiKy"));
            row.put("soDauNam", rowDto.get("soDauNam"));
            rows.add(row);
        }

        Map<String, Object> report = new HashMap<>();
        report.put("title", "BẢNG CÂN ĐỐI KẾ TOÁN");
        report.put("tableColumns", columns);
        report.put("tableRows", rows);

        ExportDocumentService.ExportMeta meta = new ExportDocumentService.ExportMeta(
                "Bảng CĐKT", fromDate, toDate, "Tất cả", "Kế toán trưởng"
        );

        if ("pdf".equalsIgnoreCase(format)) {
            return exportDocumentService.reportPdf(report, meta);
        }
        return exportDocumentService.reportExcel(report, meta);
    }
}

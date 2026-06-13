package com.chuanphat.warranty.reports;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ExportDocumentServiceTest {
    private final ExportDocumentService service = new ExportDocumentService();

    @Test
    void reportExcelCreatesXlsxWithHeaderAndRows() {
        byte[] file = service.reportExcel(sampleReport(), meta());

        assertThat(file).isNotEmpty();
        assertThat(file[0]).isEqualTo((byte) 'P');
        assertThat(file[1]).isEqualTo((byte) 'K');
    }

    @Test
    void reportPdfCreatesPdfDocument() {
        byte[] file = service.reportPdf(sampleReport(), meta());

        assertThat(new String(file, 0, 8)).startsWith("%PDF");
    }

    @Test
    void businessPdfCreatesPdfDocument() {
        byte[] file = service.businessPdf(new ExportDocumentService.BusinessDocument(
                "Hoa don ban hang",
                "INV-001",
                "2026-06-08",
                "Nguyen Van A",
                "0909000000",
                "Don hang SO-001",
                List.of("San pham", "SL", "Thanh tien"),
                List.of(List.of("Xe dien", "1", "12000000")),
                BigDecimal.valueOf(12_000_000)
        ));

        assertThat(new String(file, 0, 8)).startsWith("%PDF");
    }

    @Test
    void fileNameIsClearAndDated() {
        String fileName = service.fileName("sales_report", LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 8), "xlsx");

        assertThat(fileName).isEqualTo("sales-report-2026-06-01-2026-06-08.xlsx");
    }

    private Map<String, Object> sampleReport() {
        return Map.of(
                "title", "Sales Report",
                "tableColumns", List.of(
                        Map.of("key", "period", "label", "Ngay"),
                        Map.of("key", "revenue", "label", "Doanh thu")
                ),
                "tableRows", List.of(
                        Map.of("period", LocalDate.of(2026, 6, 8), "revenue", BigDecimal.valueOf(24_000_000))
                )
        );
    }

    private ExportDocumentService.ExportMeta meta() {
        return new ExportDocumentService.ExportMeta(
                "Sales Report",
                LocalDate.of(2026, 6, 1),
                LocalDate.of(2026, 6, 8),
                "Tat ca chi nhanh",
                "admin"
        );
    }
}

package com.chuanphat.warranty.reports;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.FontUnderline;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

@Service
public class ExportDocumentService {
    private static final String COMPANY_NAME = "CHUAN PHAT";
    private static final String COMPANY_INFO = "He thong xe dien va dich vu bao hanh | Hotline: 1900 0000 | MST: 0312345678";
    private static final String COMPANY_ADDRESS = "Dia chi: TP. Ho Chi Minh, Viet Nam";
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public byte[] reportExcel(Map<String, Object> report, ExportMeta meta) {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Bao cao");
            Styles styles = styles(workbook);
            @SuppressWarnings("unchecked")
            List<Map<String, String>> columns = (List<Map<String, String>>) report.getOrDefault("tableColumns", List.of());
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> rows = (List<Map<String, Object>>) report.getOrDefault("tableRows", List.of());

            int lastColumn = Math.max(columns.size() - 1, 3);
            Row title = sheet.createRow(0);
            title.setHeightInPoints(28);
            Cell titleCell = title.createCell(0);
            titleCell.setCellValue(String.valueOf(report.getOrDefault("title", meta.title())));
            titleCell.setCellStyle(styles.title());
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, lastColumn));

            writeMetaRow(sheet, styles, 1, "Thoi gian loc", formatRange(meta.fromDate(), meta.toDate()));
            writeMetaRow(sheet, styles, 2, "Chi nhanh", meta.branchLabel());
            writeMetaRow(sheet, styles, 3, "Nguoi xuat", meta.exportedBy());
            writeMetaRow(sheet, styles, 4, "Thoi diem xuat", DATE.format(LocalDate.now()));

            int headerIndex = 6;
            Row header = sheet.createRow(headerIndex);
            for (int i = 0; i < columns.size(); i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(columns.get(i).get("label"));
                cell.setCellStyle(styles.header());
            }

            Map<Integer, BigDecimal> totals = new LinkedHashMap<>();
            for (int rowIndex = 0; rowIndex < rows.size(); rowIndex++) {
                Row excelRow = sheet.createRow(headerIndex + 1 + rowIndex);
                Map<String, Object> source = rows.get(rowIndex);
                for (int colIndex = 0; colIndex < columns.size(); colIndex++) {
                    String key = columns.get(colIndex).get("key");
                    Object value = source.get(key);
                    Cell cell = excelRow.createCell(colIndex);
                    writeExcelCell(cell, key, value, styles);
                    if (isMoneyColumn(key) && value instanceof Number number) {
                        totals.merge(colIndex, BigDecimal.valueOf(number.doubleValue()), BigDecimal::add);
                    }
                }
            }

            int totalIndex = headerIndex + 1 + rows.size();
            Row totalRow = sheet.createRow(totalIndex);
            Cell totalLabel = totalRow.createCell(0);
            totalLabel.setCellValue("Tong");
            totalLabel.setCellStyle(styles.total());
            for (int colIndex = 1; colIndex < columns.size(); colIndex++) {
                Cell cell = totalRow.createCell(colIndex);
                if (totals.containsKey(colIndex)) {
                    cell.setCellValue(totals.get(colIndex).doubleValue());
                    cell.setCellStyle(styles.moneyTotal());
                } else {
                    cell.setCellStyle(styles.total());
                }
            }

            for (int i = 0; i < Math.max(columns.size(), 1); i++) {
                sheet.autoSizeColumn(i);
                sheet.setColumnWidth(i, Math.min(Math.max(sheet.getColumnWidth(i), 3200), 9000));
            }
            workbook.write(output);
            return output.toByteArray();
        } catch (Exception exception) {
            throw new IllegalStateException("Khong the tao file Excel", exception);
        }
    }

    public byte[] reportPdf(Map<String, Object> report, ExportMeta meta) {
        @SuppressWarnings("unchecked")
        List<Map<String, String>> columns = (List<Map<String, String>>) report.getOrDefault("tableColumns", List.of());
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rows = (List<Map<String, Object>>) report.getOrDefault("tableRows", List.of());
        List<List<String>> tableRows = rows.stream()
                .limit(80)
                .map(row -> columns.stream().map(column -> valueText(row.get(column.get("key")))).toList())
                .toList();
        String title = String.valueOf(report.getOrDefault("title", meta.title()));
        return pdf(title, List.of(
                "Thoi gian loc: " + formatRange(meta.fromDate(), meta.toDate()),
                "Chi nhanh: " + meta.branchLabel(),
                "Nguoi xuat: " + meta.exportedBy()
        ), columns.stream().map(column -> column.get("label")).toList(), tableRows, totals(rows), null);
    }

    public byte[] businessPdf(BusinessDocument document) {
        List<String> info = new ArrayList<>();
        info.add("So chung tu: " + document.code());
        info.add("Ngay lap: " + document.date());
        info.add("Khach hang/Nguoi nhan: " + document.customerName());
        info.add("Lien he: " + document.customerContact());
        if (document.note() != null && !document.note().isBlank()) {
            info.add("Ghi chu: " + document.note());
        }
        String amountWords = document.totalAmount() == null ? null : "Bang chu: " + numberToVietnameseWords(document.totalAmount()) + " dong";
        return pdf(document.title(), info, document.headers(), document.rows(), List.of(), amountWords);
    }

    public String fileName(String prefix, LocalDate fromDate, LocalDate toDate, String extension) {
        return slug(prefix) + "-" + fromDate + "-" + toDate + "." + extension;
    }

    private byte[] pdf(String title, List<String> info, List<String> headers, List<List<String>> rows, List<String> totals, String amountWords) {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 32, 32, 32, 32);
            PdfWriter.getInstance(document, output);
            document.open();

            PdfPTable company = new PdfPTable(new float[]{1.0f, 5.0f});
            company.setWidthPercentage(100);
            PdfPCell logo = cell("CP", font(20, true), new Color(249, 115, 22), Color.WHITE);
            logo.setHorizontalAlignment(Element.ALIGN_CENTER);
            logo.setVerticalAlignment(Element.ALIGN_MIDDLE);
            logo.setFixedHeight(48);
            company.addCell(logo);
            PdfPCell companyInfo = borderless(COMPANY_NAME + "\n" + COMPANY_INFO + "\n" + COMPANY_ADDRESS, font(10, false));
            companyInfo.setPaddingLeft(10);
            company.addCell(companyInfo);
            document.add(company);

            Paragraph heading = new Paragraph(title.toUpperCase(Locale.ROOT), font(16, true));
            heading.setAlignment(Element.ALIGN_CENTER);
            heading.setSpacingBefore(14);
            heading.setSpacingAfter(10);
            document.add(heading);

            for (String line : info) {
                document.add(new Paragraph(line, font(10, false)));
            }

            if (!headers.isEmpty()) {
                PdfPTable table = new PdfPTable(headers.size());
                table.setWidthPercentage(100);
                table.setSpacingBefore(12);
                for (String header : headers) {
                    PdfPCell headerCell = cell(header, font(9, true), new Color(255, 247, 237), new Color(120, 53, 15));
                    headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    table.addCell(headerCell);
                }
                for (List<String> row : rows) {
                    for (String value : row) {
                        table.addCell(cell(value, font(9, false), Color.WHITE, Color.BLACK));
                    }
                }
                document.add(table);
            }

            for (String total : totals) {
                Paragraph paragraph = new Paragraph(total, font(10, true));
                paragraph.setAlignment(Element.ALIGN_RIGHT);
                paragraph.setSpacingBefore(6);
                document.add(paragraph);
            }
            if (amountWords != null) {
                document.add(new Paragraph(amountWords, font(10, false)));
            }

            PdfPTable signatures = new PdfPTable(2);
            signatures.setWidthPercentage(100);
            signatures.setSpacingBefore(32);
            signatures.addCell(signature("Nguoi lap"));
            signatures.addCell(signature("Nguoi nhan"));
            document.add(signatures);
            document.close();
            return output.toByteArray();
        } catch (Exception exception) {
            throw new IllegalStateException("Khong the tao file PDF", exception);
        }
    }

    private void writeMetaRow(Sheet sheet, Styles styles, int rowIndex, String label, String value) {
        Row row = sheet.createRow(rowIndex);
        Cell labelCell = row.createCell(0);
        labelCell.setCellValue(label);
        labelCell.setCellStyle(styles.metaLabel());
        Cell valueCell = row.createCell(1);
        valueCell.setCellValue(value);
        valueCell.setCellStyle(styles.metaValue());
    }

    private void writeExcelCell(Cell cell, String key, Object value, Styles styles) {
        if (value instanceof Number number) {
            cell.setCellValue(number.doubleValue());
            cell.setCellStyle(isMoneyColumn(key) ? styles.money() : styles.number());
            return;
        }
        if (value instanceof LocalDate date) {
            cell.setCellValue(date);
            cell.setCellStyle(styles.date());
            return;
        }
        if (value instanceof java.sql.Date date) {
            cell.setCellValue(date.toLocalDate());
            cell.setCellStyle(styles.date());
            return;
        }
        if (value instanceof OffsetDateTime dateTime) {
            cell.setCellValue(dateTime.toLocalDate());
            cell.setCellStyle(styles.date());
            return;
        }
        cell.setCellValue(valueText(value));
        cell.setCellStyle(styles.text());
    }

    private Styles styles(XSSFWorkbook workbook) {
        DataFormat format = workbook.createDataFormat();
        XSSFCellStyle title = workbook.createCellStyle();
        XSSFFont titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleFont.setColor(new XSSFColor(new Color(234, 88, 12), null));
        title.setFont(titleFont);
        title.setAlignment(HorizontalAlignment.CENTER);
        title.setVerticalAlignment(VerticalAlignment.CENTER);

        XSSFCellStyle header = workbook.createCellStyle();
        XSSFFont headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setColor(new XSSFColor(new Color(120, 53, 15), null));
        header.setFont(headerFont);
        header.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        header.setFillForegroundColor(new XSSFColor(new Color(255, 247, 237), null));
        border(header);

        XSSFCellStyle text = workbook.createCellStyle();
        border(text);

        XSSFCellStyle number = workbook.createCellStyle();
        number.setDataFormat(format.getFormat("#,##0"));
        border(number);

        XSSFCellStyle money = workbook.createCellStyle();
        money.setDataFormat(format.getFormat("#,##0 [$VND]"));
        border(money);

        XSSFCellStyle date = workbook.createCellStyle();
        date.setDataFormat(format.getFormat("dd/mm/yyyy"));
        border(date);

        XSSFCellStyle total = workbook.createCellStyle();
        XSSFFont totalFont = workbook.createFont();
        totalFont.setBold(true);
        totalFont.setUnderline(FontUnderline.SINGLE);
        total.setFont(totalFont);
        border(total);

        XSSFCellStyle moneyTotal = workbook.createCellStyle();
        moneyTotal.cloneStyleFrom(money);
        moneyTotal.setFont(totalFont);

        XSSFCellStyle metaLabel = workbook.createCellStyle();
        XSSFFont metaFont = workbook.createFont();
        metaFont.setBold(true);
        metaLabel.setFont(metaFont);

        XSSFCellStyle metaValue = workbook.createCellStyle();

        return new Styles(title, header, text, number, money, date, total, moneyTotal, metaLabel, metaValue);
    }

    private void border(CellStyle style) {
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
    }

    private PdfPCell cell(String text, Font font, Color background, Color color) {
        PdfPCell cell = new PdfPCell(new Phrase(safeText(text), font));
        cell.setBackgroundColor(background);
        cell.setUseAscender(true);
        cell.setPadding(6);
        cell.setBorderColor(new Color(226, 232, 240));
        return cell;
    }

    private PdfPCell borderless(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(safeText(text), font));
        cell.setBorder(Rectangle.NO_BORDER);
        return cell;
    }

    private PdfPCell signature(String label) {
        PdfPCell cell = borderless(label + "\n\n\n\n(Ky va ghi ro ho ten)", font(10, true));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        return cell;
    }

    private Font font(int size, boolean bold) {
        return FontFactory.getFont(FontFactory.HELVETICA, size, bold ? Font.BOLD : Font.NORMAL, Color.BLACK);
    }

    private List<String> totals(List<Map<String, Object>> rows) {
        Map<String, BigDecimal> totals = new LinkedHashMap<>();
        for (Map<String, Object> row : rows) {
            row.forEach((key, value) -> {
                if (isMoneyColumn(key) && value instanceof Number number) {
                    totals.merge(key, BigDecimal.valueOf(number.doubleValue()), BigDecimal::add);
                }
            });
        }
        return totals.entrySet().stream()
                .map(entry -> "Tong " + entry.getKey() + ": " + money(entry.getValue()))
                .toList();
    }

    private boolean isMoneyColumn(String key) {
        String normalized = key == null ? "" : key.toLowerCase(Locale.ROOT);
        return normalized.contains("amount")
                || normalized.contains("revenue")
                || normalized.contains("profit")
                || normalized.contains("cost")
                || normalized.contains("value")
                || normalized.contains("total")
                || normalized.contains("cash")
                || normalized.contains("debt")
                || normalized.contains("payable")
                || normalized.contains("receivable");
    }

    private String valueText(Object value) {
        if (value == null) {
            return "";
        }
        if (value instanceof BigDecimal decimal) {
            return money(decimal);
        }
        if (value instanceof Number number && Math.abs(number.doubleValue()) >= 1000) {
            return money(BigDecimal.valueOf(number.doubleValue()));
        }
        if (value instanceof LocalDate date) {
            return DATE.format(date);
        }
        if (value instanceof java.sql.Date date) {
            return DATE.format(date.toLocalDate());
        }
        return String.valueOf(value);
    }

    private String money(BigDecimal value) {
        return String.format(Locale.ROOT, "%,.0f VND", value.setScale(0, RoundingMode.HALF_UP));
    }

    private String formatRange(LocalDate fromDate, LocalDate toDate) {
        return DATE.format(fromDate) + " - " + DATE.format(toDate);
    }

    private String numberToVietnameseWords(BigDecimal value) {
        return String.format(Locale.ROOT, "%,.0f", value.setScale(0, RoundingMode.HALF_UP));
    }

    private String safeText(String value) {
        return value == null ? "" : Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace("đ", "d")
                .replace("Đ", "D");
    }

    private String slug(String value) {
        String normalized = safeText(value).toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return normalized.isBlank() ? "export" : normalized;
    }

    public record ExportMeta(String title, LocalDate fromDate, LocalDate toDate, String branchLabel, String exportedBy) {
    }

    public record BusinessDocument(
            String title,
            String code,
            String date,
            String customerName,
            String customerContact,
            String note,
            List<String> headers,
            List<List<String>> rows,
            BigDecimal totalAmount
    ) {
    }

    private record Styles(
            XSSFCellStyle title,
            XSSFCellStyle header,
            XSSFCellStyle text,
            XSSFCellStyle number,
            XSSFCellStyle money,
            XSSFCellStyle date,
            XSSFCellStyle total,
            XSSFCellStyle moneyTotal,
            XSSFCellStyle metaLabel,
            XSSFCellStyle metaValue
    ) {
    }
}

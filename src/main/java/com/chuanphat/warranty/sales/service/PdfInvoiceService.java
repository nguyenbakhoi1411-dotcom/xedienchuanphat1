package com.chuanphat.warranty.sales.service;

import com.chuanphat.warranty.core.entity.SalesOrder;
import com.chuanphat.warranty.core.entity.SalesOrderItem;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.awt.Color;

@Service
public class PdfInvoiceService {

    public byte[] generateSalesOrderPdf(SalesOrder order) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            // Font (OpenPDF doesn't natively support full UTF-8 without custom fonts, 
            // but we can use standard fonts for basic ASCII/Latin)
            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
            Font headerFont = new Font(Font.HELVETICA, 12, Font.BOLD);
            Font normalFont = new Font(Font.HELVETICA, 12, Font.NORMAL);

            Paragraph title = new Paragraph("HOA DON BAN HANG (INVOICE)", titleFont);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            document.add(new Paragraph("Ma don hang: " + order.getOrderNo(), normalFont));
            document.add(new Paragraph("Ngay tao: " + order.getOrderDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), normalFont));
            document.add(new Paragraph("Trang thai: " + order.getStatus().name(), normalFont));
            document.add(new Paragraph(" ", normalFont));

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{4f, 2f, 2f, 2f});

            // Table Header
            String[] headers = {"San pham", "SL", "Don gia", "Thanh tien"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
                cell.setBackgroundColor(Color.LIGHT_GRAY);
                cell.setPadding(5);
                table.addCell(cell);
            }

            // Items
            if (order.getItems() != null) {
                for (SalesOrderItem item : order.getItems()) {
                    String productName = item.getProduct() != null ? item.getProduct().getProductName() : "Unknown";
                    table.addCell(new Phrase(productName, normalFont));
                    table.addCell(new Phrase(String.valueOf(item.getQuantity()), normalFont));
                    
                    BigDecimal price = item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO;
                    table.addCell(new Phrase(price.toString(), normalFont));
                    
                    BigDecimal total = price.multiply(BigDecimal.valueOf(item.getQuantity()));
                    table.addCell(new Phrase(total.toString(), normalFont));
                }
            }

            document.add(table);

            document.add(new Paragraph(" ", normalFont));
            Paragraph totalAmount = new Paragraph("Tong tien: " + order.getTotalAmount(), headerFont);
            totalAmount.setAlignment(Paragraph.ALIGN_RIGHT);
            document.add(totalAmount);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }
}

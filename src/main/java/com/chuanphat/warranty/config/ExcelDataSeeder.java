package com.chuanphat.warranty.config;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileInputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Locale;

@Component
@Profile("dev")
public class ExcelDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ExcelDataSeeder.class);

    private final JdbcTemplate jdbcTemplate;

    public ExcelDataSeeder(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        File dir = new File("D:\\ChuanPhatfilegoc\\ChuanPhat");
        File targetFile = null;
        if (dir.exists()) {
            File[] files = dir.listFiles();
            if (files != null) {
                for (File f : files) {
                    String name = f.getName().toLowerCase();
                    if (f.isFile() && (name.contains("nhap") || name.contains("nháp") || name.contains("file"))) {
                        if (name.endsWith(".xlsx")) {
                            targetFile = f;
                            break;
                        }
                    }
                }
            }
        }

        if (targetFile == null) {
            log.info("No excel data file found in project directory. Skipping Excel data seeding.");
            return;
        }

        log.info("Excel data file found at: {}. Starting data seeding...", targetFile.getAbsolutePath());

        try (FileInputStream fis = new FileInputStream(targetFile);
             Workbook workbook = new XSSFWorkbook(fis)) {

            Sheet sheet = workbook.getSheetAt(0);
            int totalRows = sheet.getLastRowNum();
            log.info("Found sheet '{}' with {} rows.", sheet.getSheetName(), totalRows + 1);

            int seededOrders = 0;
            int seededCustomers = 0;
            int seededProducts = 0;
            int seededSerials = 0;

            for (int r = 2; r <= totalRows; r++) { // Data starts at row 2
                Row row = sheet.getRow(r);
                if (row == null) continue;

                // 1. Basic parsing
                String idStr = getCleanString(row.getCell(0));
                if (idStr.isEmpty()) continue;

                Date dateVal = getCellDate(row.getCell(1));
                LocalDate orderDate = dateVal != null ? dateVal.toInstant().atZone(ZoneId.systemDefault()).toLocalDate() : LocalDate.now();
                OffsetDateTime orderDateTime = dateVal != null ? OffsetDateTime.ofInstant(dateVal.toInstant(), ZoneId.systemDefault()) : OffsetDateTime.now();

                String customerName = getCleanString(row.getCell(2));
                if (customerName.isEmpty()) continue;

                String address = getCleanString(row.getCell(3));
                String rawPhone = getCleanString(row.getCell(4));
                String phone = cleanPhoneNumber(rawPhone);

                String vehicleType = getCleanString(row.getCell(5));
                if (vehicleType.isEmpty()) continue;

                String color = getCleanString(row.getCell(6));
                if (color.isEmpty()) color = "Đen";

                String serialNumber = getCleanString(row.getCell(7));
                if (serialNumber.isEmpty()) continue;

                BigDecimal listPrice = getCellBigDecimal(row.getCell(8), new BigDecimal("20000000"));
                String khoDmsStr = getCleanString(row.getCell(9)).toUpperCase(Locale.ROOT);

                // Map branch
                long branchId = 1;
                if (khoDmsStr.contains("LÊ LỢI")) {
                    branchId = 5;
                } else if (khoDmsStr.contains("NGUYỄN DU")) {
                    branchId = 4;
                } else if (khoDmsStr.contains("NAM ĐÀN")) {
                    branchId = 3;
                }

                BigDecimal salePrice = getCellBigDecimal(row.getCell(10), listPrice);

                // Payments
                BigDecimal ck1 = getCellBigDecimal(row.getCell(11), BigDecimal.ZERO);
                BigDecimal tm1 = getCellBigDecimal(row.getCell(12), BigDecimal.ZERO);
                BigDecimal ck2 = getCellBigDecimal(row.getCell(14), BigDecimal.ZERO);
                BigDecimal tm2 = getCellBigDecimal(row.getCell(15), BigDecimal.ZERO);
                BigDecimal ck3 = getCellBigDecimal(row.getCell(17), BigDecimal.ZERO);
                BigDecimal tm3 = getCellBigDecimal(row.getCell(18), BigDecimal.ZERO);

                BigDecimal totalPaid = ck1.add(tm1).add(ck2).add(tm2).add(ck3).add(tm3);

                String note = getCleanString(row.getCell(22));
                if (note.isEmpty()) note = "Seeded from " + targetFile.getName();

                // 2. Insert Product if not exists
                String cleanVehicle = vehicleType.trim();
                String productCode = "PROD-" + cleanVehicle.replace(" ", "-").toUpperCase(Locale.ROOT);
                Long productId = null;

                try {
                    productId = jdbcTemplate.queryForObject("select id from products where product_code = ?", Long.class, productCode);
                } catch (Exception e) {
                    // Not found, insert
                    jdbcTemplate.update("insert into products(product_code, product_name, category, brand, model, color, import_price, sale_price, warranty_months, status, created_at) values(?,?,?,?,?,?,?,?,?,?,?)",
                            productCode, cleanVehicle, "ELECTRIC_MOTORBIKE", "VinFast", cleanVehicle, color, salePrice.multiply(new BigDecimal("0.75")), salePrice, 24, "ACTIVE", orderDateTime);
                    productId = jdbcTemplate.queryForObject("select id from products where product_code = ?", Long.class, productCode);
                    seededProducts++;
                }

                // 3. Insert Customer if not exists
                Long customerId = null;
                try {
                    customerId = jdbcTemplate.queryForObject("select id from customers where phone = ?", Long.class, phone);
                } catch (Exception e) {
                    jdbcTemplate.update("insert into customers(phone, full_name, email, address, source, branch_id, tier, rank, score, status, total_purchase_amount, total_purchase_count, total_debt, lifetime_value, created_at) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                            phone, customerName, phone + "@gmail.com", address, "IMPORT", branchId, "NEW", "NEW", 0, "ACTIVE", BigDecimal.ZERO, 0, BigDecimal.ZERO, BigDecimal.ZERO, orderDateTime);
                    customerId = jdbcTemplate.queryForObject("select id from customers where phone = ?", Long.class, phone);
                    seededCustomers++;
                }

                // 4. Insert Serial if not exists
                Long serialId = null;
                try {
                    serialId = jdbcTemplate.queryForObject("select id from product_serials where serial_number = ?", Long.class, serialNumber);
                } catch (Exception e) {
                    jdbcTemplate.update("insert into product_serials(product_id, serial_number, branch_id, warehouse_id, frame_number, engine_number, status, import_date, created_at) values(?,?,?,?,?,?,?,?,?)",
                            productId, serialNumber, branchId, branchId, serialNumber, "ENG-" + serialNumber, "SOLD", orderDate, orderDateTime);
                    serialId = jdbcTemplate.queryForObject("select id from product_serials where serial_number = ?", Long.class, serialNumber);
                    seededSerials++;
                }

                // 5. Insert Sales Order if not exists
                String orderNo = "SO-EXCEL-" + String.format("%04d", r);
                Long orderId = null;
                try {
                    orderId = jdbcTemplate.queryForObject("select id from sales_orders where order_no = ?", Long.class, orderNo);
                } catch (Exception e) {
                    String paymentStatus = totalPaid.compareTo(salePrice) >= 0 ? "PAID" : (totalPaid.compareTo(BigDecimal.ZERO) > 0 ? "PARTIAL" : "UNPAID");
                    String status = "PAID";

                    jdbcTemplate.update("insert into sales_orders(order_no, branch_id, customer_id, employee_id, order_date, status, subtotal, discount_amount, voucher_code, note, total_amount, paid_amount, payment_status, vat_rate, vat_amount, created_at, accounting_recorded, stock_issued, warranty_created, voucher_consumed, max_discount_pct, discount_approval_status) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                            orderNo, branchId, customerId, 1L, orderDate, status, salePrice, BigDecimal.ZERO, "", note, salePrice, totalPaid, paymentStatus, new BigDecimal("10.00"), BigDecimal.ZERO, orderDateTime, false, false, false, false, new BigDecimal("5.00"), "NONE");
                    orderId = jdbcTemplate.queryForObject("select id from sales_orders where order_no = ?", Long.class, orderNo);
                    seededOrders++;

                    // 6. Insert Sales Order Item
                    jdbcTemplate.update("insert into sales_order_items(order_id, product_id, serial_id, warehouse_id, quantity, unit_price, line_total, returned_quantity, list_price, policy_discount_amount) values(?,?,?,?,?,?,?,?,?,?)",
                            orderId, productId, serialId, branchId, 1, salePrice, salePrice, 0, listPrice, BigDecimal.ZERO);

                    // 7. Insert Payments
                    if (ck1.compareTo(BigDecimal.ZERO) > 0) {
                        jdbcTemplate.update("insert into sales_payments(order_id, payment_method, amount, payment_date, installment_disbursement, created_at) values(?,?,?,?,?,?)",
                                orderId, "BANK_TRANSFER", ck1, orderDate, false, orderDateTime);
                    }
                    if (tm1.compareTo(BigDecimal.ZERO) > 0) {
                        jdbcTemplate.update("insert into sales_payments(order_id, payment_method, amount, payment_date, installment_disbursement, created_at) values(?,?,?,?,?,?)",
                                orderId, "CASH", tm1, orderDate, false, orderDateTime);
                    }
                    if (ck2.compareTo(BigDecimal.ZERO) > 0) {
                        jdbcTemplate.update("insert into sales_payments(order_id, payment_method, amount, payment_date, installment_disbursement, created_at) values(?,?,?,?,?,?)",
                                orderId, "BANK_TRANSFER", ck2, orderDate, false, orderDateTime);
                    }
                    if (tm2.compareTo(BigDecimal.ZERO) > 0) {
                        jdbcTemplate.update("insert into sales_payments(order_id, payment_method, amount, payment_date, installment_disbursement, created_at) values(?,?,?,?,?,?)",
                                orderId, "CASH", tm2, orderDate, false, orderDateTime);
                    }
                    if (ck3.compareTo(BigDecimal.ZERO) > 0) {
                        jdbcTemplate.update("insert into sales_payments(order_id, payment_method, amount, payment_date, installment_disbursement, created_at) values(?,?,?,?,?,?)",
                                orderId, "BANK_TRANSFER", ck3, orderDate, false, orderDateTime);
                    }
                    if (tm3.compareTo(BigDecimal.ZERO) > 0) {
                        jdbcTemplate.update("insert into sales_payments(order_id, payment_method, amount, payment_date, installment_disbursement, created_at) values(?,?,?,?,?,?)",
                                orderId, "CASH", tm3, orderDate, false, orderDateTime);
                    }
                }
            }

            log.info("Seeding completed successfully: {} orders, {} customers, {} products, {} serials seeded.",
                    seededOrders, seededCustomers, seededProducts, seededSerials);
        }
    }

    private String getCleanString(Cell cell) {
        if (cell == null) return "";
        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue().trim();
        } else if (cell.getCellType() == CellType.NUMERIC) {
            double d = cell.getNumericCellValue();
            if (d == (long) d) {
                return String.valueOf((long) d);
            }
            return String.valueOf(d);
        } else if (cell.getCellType() == CellType.BOOLEAN) {
            return String.valueOf(cell.getBooleanCellValue());
        }
        return "";
    }

    private Date getCellDate(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getDateCellValue();
        } else if (cell.getCellType() == CellType.STRING) {
            try {
                return new Date(Date.parse(cell.getStringCellValue().trim()));
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    private BigDecimal getCellBigDecimal(Cell cell, BigDecimal fallback) {
        if (cell == null) return fallback;
        if (cell.getCellType() == CellType.NUMERIC) {
            return BigDecimal.valueOf(cell.getNumericCellValue());
        } else if (cell.getCellType() == CellType.STRING) {
            try {
                String val = cell.getStringCellValue().replaceAll("[^\\d.]", "");
                if (val.isEmpty()) return fallback;
                return new BigDecimal(val);
            } catch (Exception e) {
                return fallback;
            }
        }
        return fallback;
    }

    private String cleanPhoneNumber(String raw) {
        if (raw == null || raw.isEmpty()) return "0900000000";
        // Clean non-digits
        String digits = raw.replaceAll("[^\\d]", "");
        if (digits.isEmpty()) return "0900000000";
        
        // Handle scientific notation e.g., 9.76123368E8
        if (raw.toUpperCase().contains("E")) {
            try {
                double val = Double.parseDouble(raw);
                digits = String.format("%.0f", val);
            } catch (Exception e) {}
        }
        
        if (digits.startsWith("84")) {
            digits = "0" + digits.substring(2);
        } else if (!digits.startsWith("0")) {
            digits = "0" + digits;
        }
        return digits;
    }
}

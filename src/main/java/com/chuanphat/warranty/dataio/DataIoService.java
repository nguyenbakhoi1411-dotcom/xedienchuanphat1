package com.chuanphat.warranty.dataio;

import com.chuanphat.warranty.audit.dto.CreateAuditLogRequest;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import com.chuanphat.warranty.audit.service.AuditLogService;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.exception.BusinessException;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DataIoService {
    private static final long MAX_UPLOAD_BYTES = 10L * 1024L * 1024L;
    private static final Set<String> ALLOWED_UPLOAD_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv");
    private static final Set<String> DANGEROUS_EXTENSIONS = Set.of("exe", "bat", "cmd", "ps1", "sh", "js", "jsp", "php", "jar", "war");

    private final JdbcTemplate jdbcTemplate;
    private final AuditLogService auditLogService;
    private final BranchSecurity branchSecurity;
    private final Path uploadDir;

    public DataIoService(
            JdbcTemplate jdbcTemplate,
            AuditLogService auditLogService,
            BranchSecurity branchSecurity,
            @Value("${app.files.upload-dir:uploads}") String uploadDir
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.auditLogService = auditLogService;
        this.branchSecurity = branchSecurity;
        this.uploadDir = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    public byte[] template(String dataType, String format) {
        List<String> columns = columns(dataType);
        return "csv".equalsIgnoreCase(format) ? csv(columns, List.of()) : workbook(columns, List.of(), "template");
    }

    @Transactional
    public DataIoDtos.ImportResult importData(String dataType, MultipartFile file, boolean dryRun) {
        List<Map<String, String>> rows = readRows(file);
        List<DataIoDtos.RowError> errors = validate(dataType, rows);
        boolean hasCriticalErrors = !errors.isEmpty();
        int imported = 0;
        if (!dryRun && !hasCriticalErrors) {
            for (Map<String, String> row : rows) {
                insert(dataType, row);
                imported++;
            }
            audit(AuditAction.IMPORT_DATA, "IMPORT_" + normalize(dataType), String.valueOf(imported));
        } else {
            audit(AuditAction.IMPORT_DATA, "VALIDATE_IMPORT_" + normalize(dataType), hasCriticalErrors ? "FAILED" : "OK");
        }
        int invalidRows = (int) errors.stream().map(DataIoDtos.RowError::rowNumber).distinct().count();
        return new DataIoDtos.ImportResult(normalize(dataType), rows.size(), rows.size() - invalidRows, imported, !dryRun && !hasCriticalErrors, hasCriticalErrors, errors);
    }

    public byte[] errorFile(String dataType, MultipartFile file) {
        DataIoDtos.ImportResult result = importData(dataType, file, true);
        List<String> columns = new ArrayList<>(columns(dataType));
        columns.add("error");
        List<Map<String, Object>> rows = result.errors().stream().map(error -> {
            Map<String, Object> row = new LinkedHashMap<>(error.row());
            row.put("error", "Dong " + error.rowNumber() + " - " + error.field() + ": " + error.message());
            return row;
        }).toList();
        return workbook(columns, rows, "errors");
    }

    public byte[] exportData(String dataType, Long branchId, String keyword) {
        Long scopedBranchId = branchScoped(dataType, branchId);
        List<Map<String, Object>> rows = exportRows(dataType, scopedBranchId, keyword == null ? "" : keyword.trim().toLowerCase(Locale.ROOT));
        audit(AuditAction.EXPORT_REPORT, "EXPORT_" + normalize(dataType), String.valueOf(rows.size()));
        return workbook(exportColumns(dataType), rows, normalize(dataType).toLowerCase(Locale.ROOT));
    }

    public DataIoDtos.UploadedFileResponse upload(MultipartFile file, String purpose) {
        validateUpload(file);
        try {
            Files.createDirectories(uploadDir);
            String original = safeFileName(file.getOriginalFilename());
            String ext = extension(original);
            String stored = OffsetDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + "-" + UUID.randomUUID() + (ext.isBlank() ? "" : "." + ext);
            Path target = uploadDir.resolve(stored).normalize();
            if (!target.startsWith(uploadDir)) {
                throw new BusinessException("Invalid upload path");
            }
            file.transferTo(target);
            audit(AuditAction.UPDATE_SETTING, "FILE_UPLOAD_" + normalize(purpose), stored);
            return new DataIoDtos.UploadedFileResponse(original, stored, target.toString(), file.getContentType(), file.getSize(), OffsetDateTime.now());
        } catch (Exception exception) {
            throw exception instanceof BusinessException businessException ? businessException : new BusinessException("Upload failed: " + exception.getMessage());
        }
    }

    private List<DataIoDtos.RowError> validate(String dataType, List<Map<String, String>> rows) {
        List<DataIoDtos.RowError> errors = new ArrayList<>();
        String type = normalize(dataType);
        for (int i = 0; i < rows.size(); i++) {
            int rowNumber = i + 2;
            Map<String, String> row = rows.get(i);
            for (String required : requiredColumns(type)) {
                if (blank(row.get(required))) {
                    errors.add(error(rowNumber, required, "REQUIRED", "Bat buoc nhap", row));
                }
            }
            if ("CUSTOMERS".equals(type) && exists("select count(*) from customers where phone = ?", row.get("phone"))) {
                errors.add(error(rowNumber, "phone", "DUPLICATE", "So dien thoai da ton tai", row));
            }
            if ("PRODUCTS".equals(type) && exists("select count(*) from products where lower(product_code) = lower(?)", row.get("productCode"))) {
                errors.add(error(rowNumber, "productCode", "DUPLICATE", "Ma san pham da ton tai", row));
            }
            if ("SERIALS".equals(type)) {
                if (exists("select count(*) from product_serials where lower(serial_number) = lower(?)", row.get("serialNumber"))) {
                    errors.add(error(rowNumber, "serialNumber", "DUPLICATE", "Serial da ton tai", row));
                }
                if (!blank(row.get("frameNumber")) && exists("select count(*) from product_serials where lower(frame_number) = lower(?)", row.get("frameNumber"))) {
                    errors.add(error(rowNumber, "frameNumber", "DUPLICATE", "So khung da ton tai", row));
                }
            }
            if ("SUPPLIERS".equals(type) && exists("select count(*) from suppliers where lower(supplier_code) = lower(?)", row.get("supplierCode"))) {
                errors.add(error(rowNumber, "supplierCode", "DUPLICATE", "Ma nha cung cap da ton tai", row));
            }
            if ("EMPLOYEES".equals(type) && exists("select count(*) from employees where lower(employee_code) = lower(?)", row.get("employeeCode"))) {
                errors.add(error(rowNumber, "employeeCode", "DUPLICATE", "Ma nhan vien da ton tai", row));
            }
        }
        return errors;
    }

    private void insert(String dataType, Map<String, String> row) {
        switch (normalize(dataType)) {
            case "CUSTOMERS" -> jdbcTemplate.update("insert into customers(phone, full_name, email, address, source, branch_id, tier, status) values(?,?,?,?,?,?,?,?)",
                    row.get("phone"), row.get("fullName"), row.get("email"), row.get("address"), row.getOrDefault("source", "IMPORT"), longValue(row, "branchId"), value(row, "tier", "NORMAL"), value(row, "status", "ACTIVE"));
            case "PRODUCTS" -> jdbcTemplate.update("insert into products(product_code, product_name, category, brand, model, color, import_price, sale_price, warranty_months, status) values(?,?,?,?,?,?,?,?,?,?)",
                    row.get("productCode"), row.get("productName"), value(row, "category", "SPARE_PART"), row.get("brand"), row.get("model"), row.get("color"), money(row, "importPrice"), money(row, "salePrice"), intValue(row, "warrantyMonths", 0), value(row, "status", "ACTIVE"));
            case "SERIALS" -> jdbcTemplate.update("insert into product_serials(product_id, serial_number, branch_id, frame_number, engine_number, battery_serial, motor_serial, import_date, status) values(?,?,?,?,?,?,?,?,?)",
                    longValue(row, "productId"), row.get("serialNumber"), longValue(row, "branchId"), row.get("frameNumber"), row.get("engineNumber"), row.get("batterySerial"), row.get("motorSerial"), date(row, "importDate"), value(row, "status", "IN_STOCK"));
            case "INITIAL_INVENTORY" -> upsertInitialInventory(row);
            case "SUPPLIERS" -> jdbcTemplate.update("insert into suppliers(supplier_code, supplier_name, phone, email, address, tax_code, status) values(?,?,?,?,?,?,?)",
                    row.get("supplierCode"), row.get("supplierName"), row.get("phone"), row.get("email"), row.get("address"), row.get("taxCode"), value(row, "status", "ACTIVE"));
            case "CHART_OF_ACCOUNTS" -> jdbcTemplate.update("insert into chart_of_accounts(account_code, account_name, account_type, parent_code, active) values(?,?,?,?,?)",
                    row.get("accountCode"), row.get("accountName"), value(row, "accountType", "ASSET"), row.get("parentCode"), true);
            case "EMPLOYEES" -> jdbcTemplate.update("insert into employees(employee_code, full_name, phone, email, branch_id, hire_date, status, base_salary, allowance) values(?,?,?,?,?,?,?,?,?)",
                    row.get("employeeCode"), row.get("fullName"), row.get("phone"), row.get("email"), longValue(row, "branchId"), date(row, "hireDate"), value(row, "status", "ACTIVE"), money(row, "baseSalary"), money(row, "allowance"));
            default -> throw new BusinessException("Unsupported import type: " + dataType);
        }
    }

    private List<Map<String, Object>> exportRows(String dataType, Long branchId, String keyword) {
        return switch (normalize(dataType)) {
            case "CUSTOMERS" -> jdbcTemplate.queryForList("select id, phone, full_name fullName, email, address, source, branch_id branchId, tier, status from customers where (? is null or branch_id = ?) and (? = '' or lower(full_name) like concat('%', ?, '%') or phone like concat('%', ?, '%')) order by id desc limit 500", branchId, branchId, keyword, keyword, keyword);
            case "PRODUCTS" -> jdbcTemplate.queryForList("select id, product_code productCode, product_name productName, category, brand, model, import_price importPrice, sale_price salePrice, status from products where (? = '' or lower(product_name) like concat('%', ?, '%') or lower(product_code) like concat('%', ?, '%')) order by id desc limit 500", keyword, keyword, keyword);
            case "INVENTORY" -> jdbcTemplate.queryForList("select s.branch_id branchId, b.name branchName, p.product_code productCode, p.product_name productName, s.quantity_on_hand quantityOnHand, s.min_quantity minQuantity, s.average_cost averageCost from inventory_stocks s join products p on p.id=s.product_id join branches b on b.id=s.branch_id where (? is null or s.branch_id = ?) order by b.name, p.product_name limit 500", branchId, branchId);
            case "SERIALS" -> jdbcTemplate.queryForList("select ps.id, ps.serial_number serialNumber, p.product_code productCode, p.product_name productName, ps.branch_id branchId, ps.frame_number frameNumber, ps.status from product_serials ps join products p on p.id=ps.product_id where (? is null or ps.branch_id = ?) order by ps.id desc limit 500", branchId, branchId);
            case "ORDERS" -> jdbcTemplate.queryForList("select order_no orderNo, branch_id branchId, customer_id customerId, employee_id employeeId, order_date orderDate, status, total_amount totalAmount, payment_status paymentStatus from sales_orders where (? is null or branch_id = ?) order by order_date desc limit 500", branchId, branchId);
            case "DEBT" -> jdbcTemplate.queryForList("select customer_name name, 'CUSTOMER' type, debit_amount debitAmount, credit_amount creditAmount, due_date dueDate, status from receivables order by due_date asc limit 500");
            case "SUPPLIERS" -> jdbcTemplate.queryForList("select id, supplier_code supplierCode, supplier_name supplierName, phone, email, tax_code taxCode, status from suppliers order by id desc limit 500");
            default -> throw new BusinessException("Unsupported export type: " + dataType);
        };
    }

    private void upsertInitialInventory(Map<String, String> row) {
        Long branchId = longValue(row, "branchId");
        Long productId = longValue(row, "productId");
        int quantity = intValue(row, "quantityOnHand", 0);
        int minQuantity = intValue(row, "minQuantity", 0);
        BigDecimal averageCost = money(row, "averageCost");
        if (exists("select count(*) from inventory_stocks where branch_id = ? and product_id = ?", branchId, productId)) {
            jdbcTemplate.update("update inventory_stocks set quantity_on_hand = ?, min_quantity = ?, average_cost = ? where branch_id = ? and product_id = ?",
                    quantity, minQuantity, averageCost, branchId, productId);
            return;
        }
        jdbcTemplate.update("insert into inventory_stocks(branch_id, product_id, quantity_on_hand, reserved_quantity, min_quantity, average_cost) values(?,?,?,?,?,?)",
                branchId, productId, quantity, 0, minQuantity, averageCost);
    }

    private List<Map<String, String>> readRows(MultipartFile file) {
        String name = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);
        try (InputStream input = file.getInputStream()) {
            if (name.endsWith(".xlsx")) {
                return readXlsx(input);
            }
            return readCsv(new String(input.readAllBytes()));
        } catch (Exception exception) {
            throw new BusinessException("Cannot read import file: " + exception.getMessage());
        }
    }

    private List<Map<String, String>> readXlsx(InputStream input) throws Exception {
        try (Workbook workbook = new XSSFWorkbook(input)) {
            var sheet = workbook.getSheetAt(0);
            Row header = sheet.getRow(0);
            List<String> columns = new ArrayList<>();
            for (Cell cell : header) {
                columns.add(cell.getStringCellValue().trim());
            }
            List<Map<String, String>> rows = new ArrayList<>();
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                Map<String, String> values = new LinkedHashMap<>();
                for (int c = 0; c < columns.size(); c++) {
                    values.put(columns.get(c), cellValue(row.getCell(c)));
                }
                if (values.values().stream().anyMatch(value -> !blank(value))) rows.add(values);
            }
            return rows;
        }
    }

    private List<Map<String, String>> readCsv(String content) {
        String[] lines = content.replace("\r\n", "\n").split("\n");
        if (lines.length == 0) return List.of();
        List<String> columns = List.of(lines[0].split(",", -1)).stream().map(String::trim).toList();
        List<Map<String, String>> rows = new ArrayList<>();
        for (int i = 1; i < lines.length; i++) {
            if (lines[i].isBlank()) continue;
            String[] cells = lines[i].split(",", -1);
            Map<String, String> row = new LinkedHashMap<>();
            for (int c = 0; c < columns.size(); c++) row.put(columns.get(c), c < cells.length ? cells[c].trim() : "");
            rows.add(row);
        }
        return rows;
    }

    private byte[] workbook(List<String> columns, List<? extends Map<String, ?>> rows, String sheetName) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet(sheetName);
            Row header = sheet.createRow(0);
            for (int c = 0; c < columns.size(); c++) header.createCell(c).setCellValue(columns.get(c));
            for (int r = 0; r < rows.size(); r++) {
                Row row = sheet.createRow(r + 1);
                Map<String, ?> source = rows.get(r);
                for (int c = 0; c < columns.size(); c++) {
                    Object value = valueOf(source, columns.get(c));
                    row.createCell(c).setCellValue(value == null ? "" : String.valueOf(value));
                }
            }
            workbook.write(output);
            return output.toByteArray();
        } catch (Exception exception) {
            throw new BusinessException("Cannot build workbook: " + exception.getMessage());
        }
    }

    private byte[] csv(List<String> columns, List<Map<String, Object>> rows) {
        StringBuilder builder = new StringBuilder(String.join(",", columns)).append('\n');
        for (Map<String, Object> row : rows) {
            builder.append(String.join(",", columns.stream().map(column -> String.valueOf(valueOf(row, column))).toList())).append('\n');
        }
        return builder.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    private List<String> columns(String dataType) {
        return switch (normalize(dataType)) {
            case "CUSTOMERS" -> List.of("phone", "fullName", "email", "address", "source", "branchId", "tier", "status");
            case "PRODUCTS" -> List.of("productCode", "productName", "category", "brand", "model", "color", "importPrice", "salePrice", "warrantyMonths", "status");
            case "SERIALS" -> List.of("productId", "serialNumber", "branchId", "frameNumber", "engineNumber", "batterySerial", "motorSerial", "importDate", "status");
            case "INITIAL_INVENTORY" -> List.of("branchId", "productId", "quantityOnHand", "minQuantity", "averageCost");
            case "SUPPLIERS" -> List.of("supplierCode", "supplierName", "phone", "email", "address", "taxCode", "status");
            case "CHART_OF_ACCOUNTS" -> List.of("accountCode", "accountName", "accountType", "parentCode");
            case "EMPLOYEES" -> List.of("employeeCode", "fullName", "phone", "email", "branchId", "hireDate", "status", "baseSalary", "allowance");
            default -> throw new BusinessException("Unsupported data type: " + dataType);
        };
    }

    private List<String> exportColumns(String dataType) {
        return switch (normalize(dataType)) {
            case "ORDERS" -> List.of("orderNo", "branchId", "customerId", "employeeId", "orderDate", "status", "totalAmount", "paymentStatus");
            case "INVENTORY" -> List.of("branchId", "branchName", "productCode", "productName", "quantityOnHand", "minQuantity", "averageCost");
            case "DEBT" -> List.of("name", "type", "debitAmount", "creditAmount", "dueDate", "status");
            default -> columns(dataType);
        };
    }

    private List<String> requiredColumns(String type) {
        return switch (type) {
            case "CUSTOMERS" -> List.of("phone", "fullName", "branchId");
            case "PRODUCTS" -> List.of("productCode", "productName", "category");
            case "SERIALS" -> List.of("productId", "serialNumber", "branchId");
            case "INITIAL_INVENTORY" -> List.of("branchId", "productId", "quantityOnHand");
            case "SUPPLIERS" -> List.of("supplierCode", "supplierName");
            case "CHART_OF_ACCOUNTS" -> List.of("accountCode", "accountName", "accountType");
            case "EMPLOYEES" -> List.of("employeeCode", "fullName", "branchId");
            default -> List.of();
        };
    }

    private Long branchScoped(String dataType, Long branchId) {
        String type = normalize(dataType);
        if (List.of("CUSTOMERS", "INVENTORY", "SERIALS", "ORDERS").contains(type)) {
            return branchSecurity.scopedBranchId(branchId);
        }
        return branchId;
    }

    private void validateUpload(MultipartFile file) {
        if (file.isEmpty()) throw new BusinessException("File is empty");
        if (file.getSize() > MAX_UPLOAD_BYTES) throw new BusinessException("File exceeds 10MB limit");
        String contentType = file.getContentType() == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : file.getContentType();
        if (!ALLOWED_UPLOAD_TYPES.contains(contentType)) throw new BusinessException("File type is not allowed");
        if (DANGEROUS_EXTENSIONS.contains(extension(file.getOriginalFilename()))) throw new BusinessException("Dangerous file extension is not allowed");
    }

    private boolean exists(String sql, Object... args) {
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, args);
        return count != null && count > 0;
    }

    private DataIoDtos.RowError error(int rowNumber, String field, String code, String message, Map<String, String> row) {
        return new DataIoDtos.RowError(rowNumber, field, code, message, row);
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim().replace('-', '_').toUpperCase(Locale.ROOT);
    }

    private static boolean blank(String value) {
        return value == null || value.isBlank();
    }

    private static String value(Map<String, String> row, String key, String fallback) {
        return blank(row.get(key)) ? fallback : row.get(key);
    }

    private static Long longValue(Map<String, String> row, String key) {
        return blank(row.get(key)) ? null : Long.valueOf(row.get(key));
    }

    private static int intValue(Map<String, String> row, String key, int fallback) {
        return blank(row.get(key)) ? fallback : Integer.parseInt(row.get(key));
    }

    private static BigDecimal money(Map<String, String> row, String key) {
        return blank(row.get(key)) ? BigDecimal.ZERO : new BigDecimal(row.get(key));
    }

    private static LocalDate date(Map<String, String> row, String key) {
        return blank(row.get(key)) ? LocalDate.now() : LocalDate.parse(row.get(key));
    }

    private static Object valueOf(Map<String, ?> row, String key) {
        if (row.containsKey(key)) return row.get(key);
        for (Map.Entry<String, ?> entry : row.entrySet()) {
            if (entry.getKey().equalsIgnoreCase(key)) {
                return entry.getValue();
            }
        }
        return "";
    }

    private static String cellValue(Cell cell) {
        if (cell == null) return "";
        cell.setCellType(CellType.STRING);
        return cell.getStringCellValue().trim();
    }

    private static String safeFileName(String value) {
        String name = value == null ? "upload" : Path.of(value).getFileName().toString();
        return name.replaceAll("[^A-Za-z0-9._-]", "_");
    }

    private static String extension(String value) {
        if (value == null || !value.contains(".")) return "";
        return value.substring(value.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }

    private void audit(AuditAction action, String entityId, String result) {
        auditLogService.record(new CreateAuditLogRequest(currentUsername(), action, AuditModule.SYSTEM, "DataIO", entityId, null, result, null, null));
    }

    private String currentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication == null ? "system" : authentication.getName();
    }
}

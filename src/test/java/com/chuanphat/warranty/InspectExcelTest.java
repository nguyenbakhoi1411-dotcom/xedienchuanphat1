package com.chuanphat.warranty;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import java.io.FileInputStream;
import java.io.File;
import java.util.*;

public class InspectExcelTest {

    @Test
    public void testInspect() throws Exception {
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
            System.out.println("Target file not found");
            return;
        }

        try (FileInputStream fis = new FileInputStream(targetFile);
             Workbook workbook = new XSSFWorkbook(fis)) {
            
            Sheet sheet = workbook.getSheetAt(0);
            Set<String> vehicleTypes = new HashSet<>();
            Set<String> khoDms = new HashSet<>();
            int totalRows = sheet.getLastRowNum();
            
            for (int r = 2; r <= totalRows; r++) { // Row 2 is first data row
                Row row = sheet.getRow(r);
                if (row == null) continue;
                
                String vehicle = getCellValueString(row.getCell(5)).trim();
                String warehouse = getCellValueString(row.getCell(9)).trim();
                
                if (!vehicle.isEmpty()) vehicleTypes.add(vehicle);
                if (!warehouse.isEmpty()) khoDms.add(warehouse);
            }
            
            System.out.println("UNIQUE VEHICLE TYPES (" + vehicleTypes.size() + "):");
            for (String v : vehicleTypes) {
                System.out.println("  - " + v);
            }
            
            System.out.println("UNIQUE KHO DMS (" + khoDms.size() + "):");
            for (String k : khoDms) {
                System.out.println("  - " + k);
            }
        }
    }

    private String getCellValueString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                }
                return String.valueOf(cell.getNumericCellValue());
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue());
            case FORMULA: return cell.getCellFormula();
            default: return "";
        }
    }
}

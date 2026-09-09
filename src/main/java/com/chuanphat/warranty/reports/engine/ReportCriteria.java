package com.chuanphat.warranty.reports.engine;

import java.time.LocalDate;

public record ReportCriteria(
    String reportType,
    LocalDate fromDate,
    LocalDate toDate,
    Long branchId,
    Long employeeId,
    Long productId,
    Long customerId,
    Long supplierId,
    String status,
    String productCategory,
    int page,
    int pageSize
) {}

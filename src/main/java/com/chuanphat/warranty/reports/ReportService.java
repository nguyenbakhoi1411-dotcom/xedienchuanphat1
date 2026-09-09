package com.chuanphat.warranty.reports;

import com.chuanphat.warranty.common.security.BranchSecurity;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.chuanphat.warranty.reports.engine.ReportEngine;
import com.chuanphat.warranty.reports.engine.ReportCriteria;
import org.springframework.stereotype.Service;

@Service
public class ReportService {
    private static final Logger log = LoggerFactory.getLogger(ReportService.class);
    private static final int MAX_INTERACTIVE_RANGE_DAYS = 186;
    private static final int MAX_EXPORT_RANGE_DAYS = 366;
    private static final int LARGE_RESULT_THRESHOLD = 5_000;
    private static final long SLOW_REPORT_QUERY_MS = 1_000;

    private final JdbcTemplate jdbcTemplate;
    private final BranchSecurity branchSecurity;
    private final ExportDocumentService exportDocumentService;
    private final ReportEngine reportEngine;

    public ReportService(JdbcTemplate jdbcTemplate, BranchSecurity branchSecurity, ExportDocumentService exportDocumentService, ReportEngine reportEngine) {
        this.jdbcTemplate = jdbcTemplate;
        this.branchSecurity = branchSecurity;
        this.exportDocumentService = exportDocumentService;
        this.reportEngine = reportEngine;
    }

    public Map<String, Object> report(String type, LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, Long productId, String productCategory, int page, int pageSize) {
        return report(type, fromDate, toDate, branchId, employeeId, productId, null, null, productCategory, page, pageSize);
    }

    public Map<String, Object> report(String type, LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, Long productId, Long customerId, String status, String productCategory, int page, int pageSize) {
        validateDateRange(fromDate, toDate, MAX_INTERACTIVE_RANGE_DAYS);
        return buildReport(type, fromDate, toDate, branchId, employeeId, productId, customerId, status, productCategory, page, pageSize);
    }

    private Map<String, Object> buildReport(String type, LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, Long productId, String productCategory, int page, int pageSize) {
        return buildReport(type, fromDate, toDate, branchId, employeeId, productId, null, null, productCategory, page, pageSize);
    }

    private Map<String, Object> buildReport(String type, LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, Long productId, Long customerId, String status, String productCategory, int page, int pageSize) {
        int safePage = Math.max(page, 0);
        int safePageSize = Math.min(Math.max(pageSize, 1), 500);

        try {
            ReportCriteria criteria = new ReportCriteria(type, fromDate, toDate, branchId, employeeId, productId, customerId, null, status, productCategory, safePage, safePageSize);
            return maskSensitive(reportEngine.generateReport(criteria));
        } catch (IllegalArgumentException e) {
            // Fallback to legacy reports
        }

        Map<String, Object> result = switch (normalizeType(type)) {
            case "SALES", "SALES_REPORT", "REVENUE_TIME" -> salesReport(fromDate, toDate, branchId, employeeId, productId, customerId, status, productCategory, safePage, safePageSize);
            case "INVENTORY_VALUATION", "INVENTORY" -> inventoryValuation(branchId, productId, productCategory, safePage, safePageSize);
            case "INVENTORY_SERIAL" -> inventorySerial(branchId, productId, status, productCategory, safePage, safePageSize);
            case "LOW_STOCK" -> lowStock(branchId, productId, productCategory, safePage, safePageSize);
            case "SLOW_MOVING_STOCK" -> slowMovingStock(fromDate, toDate, branchId, productId, productCategory, safePage, safePageSize);
            case "DEFECTIVE_STOCK" -> defectiveStock(branchId, productId, productCategory, safePage, safePageSize);
            case "STOCKTAKE_VARIANCE" -> stocktakeVariance(fromDate, toDate, branchId, productId, productCategory, safePage, safePageSize);
            case "STOCK_MOVEMENT" -> stockMovement(fromDate, toDate, branchId, productId, productCategory, safePage, safePageSize);
            case "CUSTOMER_DEBT_AGING", "DEBT" -> customerDebtAging(branchId, safePage, safePageSize);
            case "SUPPLIER_DEBT_AGING" -> supplierDebtAging(branchId, safePage, safePageSize);
            case "PROFIT_LOSS", "PROFIT" -> profitLoss(fromDate, toDate, branchId, employeeId, productId, productCategory, safePage, safePageSize);
            case "CASH_FLOW" -> cashFlow(fromDate, toDate, branchId, safePage, safePageSize);
            case "PRODUCT_PERFORMANCE", "TOP_PRODUCTS" -> productPerformance(fromDate, toDate, branchId, employeeId, productId, productCategory, safePage, safePageSize);
            case "BRANCH_PERFORMANCE", "REVENUE_BRANCH" -> branchPerformance(fromDate, toDate, branchId, safePage, safePageSize);
            case "EMPLOYEE_PERFORMANCE", "REVENUE_EMPLOYEE" -> employeePerformance(fromDate, toDate, branchId, employeeId, productId, productCategory, safePage, safePageSize);
            case "WARRANTY_COST", "WARRANTY_REPAIR" -> warrantyCost(fromDate, toDate, branchId, employeeId, productCategory, safePage, safePageSize);
            case "WARRANTY_ANALYSIS" -> warrantyAnalysis(fromDate, toDate, branchId, employeeId, productCategory, safePage, safePageSize);
            case "EXECUTIVE_OPERATION" -> executiveOperation(fromDate, toDate, branchId, employeeId, productId, productCategory, safePage, safePageSize);
            case "MARKETING_SOURCE", "NEW_CUSTOMERS" -> marketingSource(fromDate, toDate, branchId, safePage, safePageSize);
            default -> throw new IllegalArgumentException("Unsupported report type: " + type);
        };
        return maskSensitive(result);
    }

    public ExportFile export(String type, String format, LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, Long productId, String productCategory) {
        validateDateRange(fromDate, toDate, MAX_EXPORT_RANGE_DAYS);
        Map<String, Object> data = buildReport(type, fromDate, toDate, branchId, employeeId, productId, productCategory, 0, 500);
        boolean pdf = "pdf".equalsIgnoreCase(format);
        ExportDocumentService.ExportMeta meta = new ExportDocumentService.ExportMeta(
                String.valueOf(data.getOrDefault("title", type)),
                fromDate,
                toDate,
                branchId == null ? "Tat ca chi nhanh" : "Chi nhanh #" + branchId,
                branchSecurity.currentUser().getUsername()
        );
        String extension = pdf ? "pdf" : "xlsx";
        String contentType = pdf ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        byte[] content = pdf ? exportDocumentService.reportPdf(data, meta) : exportDocumentService.reportExcel(data, meta);
        String fileName = exportDocumentService.fileName(normalizeType(type).toLowerCase(Locale.ROOT), fromDate, toDate, extension);
        return new ExportFile(fileName, contentType, content);
    }

    public Map<String, Object> salesReport(LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, Long productId, String productCategory, int page, int pageSize) {
        return salesReport(fromDate, toDate, branchId, employeeId, productId, null, null, productCategory, page, pageSize);
    }

    public Map<String, Object> salesReport(LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, Long productId, Long customerId, String status, String productCategory, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        long totalItems = number("""
                select count(distinct so.order_date)
                from sales_orders so
                join sales_order_items soi on soi.order_id = so.id
                join products p on p.id = soi.product_id
                where so.status <> 'CANCELLED' and so.order_date >= ? and so.order_date <= ?
                  and (? is null or so.branch_id = ?)
                  and (? is null or so.employee_id = ?)
                  and (? is null or p.id = ?)
                  and (? is null or so.customer_id = ?)
                  and (? is null or so.status = ?)
                  and (? is null or p.category = ?)
                """, fromDate, toDate, scopedBranchId, scopedBranchId, employeeId, employeeId, productId, productId, customerId, customerId, status, status, productCategory, productCategory).longValue();
        Number cancelled = number("""
                select count(*)
                from sales_orders so
                where so.status = 'CANCELLED' and so.order_date >= ? and so.order_date <= ?
                  and (? is null or so.branch_id = ?)
                  and (? is null or so.employee_id = ?)
                  and (? is null or so.customer_id = ?)
                  and (? is null or so.status = ?)
                """, fromDate, toDate, scopedBranchId, scopedBranchId, employeeId, employeeId, customerId, customerId, status, status);
        Number returned = number("""
                select count(*)
                from sales_returns sr
                where sr.return_date >= ? and sr.return_date <= ?
                  and (? is null or sr.branch_id = ?)
                  and (? is null or sr.customer_id = ?)
                  and (? is null or sr.status = ?)
                """, fromDate, toDate, scopedBranchId, scopedBranchId, customerId, customerId, status, status);
        return report("Sales Report", "Doanh thu, so don, gia von va loi nhuan gop theo ngay.", "Doanh thu",
                List.of(col("period", "Ngay"), col("orders", "Don hang"), col("cancelledOrders", "Don huy"), col("returnOrders", "Don tra"), col("revenue", "Doanh thu"), col("costOfGoodsSold", "Gia von"), col("grossProfit", "Loi nhuan gop")),
                queryForList("""
                        select so.order_date period, count(distinct so.id) orders,
                               count(distinct case when so.status = 'CANCELLED' then so.id end) cancelledOrders,
                               (select count(*) from sales_returns sr where sr.return_date = so.order_date and (? is null or sr.branch_id = ?) and (? is null or sr.customer_id = ?)) returnOrders,
                               coalesce(sum(soi.line_total),0) revenue,
                               coalesce(sum(soi.quantity * p.import_price),0) costOfGoodsSold,
                               coalesce(sum(soi.line_total - soi.quantity * p.import_price),0) grossProfit
                        from sales_orders so
                        join sales_order_items soi on soi.order_id = so.id
                        join products p on p.id = soi.product_id
                        where so.order_date >= ? and so.order_date <= ?
                          and (? is null or so.branch_id = ?)
                          and (? is null or so.employee_id = ?)
                          and (? is null or p.id = ?)
                          and (? is null or so.customer_id = ?)
                          and (? is null or so.status = ?)
                          and (? is null or p.category = ?)
                        group by so.order_date
                        order by so.order_date desc
                        limit ? offset ?
                        """, scopedBranchId, scopedBranchId, customerId, customerId, fromDate, toDate, scopedBranchId, scopedBranchId, employeeId, employeeId, productId, productId, customerId, customerId, status, status, productCategory, productCategory, pageSize, page * pageSize),
                page, pageSize, totalItems,
                List.of(
                        summary("cancelled", "Don huy", String.valueOf(cancelled.longValue()), "Don bi huy trong ky", "red"),
                        summary("returned", "Don tra", String.valueOf(returned.longValue()), "Phieu tra hang trong ky", "orange")
                ));
    }

    public Map<String, Object> inventoryValuation(Long branchId, Long productId, String productCategory, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        long totalItems = number("""
                select count(*)
                from inventory_stocks s
                join products p on p.id = s.product_id
                join branches b on b.id = s.branch_id
                where (? is null or s.branch_id = ?)
                  and (? is null or p.id = ?)
                  and (? is null or p.category = ?)
                """, scopedBranchId, scopedBranchId, productId, productId, productCategory, productCategory).longValue();
        return report("Inventory Valuation Report", "Gia tri ton kho theo chi nhanh va san pham.", "Gia tri ton",
                List.of(col("product", "San pham"), col("sku", "SKU"), col("branch", "Chi nhanh"), col("stock", "Ton"), col("unitCost", "Gia von"), col("stockValue", "Gia tri ton")),
                queryForList("""
                        select p.product_name product, p.product_code sku, b.name branch,
                               s.quantity_on_hand stock, p.import_price unitCost,
                               s.quantity_on_hand * p.import_price stockValue
                        from inventory_stocks s
                        join products p on p.id = s.product_id
                        join branches b on b.id = s.branch_id
                        where (? is null or s.branch_id = ?)
                          and (? is null or p.id = ?)
                          and (? is null or p.category = ?)
                        order by s.quantity_on_hand * p.import_price desc
                        limit ? offset ?
                        """, scopedBranchId, scopedBranchId, productId, productId, productCategory, productCategory, pageSize, page * pageSize),
                page, pageSize, totalItems);
    }

    public Map<String, Object> inventorySerial(Long branchId, Long productId, String status, String productCategory, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        long totalItems = number("""
                select count(*)
                from product_serials ps
                join products p on p.id = ps.product_id
                left join branches b on b.id = ps.branch_id
                left join suppliers s on s.id = ps.supplier_id
                where (? is null or ps.branch_id = ?)
                  and (? is null or p.id = ?)
                  and (? is null or ps.status = ?)
                  and (? is null or p.category = ?)
                """, scopedBranchId, scopedBranchId, productId, productId, status, status, productCategory, productCategory).longValue();
        return report("Inventory Serial Report", "Ton kho chi tiet theo serial, trang thai va nha cung cap.", "Serial",
                List.of(col("serialNumber", "Serial"), col("product", "San pham"), col("branch", "Chi nhanh"), col("status", "Trang thai"), col("supplier", "Nha cung cap"), col("importDate", "Ngay nhap")),
                queryForList("""
                        select ps.serial_number serialNumber, p.product_name product, coalesce(b.name, '') branch,
                               ps.status status, coalesce(s.supplier_name, '') supplier, ps.import_date importDate
                        from product_serials ps
                        join products p on p.id = ps.product_id
                        left join branches b on b.id = ps.branch_id
                        left join suppliers s on s.id = ps.supplier_id
                        where (? is null or ps.branch_id = ?)
                          and (? is null or p.id = ?)
                          and (? is null or ps.status = ?)
                          and (? is null or p.category = ?)
                        order by ps.import_date desc, ps.id desc
                        limit ? offset ?
                        """, scopedBranchId, scopedBranchId, productId, productId, status, status, productCategory, productCategory, pageSize, page * pageSize),
                page, pageSize, totalItems);
    }

    public Map<String, Object> lowStock(Long branchId, Long productId, String productCategory, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        long totalItems = number("""
                select count(*)
                from inventory_stocks s join products p on p.id = s.product_id
                where s.quantity_on_hand <= s.min_quantity
                  and (? is null or s.branch_id = ?)
                  and (? is null or p.id = ?)
                  and (? is null or p.category = ?)
                """, scopedBranchId, scopedBranchId, productId, productId, productCategory, productCategory).longValue();
        return report("Low Stock Report", "Hang sap het theo nguong ton toi thieu.", "Ton kho",
                List.of(col("product", "San pham"), col("branch", "Chi nhanh"), col("stock", "Ton"), col("minimum", "Toi thieu"), col("suggestedReorder", "Can nhap")),
                queryForList("""
                        select p.product_name product, b.name branch, s.quantity_on_hand stock, s.min_quantity minimum,
                               greatest(s.min_quantity * 2 - s.quantity_on_hand, 0) suggestedReorder
                        from inventory_stocks s
                        join products p on p.id = s.product_id
                        join branches b on b.id = s.branch_id
                        where s.quantity_on_hand <= s.min_quantity
                          and (? is null or s.branch_id = ?)
                          and (? is null or p.id = ?)
                          and (? is null or p.category = ?)
                        order by suggestedReorder desc
                        limit ? offset ?
                        """, scopedBranchId, scopedBranchId, productId, productId, productCategory, productCategory, pageSize, page * pageSize),
                page, pageSize, totalItems);
    }

    public Map<String, Object> slowMovingStock(LocalDate fromDate, LocalDate toDate, Long branchId, Long productId, String productCategory, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        long totalItems = number("""
                select count(*)
                from inventory_stocks s join products p on p.id = s.product_id
                where s.quantity_on_hand > 0
                  and (? is null or s.branch_id = ?)
                  and (? is null or p.id = ?)
                  and (? is null or p.category = ?)
                """, scopedBranchId, scopedBranchId, productId, productId, productCategory, productCategory).longValue();
        List<Map<String, Object>> rows = queryForList("""
                        select p.product_name product, b.name branch, s.quantity_on_hand stock,
                               max(it.transaction_date) lastOutboundDate, min(ps.import_date) firstImportDate
                        from inventory_stocks s
                        join products p on p.id = s.product_id
                        join branches b on b.id = s.branch_id
                        left join inventory_transactions it on it.product_id = p.id and it.from_branch_id = s.branch_id and it.type in ('EXPORT','TRANSFER_OUT')
                        left join product_serials ps on ps.product_id = p.id and ps.branch_id = s.branch_id
                        where s.quantity_on_hand > 0
                          and (? is null or s.branch_id = ?)
                          and (? is null or p.id = ?)
                          and (? is null or p.category = ?)
                        group by p.product_name, b.name, s.quantity_on_hand
                        order by s.quantity_on_hand desc
                        limit ? offset ?
                        """, scopedBranchId, scopedBranchId, productId, productId, productCategory, productCategory, pageSize, page * pageSize).stream()
                .map(row -> {
                    Map<String, Object> copy = new LinkedHashMap<>(row);
                    Object lastOutbound = valueOf(row, "lastOutboundDate");
                    Object firstImport = valueOf(row, "firstImportDate");
                    LocalDate anchor = lastOutbound == null ? asLocalDate(firstImport) : asLocalDate(lastOutbound);
                    copy.put("daysIdle", anchor == null ? 0 : ChronoUnit.DAYS.between(anchor, toDate));
                    return copy;
                })
                .sorted((left, right) -> Long.compare(((Number) right.get("daysIdle")).longValue(), ((Number) left.get("daysIdle")).longValue()))
                .toList();
        return report("Slow Moving Stock", "Hang ton lau va cham ban theo lan xuat gan nhat.", "Ngay ton",
                List.of(col("product", "San pham"), col("branch", "Chi nhanh"), col("stock", "Ton"), col("lastOutboundDate", "Xuat gan nhat"), col("daysIdle", "Ngay khong ban")),
                rows,
                page, pageSize, totalItems);
    }

    public Map<String, Object> defectiveStock(Long branchId, Long productId, String productCategory, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        long totalItems = number("""
                select count(*)
                from product_serials ps join products p on p.id = ps.product_id
                where ps.status in ('DEFECTIVE','WARRANTY','IN_SERVICE')
                  and (? is null or ps.branch_id = ?)
                  and (? is null or p.id = ?)
                  and (? is null or p.category = ?)
                """, scopedBranchId, scopedBranchId, productId, productId, productCategory, productCategory).longValue();
        return report("Defective Stock", "Hang loi, dang bao hanh hoac dang sua chua.", "So serial",
                List.of(col("product", "San pham"), col("serialNumber", "Serial"), col("branch", "Chi nhanh"), col("status", "Trang thai"), col("defectReason", "Ly do loi")),
                queryForList("""
                        select p.product_name product, ps.serial_number serialNumber, b.name branch, ps.status status,
                               coalesce(ps.defect_reason, '') defectReason
                        from product_serials ps
                        join products p on p.id = ps.product_id
                        join branches b on b.id = ps.branch_id
                        where ps.status in ('DEFECTIVE','WARRANTY','IN_SERVICE')
                          and (? is null or ps.branch_id = ?)
                          and (? is null or p.id = ?)
                          and (? is null or p.category = ?)
                        order by ps.id desc
                        limit ? offset ?
                        """, scopedBranchId, scopedBranchId, productId, productId, productCategory, productCategory, pageSize, page * pageSize),
                page, pageSize, totalItems);
    }

    public Map<String, Object> stocktakeVariance(LocalDate fromDate, LocalDate toDate, Long branchId, Long productId, String productCategory, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        long totalItems = number("""
                select count(*)
                from inventory_stocktakes st join products p on p.id = st.product_id
                where st.stocktake_date >= ? and st.stocktake_date <= ?
                  and (? is null or st.branch_id = ?)
                  and (? is null or p.id = ?)
                  and (? is null or p.category = ?)
                """, fromDate, toDate, scopedBranchId, scopedBranchId, productId, productId, productCategory, productCategory).longValue();
        return report("Stocktake Variance", "Chenh lech kiem ke theo san pham va chi nhanh.", "Chenh lech",
                List.of(col("date", "Ngay"), col("stocktakeNo", "Phieu"), col("product", "San pham"), col("branch", "Chi nhanh"), col("systemQuantity", "He thong"), col("countedQuantity", "Thuc dem"), col("varianceQuantity", "Chenh lech")),
                queryForList("""
                        select st.stocktake_date date, st.stocktake_no stocktakeNo, p.product_name product, b.name branch,
                               st.system_quantity systemQuantity, st.counted_quantity countedQuantity, st.variance_quantity varianceQuantity
                        from inventory_stocktakes st
                        join products p on p.id = st.product_id
                        join branches b on b.id = st.branch_id
                        where st.stocktake_date >= ? and st.stocktake_date <= ?
                          and (? is null or st.branch_id = ?)
                          and (? is null or p.id = ?)
                          and (? is null or p.category = ?)
                        order by abs(st.variance_quantity) desc
                        limit ? offset ?
                        """, fromDate, toDate, scopedBranchId, scopedBranchId, productId, productId, productCategory, productCategory, pageSize, page * pageSize),
                page, pageSize, totalItems);
    }

    public Map<String, Object> stockMovement(LocalDate fromDate, LocalDate toDate, Long branchId, Long productId, String productCategory, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        long totalItems = number("""
                select count(*)
                from inventory_transactions it
                join products p on p.id = it.product_id
                where it.transaction_date >= ? and it.transaction_date <= ?
                  and (? is null or it.from_branch_id = ? or it.to_branch_id = ?)
                  and (? is null or p.id = ?)
                  and (? is null or p.category = ?)
                """, fromDate, toDate, scopedBranchId, scopedBranchId, scopedBranchId, productId, productId, productCategory, productCategory).longValue();
        return report("Stock Movement Report", "Nhap xuat chuyen kho va dieu chinh ton trong ky.", "So luong",
                List.of(col("date", "Ngay"), col("type", "Loai"), col("transactionNo", "Ma giao dich"), col("product", "San pham"), col("quantity", "So luong")),
                queryForList("""
                        select it.transaction_date date, it.type type, it.transaction_no transactionNo, p.product_name product, it.quantity quantity
                        from inventory_transactions it
                        join products p on p.id = it.product_id
                        where it.transaction_date >= ? and it.transaction_date <= ?
                          and (? is null or it.from_branch_id = ? or it.to_branch_id = ?)
                          and (? is null or p.id = ?)
                          and (? is null or p.category = ?)
                        order by it.transaction_date desc, it.id desc
                        limit ? offset ?
                        """, fromDate, toDate, scopedBranchId, scopedBranchId, scopedBranchId, productId, productId, productCategory, productCategory, pageSize, page * pageSize),
                page, pageSize, totalItems);
    }

    public Map<String, Object> customerDebtAging(Long branchId, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        long totalItems = number("""
                select count(*) from (
                  select r.customer_name
                  from receivables r
                  join customers c on c.id = r.customer_id
                  where r.status <> 'PAID' and (? is null or c.branch_id = ?)
                  group by r.customer_name
                  having coalesce(sum(r.debit_amount - r.credit_amount),0) > 0
                ) t
                """, scopedBranchId, scopedBranchId).longValue();
        return report("Customer Debt Aging", "Phan tich tuoi no phai thu theo khach hang.", "So tien",
                List.of(col("customer", "Khach hang"), col("currentAmount", "0-30 ngay"), col("days31To60", "31-60 ngay"), col("days61To90", "61-90 ngay"), col("over90", "Tren 90 ngay"), col("total", "Tong")),
                queryForList("""
                        select r.customer_name customer,
                               coalesce(sum(case when r.due_date >= ? then r.debit_amount - r.credit_amount else 0 end),0) currentAmount,
                               coalesce(sum(case when r.due_date < ? and r.due_date >= ? then r.debit_amount - r.credit_amount else 0 end),0) days31To60,
                               coalesce(sum(case when r.due_date < ? and r.due_date >= ? then r.debit_amount - r.credit_amount else 0 end),0) days61To90,
                               coalesce(sum(case when r.due_date < ? then r.debit_amount - r.credit_amount else 0 end),0) over90,
                               coalesce(sum(r.debit_amount - r.credit_amount),0) total
                        from receivables r
                        join customers c on c.id = r.customer_id
                        where r.status <> 'PAID' and (? is null or c.branch_id = ?)
                        group by r.customer_name
                        having coalesce(sum(r.debit_amount - r.credit_amount),0) > 0
                        order by total desc
                        limit ? offset ?
                        """, LocalDate.now().minusDays(30), LocalDate.now().minusDays(30), LocalDate.now().minusDays(60),
                        LocalDate.now().minusDays(60), LocalDate.now().minusDays(90), LocalDate.now().minusDays(90),
                        scopedBranchId, scopedBranchId, pageSize, page * pageSize),
                page, pageSize, totalItems);
    }

    public Map<String, Object> supplierDebtAging(Long branchId, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        long totalItems = number("""
                select count(*) from (
                  select p.supplier_name
                  from accounting_payables p
                  left join purchase_orders po on po.purchase_order_no = p.source_no
                  where p.status <> 'PAID' and (? is null or po.branch_id = ?)
                  group by p.supplier_name
                  having coalesce(sum(p.credit_amount - p.debit_amount),0) > 0
                ) t
                """, scopedBranchId, scopedBranchId).longValue();
        return report("Supplier Debt Aging", "Phan tich tuoi no phai tra theo nha cung cap.", "So tien",
                List.of(col("supplier", "Nha cung cap"), col("currentAmount", "0-30 ngay"), col("days31To60", "31-60 ngay"), col("days61To90", "61-90 ngay"), col("over90", "Tren 90 ngay"), col("total", "Tong")),
                queryForList("""
                        select p.supplier_name supplier,
                               coalesce(sum(case when p.due_date >= ? then p.credit_amount - p.debit_amount else 0 end),0) currentAmount,
                               coalesce(sum(case when p.due_date < ? and p.due_date >= ? then p.credit_amount - p.debit_amount else 0 end),0) days31To60,
                               coalesce(sum(case when p.due_date < ? and p.due_date >= ? then p.credit_amount - p.debit_amount else 0 end),0) days61To90,
                               coalesce(sum(case when p.due_date < ? then p.credit_amount - p.debit_amount else 0 end),0) over90,
                               coalesce(sum(p.credit_amount - p.debit_amount),0) total
                        from accounting_payables p
                        left join purchase_orders po on po.purchase_order_no = p.source_no
                        where p.status <> 'PAID' and (? is null or po.branch_id = ?)
                        group by p.supplier_name
                        having coalesce(sum(p.credit_amount - p.debit_amount),0) > 0
                        order by total desc
                        limit ? offset ?
                        """, LocalDate.now().minusDays(30), LocalDate.now().minusDays(30), LocalDate.now().minusDays(60),
                        LocalDate.now().minusDays(60), LocalDate.now().minusDays(90), LocalDate.now().minusDays(90),
                        scopedBranchId, scopedBranchId, pageSize, page * pageSize),
                page, pageSize, totalItems);
    }

    public Map<String, Object> profitLoss(LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, Long productId, String productCategory, int page, int pageSize) {
        return profit(fromDate, toDate, branchId, employeeId, productId, productCategory);
    }

    public Map<String, Object> cashFlow(LocalDate fromDate, LocalDate toDate, Long branchId, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        long totalItems = number("""
                select count(*) from (
                  select transaction_date, source_type
                  from cash_books
                  where transaction_date >= ? and transaction_date <= ?
                    and (
                        ? is null
                        or exists (select 1 from sales_orders so where so.order_no = cash_books.source_no and so.branch_id = ?)
                        or exists (select 1 from purchase_orders po where po.purchase_order_no = cash_books.source_no and po.branch_id = ?)
                    )
                  group by transaction_date, source_type
                ) t
                """, fromDate, toDate, scopedBranchId, scopedBranchId, scopedBranchId).longValue();
        return report("Cash Flow", "Dong tien vao ra theo ngay va loai phieu.", "Tien vao",
                List.of(col("date", "Ngay"), col("sourceType", "Nguon"), col("cashIn", "Tien vao"), col("cashOut", "Tien ra"), col("net", "Dong tien rong")),
                queryForList("""
                        select transaction_date date, source_type sourceType,
                               coalesce(sum(amount_in),0) cashIn,
                               coalesce(sum(amount_out),0) cashOut,
                               coalesce(sum(amount_in - amount_out),0) net
                        from cash_books
                        where transaction_date >= ? and transaction_date <= ?
                          and (
                              ? is null
                              or exists (select 1 from sales_orders so where so.order_no = cash_books.source_no and so.branch_id = ?)
                              or exists (select 1 from purchase_orders po where po.purchase_order_no = cash_books.source_no and po.branch_id = ?)
                          )
                        group by transaction_date, source_type
                        order by transaction_date desc
                        limit ? offset ?
                        """, fromDate, toDate, scopedBranchId, scopedBranchId, scopedBranchId, pageSize, page * pageSize),
                page, pageSize, totalItems);
    }

    public Map<String, Object> productPerformance(LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, Long productId, String productCategory, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        long totalItems = number("""
                select count(*) from (
                  select p.product_name
                  from products p
                  join sales_order_items soi on soi.product_id = p.id
                  join sales_orders so on so.id = soi.order_id and so.status <> 'CANCELLED'
                  where so.order_date >= ? and so.order_date <= ?
                    and (? is null or so.branch_id = ?)
                    and (? is null or so.employee_id = ?)
                    and (? is null or p.id = ?)
                    and (? is null or p.category = ?)
                  group by p.product_name, p.product_code
                ) t
                """, fromDate, toDate, scopedBranchId, scopedBranchId, employeeId, employeeId, productId, productId, productCategory, productCategory).longValue();
        return report("Product Performance", "Hieu qua san pham theo so luong, doanh thu va loi nhuan.", "Doanh thu",
                List.of(col("product", "San pham"), col("sku", "SKU"), col("quantity", "So luong"), col("revenue", "Doanh thu"), col("grossProfit", "Loi nhuan gop")),
                queryForList("""
                        select p.product_name product, p.product_code sku, coalesce(sum(soi.quantity),0) quantity,
                               coalesce(sum(soi.line_total),0) revenue,
                               coalesce(sum(soi.line_total - soi.quantity * p.import_price),0) grossProfit
                        from products p
                        join sales_order_items soi on soi.product_id = p.id
                        join sales_orders so on so.id = soi.order_id and so.status <> 'CANCELLED'
                        where so.order_date >= ? and so.order_date <= ?
                          and (? is null or so.branch_id = ?)
                          and (? is null or so.employee_id = ?)
                          and (? is null or p.id = ?)
                          and (? is null or p.category = ?)
                        group by p.product_name, p.product_code
                        order by revenue desc
                        limit ? offset ?
                        """, fromDate, toDate, scopedBranchId, scopedBranchId, employeeId, employeeId, productId, productId, productCategory, productCategory, pageSize, page * pageSize),
                page, pageSize, totalItems);
    }

    public Map<String, Object> branchPerformance(LocalDate fromDate, LocalDate toDate, Long branchId, int page, int pageSize) {
        return revenueBranch(fromDate, toDate, branchId, page, pageSize);
    }

    public Map<String, Object> employeePerformance(LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, Long productId, String productCategory, int page, int pageSize) {
        return revenueEmployee(fromDate, toDate, branchId, employeeId, productId, productCategory, page, pageSize);
    }

    public Map<String, Object> warrantyCost(LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, String productCategory, int page, int pageSize) {
        return warrantyRepair(fromDate, toDate, branchId, employeeId, productCategory, page, pageSize);
    }

    public Map<String, Object> marketingSource(LocalDate fromDate, LocalDate toDate, Long branchId, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        long totalItems = number("""
                select count(distinct coalesce(c.source, 'UNKNOWN'))
                from customers c
                where c.created_at >= ? and c.created_at < ? and (? is null or c.branch_id = ?)
                """, java.sql.Date.valueOf(fromDate), java.sql.Date.valueOf(toDate.plusDays(1)), scopedBranchId, scopedBranchId).longValue();
        return report("Marketing Source Report", "Nguon khach hang va doanh thu phat sinh theo nguon.", "Khach hang",
                List.of(col("source", "Nguon"), col("customers", "Khach hang"), col("orders", "Don hang"), col("revenue", "Doanh thu")),
                queryForList("""
                        select coalesce(c.source, 'UNKNOWN') source, count(distinct c.id) customers,
                               count(distinct so.id) orders, coalesce(sum(so.total_amount),0) revenue
                        from customers c
                        left join sales_orders so on so.customer_id = c.id and so.status <> 'CANCELLED' and so.order_date >= ? and so.order_date <= ?
                        where c.created_at >= ? and c.created_at < ? and (? is null or c.branch_id = ?)
                        group by c.source
                        order by customers desc
                        limit ? offset ?
                        """, fromDate, toDate, java.sql.Date.valueOf(fromDate), java.sql.Date.valueOf(toDate.plusDays(1)), scopedBranchId, scopedBranchId, pageSize, page * pageSize),
                page, pageSize, totalItems);
    }

    public Map<String, Object> revenueTime(LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, Long productId) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        return report("Doanh thu theo thoi gian", "Doanh thu theo ngay trong khoang loc", "Doanh thu",
                List.of(col("period", "Ngay"), col("orders", "Don hang"), col("revenue", "Doanh thu")),
                queryForList("""
                        select cast(so.order_date as varchar) period, count(distinct so.id) orders, coalesce(sum(so.total_amount),0) revenue
                        from sales_orders so
                        where so.status <> 'CANCELLED' and so.order_date between ? and ?
                          and (? is null or so.branch_id = ?)
                          and (? is null or so.employee_id = ?)
                          and (? is null or exists (select 1 from sales_order_items soi where soi.order_id = so.id and soi.product_id = ?))
                        group by so.order_date
                        order by so.order_date
                        """, fromDate, toDate, scopedBranchId, scopedBranchId, employeeId, employeeId, productId, productId));
    }

    public Map<String, Object> revenueBranch(LocalDate fromDate, LocalDate toDate, Long branchId) {
        return revenueBranch(fromDate, toDate, branchId, 0, 100);
    }

    public Map<String, Object> revenueBranch(LocalDate fromDate, LocalDate toDate, Long branchId, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        long totalItems = number("select count(*) from branches b where (? is null or b.id = ?)", scopedBranchId, scopedBranchId).longValue();
        return report("Doanh thu theo chi nhanh", "So sanh doanh thu giua cac chi nhanh", "Doanh thu",
                List.of(col("branch", "Chi nhanh"), col("orders", "Don hang"), col("revenue", "Doanh thu")),
                queryForList("""
                        select b.name branch, count(distinct so.id) orders, coalesce(sum(so.total_amount),0) revenue
                        from branches b
                        left join sales_orders so on so.branch_id = b.id and so.status <> 'CANCELLED' and so.order_date between ? and ?
                        where (? is null or b.id = ?)
                        group by b.id, b.name
                        order by coalesce(sum(so.total_amount),0) desc
                        limit ? offset ?
                        """, fromDate, toDate, scopedBranchId, scopedBranchId, pageSize, page * pageSize),
                page, pageSize, totalItems);
    }

    public Map<String, Object> revenueEmployee(LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, Long productId) {
        return revenueEmployee(fromDate, toDate, branchId, employeeId, productId, null, 0, 100);
    }

    public Map<String, Object> revenueEmployee(LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, Long productId, int page, int pageSize) {
        return revenueEmployee(fromDate, toDate, branchId, employeeId, productId, null, page, pageSize);
    }

    public Map<String, Object> revenueEmployee(LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, Long productId, String productCategory, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        long totalItems = number("""
                select count(*) from (
                  select au.full_name
                  from app_users au
                  join sales_orders so on so.employee_id = au.id and so.status <> 'CANCELLED' and so.order_date between ? and ?
                  join sales_order_items soi on soi.order_id = so.id
                  join products p on p.id = soi.product_id
                  where (? is null or au.id = ?)
                    and (? is null or so.branch_id = ?)
                    and (? is null or p.id = ?)
                    and (? is null or p.category = ?)
                  group by au.id, au.full_name
                ) t
                """, fromDate, toDate, employeeId, employeeId, scopedBranchId, scopedBranchId, productId, productId, productCategory, productCategory).longValue();
        return report("Doanh thu theo nhan vien", "Doanh thu theo nguoi tao don", "Doanh thu",
                List.of(col("employee", "Nhan vien"), col("orders", "Don hang"), col("revenue", "Doanh thu")),
                queryForList("""
                        select au.full_name employee, count(distinct so.id) orders, coalesce(sum(soi.line_total),0) revenue
                        from app_users au
                        join sales_orders so on so.employee_id = au.id and so.status <> 'CANCELLED' and so.order_date between ? and ?
                        join sales_order_items soi on soi.order_id = so.id
                        join products p on p.id = soi.product_id
                        where (? is null or au.id = ?)
                          and (? is null or so.branch_id = ?)
                          and (? is null or p.id = ?)
                          and (? is null or p.category = ?)
                        group by au.id, au.full_name
                        order by coalesce(sum(soi.line_total),0) desc
                        limit ? offset ?
                        """, fromDate, toDate, employeeId, employeeId, scopedBranchId, scopedBranchId, productId, productId, productCategory, productCategory, pageSize, page * pageSize),
                page, pageSize, totalItems);
    }

    public Map<String, Object> topProducts(LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, Long productId) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        return report("San pham ban chay", "Xep hang san pham theo so luong ban", "So luong ban",
                List.of(col("product", "San pham"), col("sku", "SKU"), col("quantity", "Da ban"), col("revenue", "Doanh thu")),
                queryForList("""
                        select p.product_name product, p.product_code sku, coalesce(sum(soi.quantity),0) quantity, coalesce(sum(soi.line_total),0) revenue
                        from products p
                        join sales_order_items soi on soi.product_id = p.id
                        join sales_orders so on so.id = soi.order_id and so.status <> 'CANCELLED' and so.order_date between ? and ?
                        where (? is null or p.id = ?)
                          and (? is null or so.branch_id = ?)
                          and (? is null or so.employee_id = ?)
                        group by p.product_name, p.product_code
                        order by coalesce(sum(soi.quantity),0) desc
                        limit 20
                        """, fromDate, toDate, productId, productId, scopedBranchId, scopedBranchId, employeeId, employeeId));
    }

    public Map<String, Object> inventory(Long branchId, Long productId) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        return report("Ton kho", "So luong ton theo chi nhanh va san pham", "So luong ton",
                List.of(col("product", "San pham"), col("branch", "Chi nhanh"), col("stock", "Ton"), col("minimum", "Toi thieu")),
                queryForList("""
                        select p.product_name product, b.name branch, s.quantity_on_hand stock, s.min_quantity minimum
                        from inventory_stocks s
                        join products p on p.id = s.product_id
                        join branches b on b.id = s.branch_id
                        where (? is null or s.branch_id = ?) and (? is null or p.id = ?)
                        order by s.quantity_on_hand asc
                        """, scopedBranchId, scopedBranchId, productId, productId));
    }

    public Map<String, Object> debt(Long branchId) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        return report("Cong no", "Tong hop phai thu va phai tra", "So tien",
                List.of(col("name", "Doi tuong"), col("type", "Loai"), col("amount", "So tien")),
                queryForList("""
                        select customer_name name, 'Phai thu' type, coalesce(sum(debit_amount),0) - coalesce(sum(credit_amount),0) amount
                        from receivables r join customers c on c.id = r.customer_id
                        where (? is null or c.branch_id = ?)
                        group by customer_name
                        union all
                        select supplier_name name, 'Phai tra' type, coalesce(sum(credit_amount),0) - coalesce(sum(debit_amount),0) amount
                        from accounting_payables p left join purchase_orders po on po.purchase_order_no = p.source_no
                        where (? is null or po.branch_id = ?)
                        group by supplier_name
                        """, scopedBranchId, scopedBranchId, scopedBranchId, scopedBranchId));
    }

    public Map<String, Object> profit(LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, Long productId) {
        return profit(fromDate, toDate, branchId, employeeId, productId, null);
    }

    public Map<String, Object> profit(LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, Long productId, String productCategory) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        return report("Loi nhuan co ban", "Doanh thu tru gia von ghi nhan", "Doanh thu",
                List.of(col("metric", "Chi tieu"), col("amount", "So tien")),
                queryForList("""
                        select 'Doanh thu' metric, coalesce(sum(soi.line_total),0) amount
                        from sales_order_items soi
                        join sales_orders so on so.id = soi.order_id
                        join products p on p.id = soi.product_id
                        where so.status <> 'CANCELLED' and so.order_date between ? and ?
                          and (? is null or so.branch_id = ?)
                          and (? is null or so.employee_id = ?)
                          and (? is null or soi.product_id = ?)
                          and (? is null or p.category = ?)
                        union all
                        select 'Gia von' metric, coalesce(sum(soi.quantity * p.import_price),0) amount
                        from sales_order_items soi
                        join sales_orders so on so.id = soi.order_id
                        join products p on p.id = soi.product_id
                        where so.status <> 'CANCELLED' and so.order_date between ? and ?
                          and (? is null or so.branch_id = ?)
                          and (? is null or so.employee_id = ?)
                          and (? is null or soi.product_id = ?)
                          and (? is null or p.category = ?)
                        union all
                        select 'Loi nhuan' metric, coalesce(sum(soi.line_total - soi.quantity * p.import_price),0) amount
                        from sales_order_items soi
                        join sales_orders so on so.id = soi.order_id
                        join products p on p.id = soi.product_id
                        where so.status <> 'CANCELLED' and so.order_date between ? and ?
                          and (? is null or so.branch_id = ?)
                          and (? is null or so.employee_id = ?)
                          and (? is null or soi.product_id = ?)
                          and (? is null or p.category = ?)
                        """, fromDate, toDate, scopedBranchId, scopedBranchId, employeeId, employeeId, productId, productId, productCategory, productCategory,
                        fromDate, toDate, scopedBranchId, scopedBranchId, employeeId, employeeId, productId, productId, productCategory, productCategory,
                        fromDate, toDate, scopedBranchId, scopedBranchId, employeeId, employeeId, productId, productId, productCategory, productCategory));
    }

    public Map<String, Object> warrantyRepair(LocalDate fromDate, LocalDate toDate, Long branchId) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        return report("Bao hanh/sua chua", "Thong ke phieu sua chua theo trang thai", "So phieu",
                List.of(col("status", "Trang thai"), col("tickets", "So phieu"), col("cost", "Chi phi")),
                queryForList("""
                        select st.status, count(*) tickets, coalesce(sum(st.total_cost),0) cost
                        from service_tickets st
                        left join product_serials ps on ps.id = st.vehicle_id
                        where st.created_at >= ? and st.created_at < ?
                          and (? is null or ps.branch_id = ?)
                        group by st.status
                        """, java.sql.Date.valueOf(fromDate), java.sql.Date.valueOf(toDate.plusDays(1)), scopedBranchId, scopedBranchId));
    }

    public Map<String, Object> warrantyRepair(LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, String productCategory, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        long totalItems = number("""
                select count(*) from (
                  select st.status
                  from service_tickets st
                  left join product_serials ps on ps.id = st.vehicle_id
                  left join products p on p.id = ps.product_id
                  left join app_users au on au.username = st.technician_username
                  where st.created_at >= ? and st.created_at < ?
                    and (? is null or ps.branch_id = ?)
                    and (? is null or au.id = ?)
                    and (? is null or p.category = ?)
                  group by st.status
                ) t
                """, java.sql.Date.valueOf(fromDate), java.sql.Date.valueOf(toDate.plusDays(1)), scopedBranchId, scopedBranchId, employeeId, employeeId, productCategory, productCategory).longValue();
        return report("Warranty Cost Report", "Chi phi bao hanh/sua chua theo trang thai.", "So phieu",
                List.of(col("status", "Trang thai"), col("tickets", "So phieu"), col("cost", "Chi phi")),
                queryForList("""
                        select st.status status, count(*) tickets, coalesce(sum(st.total_cost),0) cost
                        from service_tickets st
                        left join product_serials ps on ps.id = st.vehicle_id
                        left join products p on p.id = ps.product_id
                        left join app_users au on au.username = st.technician_username
                        where st.created_at >= ? and st.created_at < ?
                          and (? is null or ps.branch_id = ?)
                          and (? is null or au.id = ?)
                          and (? is null or p.category = ?)
                        group by st.status
                        order by coalesce(sum(st.total_cost),0) desc
                        limit ? offset ?
                        """, java.sql.Date.valueOf(fromDate), java.sql.Date.valueOf(toDate.plusDays(1)), scopedBranchId, scopedBranchId, employeeId, employeeId, productCategory, productCategory, pageSize, page * pageSize),
                page, pageSize, totalItems);
    }

    public Map<String, Object> warrantyAnalysis(LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, String productCategory, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        long totalItems = number("""
                select count(*) from (
                  select coalesce(st.component_type, 'UNKNOWN') component
                  from service_tickets st
                  left join product_serials ps on ps.id = st.vehicle_id
                  left join products p on p.id = ps.product_id
                  left join app_users au on au.username = st.technician_username
                  where st.created_at >= ? and st.created_at < ?
                    and (? is null or st.branch_id = ? or ps.branch_id = ?)
                    and (? is null or au.id = ?)
                    and (? is null or p.category = ?)
                  group by coalesce(st.component_type, 'UNKNOWN')
                ) t
                """, java.sql.Date.valueOf(fromDate), java.sql.Date.valueOf(toDate.plusDays(1)), scopedBranchId, scopedBranchId, scopedBranchId, employeeId, employeeId, productCategory, productCategory).longValue();
        return report("Warranty Analysis", "Mau xe, bo phan va nha cung cap loi nhieu nhat.", "So phieu",
                List.of(col("component", "Bo phan"), col("tickets", "So phieu"), col("warrantyCost", "Chi phi BH"), col("avgHandlingDays", "Ngay xu ly TB"), col("repeatRate", "Ty le sua lai")),
                queryForList("""
                        select coalesce(st.component_type, 'UNKNOWN') component,
                               count(*) tickets,
                               coalesce(sum(coalesce(st.total_cost, 0)),0) warrantyCost,
                               0 avgHandlingDays,
                               0 repeatRate
                        from service_tickets st
                        left join product_serials ps on ps.id = st.vehicle_id
                        left join products p on p.id = ps.product_id
                        left join app_users au on au.username = st.technician_username
                        where st.created_at >= ? and st.created_at < ?
                          and (? is null or st.branch_id = ? or ps.branch_id = ?)
                          and (? is null or au.id = ?)
                          and (? is null or p.category = ?)
                        group by coalesce(st.component_type, 'UNKNOWN')
                        order by tickets desc
                        limit ? offset ?
                        """, java.sql.Date.valueOf(fromDate), java.sql.Date.valueOf(toDate.plusDays(1)), scopedBranchId, scopedBranchId, scopedBranchId, employeeId, employeeId, productCategory, productCategory, pageSize, page * pageSize),
                page, pageSize, totalItems);
    }

    public Map<String, Object> executiveOperation(LocalDate fromDate, LocalDate toDate, Long branchId, Long employeeId, Long productId, String productCategory, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        long totalItems = number("select count(*) from branches b where (? is null or b.id = ?)", scopedBranchId, scopedBranchId).longValue();
        return report("Executive Operation", "Lai lo chi nhanh, dong tien, canh bao va du bao nhap hang.", "Doanh thu",
                List.of(col("branch", "Chi nhanh"), col("revenue", "Doanh thu"), col("costOfGoodsSold", "Gia von"), col("grossProfit", "Loi nhuan gop"), col("cashIn", "Tien vao"), col("cashOut", "Tien ra"), col("lowStockItems", "Canh bao ton")),
                queryForList("""
                        select b.name branch,
                               coalesce(sum(distinct so.total_amount),0) revenue,
                               coalesce(sum(soi.quantity * p.import_price),0) costOfGoodsSold,
                               coalesce(sum(soi.line_total - soi.quantity * p.import_price),0) grossProfit,
                               coalesce((select sum(cb.amount_in) from cash_books cb where cb.transaction_date >= ? and cb.transaction_date <= ? and exists (select 1 from sales_orders so2 where so2.order_no = cb.source_no and so2.branch_id = b.id)),0) cashIn,
                               coalesce((select sum(cb.amount_out) from cash_books cb where cb.transaction_date >= ? and cb.transaction_date <= ? and exists (select 1 from purchase_orders po where po.purchase_order_no = cb.source_no and po.branch_id = b.id)),0) cashOut,
                               coalesce((select count(*) from inventory_stocks s where s.branch_id = b.id and s.quantity_on_hand <= s.min_quantity),0) lowStockItems
                        from branches b
                        left join sales_orders so on so.branch_id = b.id and so.status <> 'CANCELLED' and so.order_date >= ? and so.order_date <= ?
                        left join sales_order_items soi on soi.order_id = so.id
                        left join products p on p.id = soi.product_id
                        where (? is null or b.id = ?)
                          and (? is null or so.employee_id = ?)
                          and (? is null or p.id = ?)
                          and (? is null or p.category = ?)
                        group by b.id, b.name
                        order by revenue desc
                        limit ? offset ?
                        """, fromDate, toDate, fromDate, toDate, fromDate, toDate, scopedBranchId, scopedBranchId, employeeId, employeeId, productId, productId, productCategory, productCategory, pageSize, page * pageSize),
                page, pageSize, totalItems);
    }

    private Map<String, Object> report(String title, String description, String chartLabel, List<Map<String, String>> columns, List<Map<String, Object>> rows) {
        List<Map<String, Object>> normalizedRows = rows.stream().map(this::normalizeKeys).toList();
        return Map.of(
                "title", title,
                "description", description,
                "chartLabel", chartLabel,
                "summary", List.of(Map.of("key", "rows", "label", "So dong", "value", String.valueOf(normalizedRows.size()), "helper", "Du lieu tu database", "tone", "blue")),
                "chart", normalizedRows.stream().limit(12).map(row -> Map.of("label", String.valueOf(row.values().iterator().next()), "primaryValue", firstNumber(row))).toList(),
                "tableColumns", columns,
                "tableRows", normalizedRows,
                "updatedAt", java.time.OffsetDateTime.now().toString()
        );
    }

    private Map<String, Object> report(String title, String description, String chartLabel, List<Map<String, String>> columns, List<Map<String, Object>> rows, int page, int pageSize, long totalItems) {
        return report(title, description, chartLabel, columns, rows, page, pageSize, totalItems, List.of());
    }

    private Map<String, Object> report(String title, String description, String chartLabel, List<Map<String, String>> columns, List<Map<String, Object>> rows, int page, int pageSize, long totalItems, List<Map<String, Object>> extraSummary) {
        List<Map<String, Object>> normalizedRows = rows.stream().map(this::normalizeKeys).toList();
        long totalPages = pageSize <= 0 ? 0 : (long) Math.ceil((double) totalItems / pageSize);
        List<Map<String, Object>> summary = new java.util.ArrayList<>();
        summary.add(Map.of("key", "rows", "label", "So dong hien thi", "value", String.valueOf(normalizedRows.size()), "helper", "Du lieu tren trang hien tai", "tone", "blue"));
        summary.add(Map.of("key", "totalItems", "label", "Tong dong", "value", String.valueOf(totalItems), "helper", "Tong ban ghi theo bo loc", "tone", "slate"));
        summary.addAll(extraSummary);
        return Map.of(
                "title", title,
                "description", description,
                "chartLabel", chartLabel,
                "summary", summary,
                "chart", normalizedRows.stream().limit(12).map(row -> Map.of("label", String.valueOf(row.values().iterator().next()), "primaryValue", firstNumber(row))).toList(),
                "tableColumns", columns,
                "tableRows", normalizedRows,
                "pagination", Map.of("page", page, "pageSize", pageSize, "totalItems", totalItems, "totalPages", totalPages),
                "performance", performanceMeta(totalItems, totalPages),
                "updatedAt", OffsetDateTime.now().toString()
        );
    }

    private Map<String, Object> normalizeKeys(Map<String, Object> row) {
        return row.entrySet().stream()
                .collect(java.util.stream.Collectors.toMap(entry -> entry.getKey().toLowerCase(), Map.Entry::getValue, (left, right) -> left, java.util.LinkedHashMap::new));
    }

    private Map<String, Object> summary(String key, String label, String value, String helper, String tone) {
        return Map.of("key", key, "label", label, "value", value, "helper", helper, "tone", tone);
    }

    private Map<String, String> col(String key, String label) {
        return Map.of("key", key.toLowerCase(Locale.ROOT), "label", label);
    }

    private Number firstNumber(Map<String, Object> row) {
        for (String key : List.of("revenue", "amount", "stockvalue", "value", "total", "cashin", "grossprofit", "cost", "customers", "quantity")) {
            Object value = row.get(key);
            if (value instanceof Number number) {
                return number;
            }
        }
        return row.values().stream().filter(Number.class::isInstance).map(Number.class::cast).findFirst().orElse(0);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> maskSensitive(Map<String, Object> report) {
        boolean canViewCost = hasAuthority("VIEW_COST_PRICE");
        boolean canViewProfit = hasAuthority("VIEW_PROFIT");
        List<Map<String, String>> columns = ((List<Map<String, String>>) report.getOrDefault("tableColumns", List.of())).stream()
                .filter(column -> !isCostKey(column.get("key")) || canViewCost)
                .filter(column -> !isProfitKey(column.get("key")) || canViewProfit)
                .toList();
        List<Map<String, Object>> rows = ((List<Map<String, Object>>) report.getOrDefault("tableRows", List.of())).stream()
                .map(row -> {
                    Map<String, Object> masked = row.entrySet().stream()
                            .filter(entry -> !isCostKey(entry.getKey()) || canViewCost)
                            .filter(entry -> !isProfitKey(entry.getKey()) || canViewProfit)
                            .collect(java.util.stream.Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (left, right) -> left, LinkedHashMap::new));
                    return masked;
                })
                .toList();
        List<Map<String, Object>> chart = canViewProfit
                ? (List<Map<String, Object>>) report.getOrDefault("chart", List.of())
                : ((List<Map<String, Object>>) report.getOrDefault("chart", List.of())).stream()
                        .map(point -> {
                            Map<String, Object> masked = point.entrySet().stream()
                                    .filter(entry -> !"secondaryValue".equals(entry.getKey()))
                                    .collect(java.util.stream.Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (left, right) -> left, LinkedHashMap::new));
                            return masked;
                        })
                        .toList();
        Map<String, Object> copy = new LinkedHashMap<>(report);
        copy.put("tableColumns", columns);
        copy.put("tableRows", rows);
        copy.put("chart", chart);
        if (!canViewProfit) {
            copy.remove("secondaryChartLabel");
        }
        return copy;
    }

    private boolean isCostKey(String key) {
        String normalized = key == null ? "" : key.toLowerCase(Locale.ROOT);
        return normalized.contains("cost") || normalized.contains("cogs") || normalized.contains("unitcost") || normalized.contains("stockvalue");
    }

    private boolean isProfitKey(String key) {
        String normalized = key == null ? "" : key.toLowerCase(Locale.ROOT);
        return normalized.contains("profit") || normalized.contains("margin");
    }

    private boolean hasAuthority(String authority) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream().anyMatch(item -> authority.equals(item.getAuthority()));
    }

    private Object valueOf(Map<String, Object> row, String key) {
        if (row.containsKey(key)) {
            return row.get(key);
        }
        String lower = key.toLowerCase(Locale.ROOT);
        return row.entrySet().stream()
                .filter(entry -> entry.getKey().toLowerCase(Locale.ROOT).equals(lower))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse(null);
    }

    private LocalDate asLocalDate(Object value) {
        if (value instanceof LocalDate localDate) {
            return localDate;
        }
        if (value instanceof java.sql.Date date) {
            return date.toLocalDate();
        }
        if (value instanceof java.sql.Timestamp timestamp) {
            return timestamp.toLocalDateTime().toLocalDate();
        }
        if (value instanceof java.time.LocalDateTime dateTime) {
            return dateTime.toLocalDate();
        }
        if (value instanceof OffsetDateTime offsetDateTime) {
            return offsetDateTime.toLocalDate();
        }
        return null;
    }

    private Number number(String sql, Object... args) {
        long start = System.currentTimeMillis();
        Number value = jdbcTemplate.queryForObject(sql, Number.class, args);
        logSlowQuery(sql, start);
        return value == null ? 0 : value;
    }

    private List<Map<String, Object>> queryForList(String sql, Object... args) {
        long start = System.currentTimeMillis();
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, args);
        logSlowQuery(sql, start);
        return rows;
    }

    private void logSlowQuery(String sql, long start) {
        long elapsedMs = System.currentTimeMillis() - start;
        if (elapsedMs >= SLOW_REPORT_QUERY_MS) {
            log.warn("Slow report query: {} ms, sql={}", elapsedMs, compactSql(sql));
        }
    }

    private String compactSql(String sql) {
        return sql == null ? "" : sql.replaceAll("\\s+", " ").trim();
    }

    private void validateDateRange(LocalDate fromDate, LocalDate toDate, int maxDays) {
        if (fromDate == null || toDate == null) {
            return;
        }
        if (toDate.isBefore(fromDate)) {
            throw new IllegalArgumentException("toDate must be on or after fromDate");
        }
        long days = ChronoUnit.DAYS.between(fromDate, toDate) + 1;
        if (days > maxDays) {
            throw new IllegalArgumentException("Report date range is too large. Please limit to " + maxDays + " days or use async export.");
        }
    }

    private Map<String, Object> performanceMeta(long totalItems, long totalPages) {
        boolean largeResult = totalItems > LARGE_RESULT_THRESHOLD;
        return Map.of(
                "largeResult", largeResult,
                "asyncExportRecommended", largeResult,
                "message", largeResult
                        ? "Du lieu qua lon, vui long thu hep bo loc ngay hoac dung export async."
                        : "",
                "totalPages", totalPages
        );
    }

    private String normalizeType(String type) {
        return type == null ? "" : type.trim().replace('-', '_').toUpperCase(Locale.ROOT);
    }

    public record ExportFile(String fileName, String contentType, byte[] content) {
    }
}


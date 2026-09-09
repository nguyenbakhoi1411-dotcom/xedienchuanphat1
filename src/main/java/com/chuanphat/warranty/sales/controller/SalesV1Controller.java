package com.chuanphat.warranty.sales.controller;

import com.chuanphat.warranty.sales.service.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController("salesV1MainController")
@RequestMapping("/api/v1/sales")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'CHIEF_ACCOUNTANT', 'SALES_STAFF')")
public class SalesV1Controller {

    private final QuotationService quotationService;
    private final SalesOrderService salesOrderService;
    private final TaxInvoiceService taxInvoiceService;
    private final SalesVoucherService salesVoucherService;
    private final SalesReturnService salesReturnService;
    private final SalesDiscountService salesDiscountService;
    private final ARService arService;
    private final SalesDashboardService dashboardService;
    private final PdfInvoiceService pdfInvoiceService;
    private final MisaExportService misaExportService;

    public SalesV1Controller(
        QuotationService quotationService,
        SalesOrderService salesOrderService,
        TaxInvoiceService taxInvoiceService,
        SalesVoucherService salesVoucherService,
        SalesReturnService salesReturnService,
        SalesDiscountService salesDiscountService,
        ARService arService,
        SalesDashboardService dashboardService,
        PdfInvoiceService pdfInvoiceService,
        MisaExportService misaExportService
    ) {
        this.quotationService = quotationService;
        this.salesOrderService = salesOrderService;
        this.taxInvoiceService = taxInvoiceService;
        this.salesVoucherService = salesVoucherService;
        this.salesReturnService = salesReturnService;
        this.salesDiscountService = salesDiscountService;
        this.arService = arService;
        this.dashboardService = dashboardService;
        this.pdfInvoiceService = pdfInvoiceService;
        this.misaExportService = misaExportService;
    }

    private Pageable createPageRequest(Integer page, Integer size) {
        return PageRequest.of(page != null ? page : 0, size != null ? size : 20);
    }

    // DASHBOARD
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(@RequestParam(required = false) Long branchId) {
        try {
            return ResponseEntity.ok(dashboardService.getDashboard(branchId != null ? branchId : 1L));
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>(); err.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }

    @GetMapping("/dashboard/inventory-valuation")
    public ResponseEntity<Map<String, Object>> getInventoryValuation(@RequestParam(required = false, defaultValue = "1") Long branchId) {
        try {
            return ResponseEntity.ok(dashboardService.getInventoryValuation(branchId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // MISA EXPORT
    @GetMapping("/misa-export")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CHIEF_ACCOUNTANT')")
    public ResponseEntity<byte[]> exportMisa(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate fromDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate toDate) {
        try {
            byte[] fileData = misaExportService.exportToMisaFormat(fromDate, toDate);
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.add(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=misa_export.csv");
            headers.add(org.springframework.http.HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8");
            
            return new ResponseEntity<>(fileData, headers, org.springframework.http.HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // BAO GIA
    @GetMapping("/quotations")
    public ResponseEntity<?> listQuotations(
        @RequestParam(required = false) Integer page, @RequestParam(required = false) Integer size,
        @RequestParam(required = false) String status, @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        @RequestParam(required = false) String keyword, @RequestParam(required = false, defaultValue = "1") Long branchId
    ) {
        try { return ResponseEntity.ok(quotationService.listQuotations(branchId, status, fromDate, toDate, keyword, createPageRequest(page, size))); }
        catch (Exception e) { return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/quotations")
    public ResponseEntity<?> createQuotation(@RequestBody Map<String, Object> req, @RequestParam(required = false, defaultValue = "1") Long branchId) {
        try { return ResponseEntity.ok(quotationService.createQuotation(req, "system", branchId)); }
        catch (Exception e) { return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/quotations/{id}")
    public ResponseEntity<?> getQuotation(@PathVariable Long id) {
        try { return ResponseEntity.ok(quotationService.getById(id)); }
        catch (Exception e) { return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage())); }
    }

    // DON DAT HANG
    @GetMapping("/orders")
    public ResponseEntity<?> listOrders(
        @RequestParam(required = false) Integer page, @RequestParam(required = false) Integer size,
        @RequestParam(required = false) String status, @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        @RequestParam(required = false) String keyword, @RequestParam(required = false, defaultValue = "1") Long branchId
    ) {
        try { return ResponseEntity.ok(salesOrderService.listOrders(branchId, keyword, status, fromDate, toDate, createPageRequest(page, size))); }
        catch (Exception e) { return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/orders/{id}/pdf")
    public ResponseEntity<byte[]> exportOrderPdf(@PathVariable Long id) {
        try {
            com.chuanphat.warranty.core.entity.SalesOrder order = salesOrderService.getById(id);
            byte[] pdfBytes = pdfInvoiceService.generateSalesOrderPdf(order);
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "invoice_" + order.getOrderNo() + ".pdf");
            return new ResponseEntity<>(pdfBytes, headers, org.springframework.http.HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrder(@PathVariable Long id) {
        try { return ResponseEntity.ok(salesOrderService.getById(id)); }
        catch (Exception e) { return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/orders/{id}/confirm")
    public ResponseEntity<?> confirmOrder(@PathVariable Long id) {
        try { return ResponseEntity.ok(salesOrderService.confirmOrder(id, "system")); }
        catch (Exception e) { return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/orders/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id, @RequestBody Map<String, String> req) {
        try { return ResponseEntity.ok(salesOrderService.cancelOrder(id, req.get("reason"))); }
        catch (Exception e) { return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage())); }
    }

    // CHUNG TU BAN HANG
    @GetMapping("/vouchers")
    public ResponseEntity<?> listVouchers(
        @RequestParam(required = false) Integer page, @RequestParam(required = false) Integer size,
        @RequestParam(required = false) String keyword, @RequestParam(required = false, defaultValue = "1") Long branchId
    ) {
        try { return ResponseEntity.ok(salesVoucherService.listVouchers(branchId, keyword, createPageRequest(page, size))); }
        catch (Exception e) { return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/vouchers/{id}")
    public ResponseEntity<?> getVoucher(@PathVariable Long id) {
        try { return ResponseEntity.ok(salesVoucherService.getById(id)); }
        catch (Exception e) { return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage())); }
    }

    // HOA DON
    @GetMapping("/invoices")
    public ResponseEntity<?> listInvoices(
        @RequestParam(required = false) Integer page, @RequestParam(required = false) Integer size,
        @RequestParam(required = false) String status, @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        @RequestParam(required = false, defaultValue = "1") Long branchId
    ) {
        try { return ResponseEntity.ok(taxInvoiceService.listInvoices(branchId, status, fromDate, toDate, createPageRequest(page, size))); }
        catch (Exception e) { return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/invoices/{id}")
    public ResponseEntity<?> getInvoice(@PathVariable Long id) {
        try { return ResponseEntity.ok(taxInvoiceService.getById(id)); }
        catch (Exception e) { return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/invoices/from-order/{orderId}")
    public ResponseEntity<?> createInvoiceFromOrder(@PathVariable Long orderId, @RequestParam(required = false, defaultValue = "1") Long branchId) {
        try { return ResponseEntity.ok(taxInvoiceService.createFromOrder(orderId, branchId, "system")); }
        catch (Exception e) { return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/invoices/{id}/issue")
    public ResponseEntity<?> issueInvoice(@PathVariable Long id) {
        try { return ResponseEntity.ok(taxInvoiceService.issueInvoice(id)); }
        catch (Exception e) { return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/invoices/{id}/cancel")
    public ResponseEntity<?> cancelInvoice(@PathVariable Long id, @RequestBody Map<String, String> req) {
        try { return ResponseEntity.ok(taxInvoiceService.cancelInvoice(id, req.get("reason"))); }
        catch (Exception e) { return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage())); }
    }

    // TRA HANG
    @GetMapping("/returns")
    public ResponseEntity<?> listReturns(
        @RequestParam(required = false) Integer page, @RequestParam(required = false) Integer size,
        @RequestParam(required = false, defaultValue = "1") Long branchId
    ) {
        try { return ResponseEntity.ok(salesReturnService.listReturns(branchId, createPageRequest(page, size))); }
        catch (Exception e) { return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage())); }
    }
    
    @PostMapping("/returns")
    @com.chuanphat.warranty.audit.annotation.Audited(action = com.chuanphat.warranty.audit.enums.AuditAction.CREATE, module = com.chuanphat.warranty.audit.enums.AuditModule.SALES, entityType = "SalesReturn")
    public ResponseEntity<?> createReturn(@RequestBody Map<String, Object> payload, org.springframework.security.core.Authentication auth) {
        try {
            String user = auth != null ? auth.getName() : "system";
            return ResponseEntity.ok(salesReturnService.createReturn(payload, user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // GIAM GIA
    @GetMapping("/discounts")
    public ResponseEntity<?> listDiscounts(
        @RequestParam(required = false) Integer page, @RequestParam(required = false) Integer size,
        @RequestParam(required = false, defaultValue = "1") Long branchId
    ) {
        try { return ResponseEntity.ok(salesDiscountService.listDiscounts(branchId, createPageRequest(page, size))); }
        catch (Exception e) { return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage())); }
    }

    // CONG NO
    @GetMapping("/ar-balances")
    public ResponseEntity<?> getARBalances(@RequestParam(required = false, defaultValue = "1") Long branchId) {
        try { return ResponseEntity.ok(arService.getSummary(branchId)); }
        catch (Exception e) { return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage())); }
    }
}


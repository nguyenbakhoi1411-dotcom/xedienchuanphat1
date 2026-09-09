package com.chuanphat.warranty.sales.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * SalesModuleController - Aggregate controller for the Sales module.
 * Provides an overview and listing endpoints for all sales sub-resources.
 * Individual sub-resource controllers handle full CRUD at their own paths.
 *
 * Bean name: salesModuleAggregateController (unique to avoid conflicts with
 * existing controllers such as salesSalesDashboardController,
 * salesSalesOrderController, etc.)
 */
@RestController("salesModuleAggregateController")
@RequestMapping("/api/sales/module")
@PreAuthorize("hasAnyRole('ADMIN', 'CHIEF_ACCOUNTANT', 'SALES_STAFF')")
public class SalesModuleController {

    // -----------------------------------------------------------------
    // Dashboard
    // -----------------------------------------------------------------

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("module", "sales");
        dashboard.put("status", "active");
        return ResponseEntity.ok(dashboard);
    }

    // -----------------------------------------------------------------
    // Quotations  GET /api/sales/module/quotations
    // -----------------------------------------------------------------

    @GetMapping("/quotations")
    public ResponseEntity<Page<Object>> getQuotations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long branchId) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new PageImpl<>(Collections.emptyList(), pageable, 0));
    }

    @GetMapping("/quotations/{id}")
    public ResponseEntity<Object> getQuotationById(@PathVariable Long id) {
        return ResponseEntity.ok(Collections.singletonMap("id", id));
    }

    // -----------------------------------------------------------------
    // Orders  GET /api/sales/module/orders
    // -----------------------------------------------------------------

    @GetMapping("/orders")
    public ResponseEntity<Page<Object>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long branchId) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new PageImpl<>(Collections.emptyList(), pageable, 0));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<Object> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(Collections.singletonMap("id", id));
    }

    // -----------------------------------------------------------------
    // Contracts  GET /api/sales/module/contracts
    // -----------------------------------------------------------------

    @GetMapping("/contracts")
    public ResponseEntity<Page<Object>> getContracts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long branchId) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new PageImpl<>(Collections.emptyList(), pageable, 0));
    }

    // -----------------------------------------------------------------
    // Vouchers  GET /api/sales/module/vouchers
    // -----------------------------------------------------------------

    @GetMapping("/vouchers")
    public ResponseEntity<Page<Object>> getVouchers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long branchId) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new PageImpl<>(Collections.emptyList(), pageable, 0));
    }

    // -----------------------------------------------------------------
    // Tax Invoices  GET /api/sales/module/invoices
    // -----------------------------------------------------------------

    @GetMapping("/invoices")
    public ResponseEntity<Page<Object>> getInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long branchId) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new PageImpl<>(Collections.emptyList(), pageable, 0));
    }

    // -----------------------------------------------------------------
    // Returns  GET /api/sales/module/returns
    // -----------------------------------------------------------------

    @GetMapping("/returns")
    public ResponseEntity<Page<Object>> getReturns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long branchId) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new PageImpl<>(Collections.emptyList(), pageable, 0));
    }

    // -----------------------------------------------------------------
    // Discounts  GET /api/sales/module/discounts
    // -----------------------------------------------------------------

    @GetMapping("/discounts")
    public ResponseEntity<Page<Object>> getDiscounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long branchId) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new PageImpl<>(Collections.emptyList(), pageable, 0));
    }

    // -----------------------------------------------------------------
    // Receivables (AR Balances)  GET /api/sales/module/receivables
    // -----------------------------------------------------------------

    @GetMapping("/receivables")
    public ResponseEntity<Page<Object>> getReceivables(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long branchId) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new PageImpl<>(Collections.emptyList(), pageable, 0));
    }

    // -----------------------------------------------------------------
    // Customers  GET /api/sales/module/customers
    // -----------------------------------------------------------------

    @GetMapping("/customers")
    public ResponseEntity<Page<Object>> getCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long branchId) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new PageImpl<>(Collections.emptyList(), pageable, 0));
    }

    // -----------------------------------------------------------------
    // Products  GET /api/sales/module/products
    // -----------------------------------------------------------------

    @GetMapping("/products")
    public ResponseEntity<Page<Object>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new PageImpl<>(Collections.emptyList(), pageable, 0));
    }
}


package com.chuanphat.warranty.procurement.controller;

import com.chuanphat.warranty.core.entity.*;
import com.chuanphat.warranty.core.repository.*;
import org.springframework.data.domain.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * PurchasingV2Controller — đầy đủ endpoints cho module Mua Hàng MISA AMIS.
 * Path: /api/purchasing/*
 */
@RestController("purchasingV2Controller")
@RequestMapping("/api/purchasing")
@CrossOrigin
@PreAuthorize("hasAnyRole('ADMIN')")
public class PurchasingV2Controller {

    private final PurchaseOrderRepository orderRepo;
    private final PurchaseReceiptRepository receiptRepo;
    private final PurchaseReturnRepository returnRepo;
    private final PurchaseRequestRepository requestRepo;
    private final PayableRepository payableRepo;
    private final SupplierRepository supplierRepo;

    public PurchasingV2Controller(
            PurchaseOrderRepository orderRepo,
            PurchaseReceiptRepository receiptRepo,
            PurchaseReturnRepository returnRepo,
            PurchaseRequestRepository requestRepo,
            PayableRepository payableRepo,
            SupplierRepository supplierRepo) {
        this.orderRepo = orderRepo;
        this.receiptRepo = receiptRepo;
        this.returnRepo = returnRepo;
        this.requestRepo = requestRepo;
        this.payableRepo = payableRepo;
        this.supplierRepo = supplierRepo;
    }

    // ═══════════════════════════════════════════════════════
    // DASHBOARD
    // ═══════════════════════════════════════════════════════

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestParam(required = false) Long branchId) {

        long totalOrders = orderRepo.count();
        long totalReceipts = receiptRepo.count();

        BigDecimal totalPayable = payableRepo.findAll().stream()
                .map(p -> p.getRemainingAmount() != null ? p.getRemainingAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalOrders", totalOrders);
        result.put("pendingOrders", 0);
        result.put("totalReceipts", totalReceipts);
        result.put("pendingReceipts", 0);
        result.put("totalPayable", totalPayable);
        result.put("overduePayable", BigDecimal.ZERO);
        result.put("todayPurchase", BigDecimal.ZERO);
        result.put("monthPurchase", BigDecimal.ZERO);
        return ResponseEntity.ok(result);
    }

    // ═══════════════════════════════════════════════════════
    // PURCHASE ORDERS — ĐƠN MUA HÀNG
    // ═══════════════════════════════════════════════════════

    @GetMapping("/orders")
    public ResponseEntity<Map<String, Object>> listOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PurchaseOrder> ordersPage = orderRepo.findAll(pageable);

        List<Map<String, Object>> items = ordersPage.getContent().stream()
                .filter(o -> branchId == null || Objects.equals(o.getBranchId(), branchId))
                .filter(o -> status == null || status.isBlank() || o.getStatus().name().equals(status))
                .filter(o -> keyword == null || keyword.isBlank()
                        || o.getPurchaseOrderNo().toLowerCase().contains(keyword.toLowerCase())
                        || (o.getSupplier() != null && o.getSupplier().getName().toLowerCase().contains(keyword.toLowerCase())))
                .filter(o -> fromDate == null || !o.getPurchaseDate().isBefore(fromDate))
                .filter(o -> toDate == null || !o.getPurchaseDate().isAfter(toDate))
                .map(o -> mapOrder(o, false))
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("items", items);
        result.put("page", page);
        result.put("pageSize", size);
        result.put("totalItems", ordersPage.getTotalElements());
        result.put("totalPages", ordersPage.getTotalPages());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<Map<String, Object>> getOrder(@PathVariable Long id) {
        return orderRepo.findById(id)
                .map(o -> ResponseEntity.ok(mapOrder(o, true)))
                .orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> mapOrder(PurchaseOrder o, boolean includeItems) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", o.getId());
        m.put("purchaseOrderNo", o.getPurchaseOrderNo());
        m.put("purchaseDate", o.getPurchaseDate());
        m.put("supplierCode", o.getSupplier() != null ? o.getSupplier().getCode() : null);
        m.put("supplierName", o.getSupplier() != null ? o.getSupplier().getName() : null);
        m.put("supplierAddress", o.getSupplier() != null ? o.getSupplier().getAddress() : null);
        m.put("taxCode", o.getSupplier() != null ? o.getSupplier().getTaxCode() : null);
        m.put("totalAmount", o.getTotalAmount());
        m.put("subtotal", o.getTongTienHang());
        m.put("vatAmount", o.getTongThueGtgt());
        m.put("discountAmount", o.getTongChietKhau());
        m.put("status", o.getStatus().name());
        m.put("receiptStatus", o.isStockReceived() ? "RECEIVED" : "NOT_RECEIVED");
        m.put("invoiceStatus", "NOT_INVOICED");
        m.put("paymentStatus", o.getTrangThaiThanhToan());
        m.put("expectedDelivery", o.getExpectedDelivery());
        m.put("createdBy", o.getCreatedBy());
        m.put("branchId", o.getBranchId());
        m.put("note", o.getNote());

        if (includeItems) {
            List<Map<String, Object>> items = o.getItems().stream().map(it -> {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", it.getId());
                item.put("productId", it.getProduct() != null ? it.getProduct().getId() : null);
                item.put("productCode", it.getProduct() != null ? it.getProduct().getProductCode() : "");
                item.put("productName", it.getTenSanPham() != null ? it.getTenSanPham()
                        : (it.getProduct() != null ? it.getProduct().getProductName() : ""));
                item.put("unitOfMeasure", it.getDonViTinh() != null ? it.getDonViTinh()
                        : (it.getProduct() != null ? it.getProduct().getPrimaryUnit() : null));
                item.put("quantity", it.getQuantity());
                item.put("receivedQuantity", it.getSoLuongDaNhan());
                item.put("unitCost", it.getUnitCost());
                item.put("discountRate", it.getChietKhauPhanTram());
                item.put("discountAmount", BigDecimal.ZERO);
                item.put("vatRate", it.getThueGtgtPhanTram());
                item.put("vatAmount", BigDecimal.ZERO);
                item.put("lineTotal", it.getLineTotal());
                item.put("warehouseName", null);
                return item;
            }).collect(Collectors.toList());
            m.put("items", items);
        }
        return m;
    }

    // ═══════════════════════════════════════════════════════
    // PURCHASE RECEIPTS — NHẬN HÀNG
    // ═══════════════════════════════════════════════════════

    @GetMapping("/receipts")
    public ResponseEntity<Map<String, Object>> listReceipts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PurchaseReceipt> receiptsPage = receiptRepo.findAll(pageable);

        List<Map<String, Object>> items = receiptsPage.getContent().stream()
                .filter(r -> branchId == null || Objects.equals(r.getBranchId(), branchId))
                .filter(r -> status == null || status.isBlank() || r.getStatus().name().equals(status))
                .filter(r -> keyword == null || keyword.isBlank()
                        || r.getReceiptNo().toLowerCase().contains(keyword.toLowerCase()))
                .filter(r -> fromDate == null || !r.getReceiptDate().isBefore(fromDate))
                .filter(r -> toDate == null || !r.getReceiptDate().isAfter(toDate))
                .map(r -> mapPurchaseReceipt(r, false))
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("items", items);
        result.put("page", page);
        result.put("pageSize", size);
        result.put("totalItems", receiptsPage.getTotalElements());
        result.put("totalPages", receiptsPage.getTotalPages());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/receipts/{id}")
    public ResponseEntity<Map<String, Object>> getReceipt(@PathVariable Long id) {
        return receiptRepo.findById(id)
                .map(r -> ResponseEntity.ok(mapPurchaseReceipt(r, true)))
                .orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> mapPurchaseReceipt(PurchaseReceipt r, boolean includeItems) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.getId());
        m.put("receiptNo", r.getReceiptNo());
        m.put("receiptDate", r.getReceiptDate());
        m.put("supplierName", r.getSupplier() != null ? r.getSupplier().getName() : null);
        m.put("totalAmount", r.getTotalAmount());
        m.put("status", r.getStatus().name());
        m.put("purchaseOrderId", r.getPurchaseOrderId());
        m.put("purchaseOrderNo", r.getPurchaseOrderId() != null ? "PO-" + r.getPurchaseOrderId() : null);
        m.put("warehouseName", r.getWarehouse() != null ? r.getWarehouse().getWarehouseName() : null);
        m.put("invoiceStatus", "NOT_INVOICED");
        m.put("paymentStatus", "UNPAID");
        m.put("note", r.getNote());
        m.put("createdBy", r.getCreatedBy());

        if (includeItems) {
            List<Map<String, Object>> items = r.getItems().stream().map(it -> {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", it.getId());
                item.put("productCode", it.getProduct() != null ? it.getProduct().getProductCode() : "");
                item.put("productName", it.getProduct() != null ? it.getProduct().getProductName() : "");
                item.put("unitOfMeasure", it.getProduct() != null ? it.getProduct().getPrimaryUnit() : null);
                item.put("quantity", it.getQuantity());
                item.put("unitCost", it.getUnitCost());
                item.put("lineTotal", it.getLineTotal());
                item.put("warehouseName", r.getWarehouse() != null ? r.getWarehouse().getWarehouseName() : null);
                item.put("frameNumber", it.getFrameNumber());
                item.put("engineNumber", it.getEngineNumber());
                item.put("batterySerial", it.getBatterySerial());
                return item;
            }).collect(Collectors.toList());
            m.put("items", items);
        }
        return m;
    }

    // ═══════════════════════════════════════════════════════
    // PURCHASE RETURNS — TRẢ HÀNG NHÀ CUNG CẤP
    // ═══════════════════════════════════════════════════════

    @GetMapping("/returns")
    public ResponseEntity<Map<String, Object>> listReturns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PurchaseReturn> returnsPage = returnRepo.findAll(pageable);

        List<Map<String, Object>> items = returnsPage.getContent().stream()
                .filter(r -> keyword == null || keyword.isBlank()
                        || r.getReturnCode().toLowerCase().contains(keyword.toLowerCase()))
                .map(r -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", r.getId());
                    m.put("returnNo", r.getReturnCode());
                    m.put("returnDate", r.getReturnDate());
                    m.put("supplierId", r.getSupplierId());
                    m.put("supplierName", null);
                    m.put("totalAmount", r.getTotalAmount());
                    m.put("status", r.getStatus());
                    m.put("originalReceiptId", r.getPurchaseOrderId());
                    m.put("reason", r.getReason());
                    m.put("refundMethod", r.getRefundMethod() != null ? r.getRefundMethod() : "BANK_TRANSFER");
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("items", items);
        result.put("page", page);
        result.put("pageSize", size);
        result.put("totalItems", returnsPage.getTotalElements());
        result.put("totalPages", returnsPage.getTotalPages());
        return ResponseEntity.ok(result);
    }

    // ═══════════════════════════════════════════════════════
    // PURCHASE INVOICES — HÓA ĐƠN MUA (stub — dùng receipt làm invoice)
    // ═══════════════════════════════════════════════════════

    @GetMapping("/invoices")
    public ResponseEntity<Map<String, Object>> listInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String status) {

        // Hiện tại dùng PurchaseReceipts đã confirmed làm hóa đơn
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PurchaseReceipt> receiptsPage = receiptRepo.findAll(pageable);

        List<Map<String, Object>> items = receiptsPage.getContent().stream()
                .filter(r -> "CONFIRMED".equals(r.getStatus().name()))
                .map(r -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", r.getId());
                    m.put("invoiceNo", "HD-" + r.getReceiptNo());
                    m.put("invoiceDate", r.getReceiptDate());
                    m.put("supplierName", r.getSupplier() != null ? r.getSupplier().getName() : null);
                    m.put("totalAmount", r.getTotalAmount());
                    m.put("status", "CONFIRMED");
                    m.put("paymentStatus", "UNPAID");
                    m.put("invoiceType", "PURCHASE");
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("items", items);
        result.put("page", page);
        result.put("pageSize", size);
        result.put("totalItems", (long) items.size());
        result.put("totalPages", 1);
        return ResponseEntity.ok(result);
    }

    // ═══════════════════════════════════════════════════════
    // PAYABLES — CÔNG NỢ PHẢI TRẢ
    // ═══════════════════════════════════════════════════════

    @GetMapping("/payables")
    public ResponseEntity<Map<String, Object>> listPayables(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Payable> payablesPage = payableRepo.findAll(pageable);

        List<Map<String, Object>> items = payablesPage.getContent().stream()
                .filter(p -> keyword == null || keyword.isBlank()
                        || (p.getSupplier() != null && p.getSupplier().getName().toLowerCase().contains(keyword.toLowerCase())))
                .map(p -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", p.getId());
                    m.put("supplierId", p.getSupplier() != null ? p.getSupplier().getId() : null);
                    m.put("supplierCode", p.getSupplier() != null ? p.getSupplier().getCode() : null);
                    m.put("supplierName", p.getSupplier() != null ? p.getSupplier().getName() : null);
                    m.put("address", p.getSupplier() != null ? p.getSupplier().getAddress() : null);
                    m.put("taxCode", p.getSupplier() != null ? p.getSupplier().getTaxCode() : null);
                    m.put("totalPayable", p.getOriginalAmount() != null ? p.getOriginalAmount() : BigDecimal.ZERO);
                    m.put("paidAmount", p.getPaidAmount() != null ? p.getPaidAmount() : BigDecimal.ZERO);
                    m.put("remainingAmount", p.getRemainingAmount() != null ? p.getRemainingAmount() : BigDecimal.ZERO);
                    m.put("dueDate", p.getDueDate());
                    m.put("status", p.getStatus() != null ? p.getStatus().name() : "OPEN");
                    m.put("overdue", p.getDueDate() != null && p.getDueDate().isBefore(LocalDate.now()));
                    m.put("supplierGroup", null);
                    return m;
                })
                .collect(Collectors.toList());

        BigDecimal totalRemaining = items.stream()
                .map(i -> (BigDecimal) i.get("remainingAmount"))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("items", items);
        result.put("page", page);
        result.put("pageSize", size);
        result.put("totalItems", payablesPage.getTotalElements());
        result.put("totalPages", payablesPage.getTotalPages());
        result.put("totalRemaining", totalRemaining);
        return ResponseEntity.ok(result);
    }

    // ═══════════════════════════════════════════════════════
    // SUPPLIERS — NHÀ CUNG CẤP
    // ═══════════════════════════════════════════════════════

    @GetMapping("/suppliers")
    public ResponseEntity<Map<String, Object>> listSuppliers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            @RequestParam(required = false) String keyword) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("code").ascending());
        Page<Supplier> suppliersPage = supplierRepo.findAll(pageable);

        List<Map<String, Object>> items = suppliersPage.getContent().stream()
                .filter(s -> keyword == null || keyword.isBlank()
                        || s.getName().toLowerCase().contains(keyword.toLowerCase())
                        || (s.getCode() != null && s.getCode().toLowerCase().contains(keyword.toLowerCase())))
                .map(s -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", s.getId());
                    m.put("supplierCode", s.getCode());
                    m.put("supplierName", s.getName());
                    m.put("phone", s.getPhone());
                    m.put("email", s.getEmail());
                    m.put("address", s.getAddress());
                    m.put("taxCode", s.getTaxCode());
                    m.put("status", s.getStatus() != null ? s.getStatus().name() : "ACTIVE");
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("items", items);
        result.put("page", page);
        result.put("pageSize", size);
        result.put("totalItems", suppliersPage.getTotalElements());
        result.put("totalPages", suppliersPage.getTotalPages());
        return ResponseEntity.ok(result);
    }
}


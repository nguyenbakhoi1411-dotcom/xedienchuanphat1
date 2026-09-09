package com.chuanphat.warranty.inventory.controller;

import com.chuanphat.warranty.core.entity.*;
import com.chuanphat.warranty.core.enums.*;
import com.chuanphat.warranty.core.repository.*;
import org.springframework.data.domain.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.core.dto.InventoryProductResponse;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * InventoryV2Controller — đầy đủ endpoints cho module Kho MISA AMIS.
 * Path: /api/inventory/*
 */
@RestController("inventoryV2Controller")
@RequestMapping("/api/inventory/v2")
@CrossOrigin
@PreAuthorize("hasAnyRole('ADMIN', 'CHIEF_ACCOUNTANT', 'INVENTORY_MANAGER', 'SALES_STAFF')")
public class InventoryV2Controller {

    private final PurchaseReceiptRepository receiptRepo;
    private final GoodsIssueRepository issueRepo;
    private final InventoryTransferRepository transferRepo;
    private final InventoryTransferItemRepository transferItemRepo;
    private final InventoryCountRepository countRepo;
    private final ProductRepository productRepo;
    private final WarehouseRepository warehouseRepo;
    private final InventoryStockRepository stockRepo;
    private final ProductSerialRepository serialRepo;
    private final InventoryTransactionRepository transactionRepo;
    private final UnitConversionRepository conversionRepo;
    private final com.chuanphat.warranty.core.repository.EmployeeWarehouseRepository employeeWarehouseRepo;
    private final com.chuanphat.warranty.core.service.PurchaseReceiptService purchaseReceiptService;

    public InventoryV2Controller(
            PurchaseReceiptRepository receiptRepo,
            GoodsIssueRepository issueRepo,
            InventoryTransferRepository transferRepo,
            InventoryTransferItemRepository transferItemRepo,
            InventoryCountRepository countRepo,
            ProductRepository productRepo,
            WarehouseRepository warehouseRepo,
            InventoryStockRepository stockRepo,
            ProductSerialRepository serialRepo,
            InventoryTransactionRepository transactionRepo,
            UnitConversionRepository conversionRepo,
            com.chuanphat.warranty.core.repository.EmployeeWarehouseRepository employeeWarehouseRepo,
            com.chuanphat.warranty.core.service.PurchaseReceiptService purchaseReceiptService) {
        this.receiptRepo = receiptRepo;
        this.issueRepo = issueRepo;
        this.transferRepo = transferRepo;
        this.transferItemRepo = transferItemRepo;
        this.countRepo = countRepo;
        this.productRepo = productRepo;
        this.warehouseRepo = warehouseRepo;
        this.stockRepo = stockRepo;
        this.serialRepo = serialRepo;
        this.transactionRepo = transactionRepo;
        this.conversionRepo = conversionRepo;
        this.employeeWarehouseRepo = employeeWarehouseRepo;
        this.purchaseReceiptService = purchaseReceiptService;
    }

    // ═══════════════════════════════════════════════════════
    // STATS / DASHBOARD
    // ═══════════════════════════════════════════════════════

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String asOfDate) {

        List<InventoryStock> stocks = stockRepo.findAll();
        if (branchId != null) {
            stocks = stocks.stream()
                    .filter(s -> Objects.equals(s.getBranchId(), branchId))
                    .collect(Collectors.toList());
        }

        long lowStockCount = stocks.stream()
                .filter(s -> s.getQuantity() > 0 && s.getQuantity() <= s.getMinStockLevel())
                .count();

        long outOfStockCount = stocks.stream()
                .filter(s -> s.getQuantity() <= 0)
                .count();

        BigDecimal totalValue = stocks.stream()
                .map(s -> {
                    BigDecimal qty = BigDecimal.valueOf(s.getQuantity());
                    BigDecimal cost = s.getProduct() != null && s.getProduct().getImportPrice() != null
                            ? s.getProduct().getImportPrice() : BigDecimal.ZERO;
                    return qty.multiply(cost);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Top 5 hàng hóa giá trị cao nhất
        List<Map<String, Object>> topStockItems = stocks.stream()
                .filter(s -> s.getQuantity() > 0)
                .sorted((a, b) -> {
                    BigDecimal costA = a.getProduct() != null && a.getProduct().getImportPrice() != null
                            ? a.getProduct().getImportPrice() : BigDecimal.ZERO;
                    BigDecimal costB = b.getProduct() != null && b.getProduct().getImportPrice() != null
                            ? b.getProduct().getImportPrice() : BigDecimal.ZERO;
                    BigDecimal valA = BigDecimal.valueOf(a.getQuantity()).multiply(costA);
                    BigDecimal valB = BigDecimal.valueOf(b.getQuantity()).multiply(costB);
                    return valB.compareTo(valA);
                })
                .limit(5)
                .map(s -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("productCode", s.getProduct() != null ? s.getProduct().getProductCode() : "");
                    item.put("productName", s.getProduct() != null ? s.getProduct().getProductName() : "");
                    item.put("quantity", s.getQuantity());
                    BigDecimal cost = s.getProduct() != null && s.getProduct().getImportPrice() != null
                            ? s.getProduct().getImportPrice() : BigDecimal.ZERO;
                    item.put("stockValue", BigDecimal.valueOf(s.getQuantity()).multiply(cost));
                    return item;
                })
                .collect(Collectors.toList());

        // Hàng sắp hết (SL <= minStockLevel và > 0)
        List<Map<String, Object>> lowStockItems = stocks.stream()
                .filter(s -> s.getQuantity() > 0 && s.getQuantity() <= s.getMinStockLevel())
                .limit(20)
                .map(s -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("productCode", s.getProduct() != null ? s.getProduct().getProductCode() : "");
                    item.put("productName", s.getProduct() != null ? s.getProduct().getProductName() : "");
                    item.put("warehouseName", s.getWarehouse() != null ? s.getWarehouse().getWarehouseName() : "");
                    item.put("quantityOnHand", s.getQuantity());
                    item.put("minQuantity", s.getMinStockLevel());
                    return item;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("lowStockCount", lowStockCount);
        result.put("outOfStockCount", outOfStockCount);
        result.put("totalStockValue", totalValue);
        result.put("inventoryTurnoverRate", 3.2);
        result.put("avgStorageDays", 45.0);
        result.put("topStockItems", topStockItems);
        result.put("lowStockItems", lowStockItems);

        return ResponseEntity.ok(result);
    }

    // ═══════════════════════════════════════════════════════
    // PURCHASE RECEIPTS — NHẬP KHO
    // ═══════════════════════════════════════════════════════

    @GetMapping("/receipts")
    public ResponseEntity<Map<String, Object>> listReceipts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String receiptType,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<PurchaseReceipt> receiptsPage = receiptRepo.findAll(pageable);

        List<Map<String, Object>> items = receiptsPage.getContent().stream()
                .filter(r -> branchId == null || Objects.equals(r.getBranchId(), branchId))
                .filter(r -> status == null || status.isBlank() || r.getStatus().name().equals(status))
                .filter(r -> keyword == null || keyword.isBlank()
                        || r.getReceiptNo().toLowerCase().contains(keyword.toLowerCase())
                        || (r.getSupplier() != null && r.getSupplier().getName().toLowerCase().contains(keyword.toLowerCase())))
                .filter(r -> fromDate == null || !r.getReceiptDate().isBefore(fromDate))
                .filter(r -> toDate == null || !r.getReceiptDate().isAfter(toDate))
                .map(r -> mapReceipt(r, false))
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
                .map(r -> ResponseEntity.ok(mapReceipt(r, true)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/receipts/{id}/confirm")
    @com.chuanphat.warranty.audit.annotation.Audited(action = com.chuanphat.warranty.audit.enums.AuditAction.APPROVE, module = com.chuanphat.warranty.audit.enums.AuditModule.INVENTORY, entityType = "PurchaseReceipt")
    public ResponseEntity<Map<String, Object>> confirmReceipt(
            @PathVariable Long id, Authentication auth) {
        return receiptRepo.findById(id).map(r -> {
            if (r.getStatus() != ReceiptStatus.DRAFT) {
                throw new IllegalStateException("Chỉ được duyệt phiếu Nháp");
            }
            String currentUser = auth != null ? auth.getName() : "system";
            boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            
            if (!isAdmin && r.getCreatedBy() != null && r.getCreatedBy().equals(currentUser)) {
                throw new IllegalStateException("Lỗi phân quyền: Người tạo phiếu không được phép tự duyệt phiếu (Maker-Checker)");
            }
            
            // Delegate confirmation logic (InventoryStock, Ledger, ProductSerial) to core service
            com.chuanphat.warranty.core.dto.PurchaseReceiptDto dto = purchaseReceiptService.confirm(id);
            return ResponseEntity.ok(mapReceipt(receiptRepo.findById(id).orElse(r), false));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/receipts/{id}/cancel")
    @com.chuanphat.warranty.audit.annotation.Audited(action = com.chuanphat.warranty.audit.enums.AuditAction.CANCEL, module = com.chuanphat.warranty.audit.enums.AuditModule.INVENTORY, entityType = "PurchaseReceipt")
    public ResponseEntity<Map<String, Object>> cancelReceipt(@PathVariable Long id) {
        return receiptRepo.findById(id).map(r -> {
            r.setStatus(ReceiptStatus.CANCELLED);
            receiptRepo.save(r);
            return ResponseEntity.ok(mapReceipt(r, false));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/receipts")
    @com.chuanphat.warranty.audit.annotation.Audited(action = com.chuanphat.warranty.audit.enums.AuditAction.CREATE, module = com.chuanphat.warranty.audit.enums.AuditModule.INVENTORY, entityType = "PurchaseReceipt")
    public ResponseEntity<Map<String, Object>> createReceipt(
            @RequestBody Map<String, Object> payload, Authentication auth) {
        PurchaseReceipt r = new PurchaseReceipt();
        r.setReceiptNo(payload.containsKey("receiptNo") && payload.get("receiptNo") != null 
                ? payload.get("receiptNo").toString() : "PN" + System.currentTimeMillis());
        
        if (payload.containsKey("receiptDate") && payload.get("receiptDate") != null) {
            r.setReceiptDate(LocalDate.parse(payload.get("receiptDate").toString().substring(0, 10)));
        } else {
            r.setReceiptDate(LocalDate.now());
        }
        
        if (payload.containsKey("warehouseId") && payload.get("warehouseId") != null) {
            warehouseRepo.findById(Long.valueOf(payload.get("warehouseId").toString())).ifPresent(r::setWarehouse);
        }
        
        if (payload.containsKey("branchId") && payload.get("branchId") != null) {
            r.setBranchId(Long.valueOf(payload.get("branchId").toString()));
        }
        
        r.setNote(payload.containsKey("description") && payload.get("description") != null 
                ? payload.get("description").toString() : null);
        if (payload.containsKey("deliverer") && payload.get("deliverer") != null) r.setDeliverer(payload.get("deliverer").toString());
        if (payload.containsKey("objectCode") && payload.get("objectCode") != null) r.setObjectCode(payload.get("objectCode").toString());
        if (payload.containsKey("objectAddress") && payload.get("objectAddress") != null) r.setObjectAddress(payload.get("objectAddress").toString());
        if (payload.containsKey("receiptType") && payload.get("receiptType") != null) r.setReceiptType(payload.get("receiptType").toString());

        r.setStatus(ReceiptStatus.DRAFT);
        r.setCreatedBy(auth != null ? auth.getName() : "system");

        BigDecimal total = BigDecimal.ZERO;
        List<PurchaseReceiptItem> items = new ArrayList<>();
        if (payload.containsKey("items") && payload.get("items") != null) {
            List<Map<String, Object>> itemsList = (List<Map<String, Object>>) payload.get("items");
            for (Map<String, Object> it : itemsList) {
                PurchaseReceiptItem item = new PurchaseReceiptItem();
                item.setReceipt(r);
                if (it.containsKey("productId") && it.get("productId") != null) {
                    productRepo.findById(Long.valueOf(it.get("productId").toString())).ifPresent(item::setProduct);
                }
                int parsedQty = it.containsKey("quantity") && it.get("quantity") != null 
                        ? Integer.parseInt(it.get("quantity").toString()) : 0;
                
                if (it.containsKey("unitConversionId") && it.get("unitConversionId") != null) {
                    Long unitId = Long.valueOf(it.get("unitConversionId").toString());
                    conversionRepo.findById(unitId).ifPresentOrElse(uc -> {
                        item.setQuantity((int) (parsedQty * uc.getConversionRate().doubleValue()));
                    }, () -> item.setQuantity(parsedQty));
                } else {
                    item.setQuantity(parsedQty);
                }

                item.setUnitCost(it.containsKey("unitCost") && it.get("unitCost") != null 
                        ? new BigDecimal(it.get("unitCost").toString()) : BigDecimal.ZERO);
                item.setLineTotal(item.getUnitCost().multiply(BigDecimal.valueOf(item.getQuantity())));
                
                if (it.containsKey("lotNo") && it.get("lotNo") != null) item.setLotNo(it.get("lotNo").toString());
                if (it.containsKey("expiryDate") && it.get("expiryDate") != null) item.setExpiryDate(LocalDate.parse(it.get("expiryDate").toString().substring(0, 10)));
                if (it.containsKey("frameNumber") && it.get("frameNumber") != null) item.setFrameNumber(it.get("frameNumber").toString());
                if (it.containsKey("engineNumber") && it.get("engineNumber") != null) item.setEngineNumber(it.get("engineNumber").toString());
                if (it.containsKey("batterySerial") && it.get("batterySerial") != null) item.setBatterySerial(it.get("batterySerial").toString());
                
                total = total.add(item.getLineTotal());
                items.add(item);
            }
        }
        r.getItems().clear();
        r.getItems().addAll(items);
        r.setTotalAmount(total);

        receiptRepo.save(r);
        return ResponseEntity.ok(mapReceipt(r, true));
    }

    @PutMapping("/receipts/{id}")
    @com.chuanphat.warranty.audit.annotation.Audited(action = com.chuanphat.warranty.audit.enums.AuditAction.UPDATE, module = com.chuanphat.warranty.audit.enums.AuditModule.INVENTORY, entityType = "PurchaseReceipt")
    public ResponseEntity<Map<String, Object>> updateReceipt(
            @PathVariable Long id, @RequestBody Map<String, Object> payload, Authentication auth) {
        return receiptRepo.findById(id).map(r -> {
            if (r.getStatus() != ReceiptStatus.DRAFT) {
                throw new IllegalStateException("Chỉ được sửa phiếu Nháp");
            }
            if (payload.containsKey("receiptDate") && payload.get("receiptDate") != null) {
                r.setReceiptDate(LocalDate.parse(payload.get("receiptDate").toString().substring(0, 10)));
            }
            if (payload.containsKey("warehouseId") && payload.get("warehouseId") != null) {
                warehouseRepo.findById(Long.valueOf(payload.get("warehouseId").toString())).ifPresent(r::setWarehouse);
            }
            if (payload.containsKey("description") && payload.get("description") != null) {
                r.setNote(payload.get("description").toString());
            }
            if (payload.containsKey("deliverer") && payload.get("deliverer") != null) r.setDeliverer(payload.get("deliverer").toString());
            if (payload.containsKey("objectCode") && payload.get("objectCode") != null) r.setObjectCode(payload.get("objectCode").toString());
            if (payload.containsKey("objectAddress") && payload.get("objectAddress") != null) r.setObjectAddress(payload.get("objectAddress").toString());
            if (payload.containsKey("receiptType") && payload.get("receiptType") != null) r.setReceiptType(payload.get("receiptType").toString());

            if (payload.containsKey("items") && payload.get("items") != null) {
                r.getItems().clear(); // Clear existing
                BigDecimal total = BigDecimal.ZERO;
                List<Map<String, Object>> itemsList = (List<Map<String, Object>>) payload.get("items");
                for (Map<String, Object> it : itemsList) {
                    PurchaseReceiptItem item = new PurchaseReceiptItem();
                    item.setReceipt(r);
                    if (it.containsKey("productId") && it.get("productId") != null) {
                        productRepo.findById(Long.valueOf(it.get("productId").toString())).ifPresent(item::setProduct);
                    }
                    item.setQuantity(it.containsKey("quantity") && it.get("quantity") != null 
                            ? Integer.parseInt(it.get("quantity").toString()) : 0);
                    item.setUnitCost(it.containsKey("unitCost") && it.get("unitCost") != null 
                            ? new BigDecimal(it.get("unitCost").toString()) : BigDecimal.ZERO);
                    item.setLineTotal(item.getUnitCost().multiply(BigDecimal.valueOf(item.getQuantity())));
                    
                    if (it.containsKey("lotNo") && it.get("lotNo") != null) item.setLotNo(it.get("lotNo").toString());
                    if (it.containsKey("expiryDate") && it.get("expiryDate") != null) item.setExpiryDate(LocalDate.parse(it.get("expiryDate").toString().substring(0, 10)));
                    if (it.containsKey("frameNumber") && it.get("frameNumber") != null) item.setFrameNumber(it.get("frameNumber").toString());
                    if (it.containsKey("engineNumber") && it.get("engineNumber") != null) item.setEngineNumber(it.get("engineNumber").toString());
                    if (it.containsKey("batterySerial") && it.get("batterySerial") != null) item.setBatterySerial(it.get("batterySerial").toString());

                    total = total.add(item.getLineTotal());
                    r.getItems().add(item);
                }
                r.setTotalAmount(total);
            }
            
            receiptRepo.save(r);
            return ResponseEntity.ok(mapReceipt(r, true));
        }).orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> mapReceipt(PurchaseReceipt r, boolean includeItems) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.getId());
        m.put("receiptNo", r.getReceiptNo());
        m.put("receiptDate", r.getReceiptDate());
        m.put("accountingDate", r.getReceiptDate());
        m.put("supplierName", r.getSupplier() != null ? r.getSupplier().getName() : null);
        m.put("objectName", r.getSupplier() != null ? r.getSupplier().getName() : null);
        m.put("objectAddress", r.getSupplier() != null ? r.getSupplier().getAddress() : null);
        m.put("totalAmount", r.getTotalAmount());
        m.put("receiptType", "FROM_SUPPLIER");
        m.put("status", r.getStatus().name());
        m.put("createdBy", r.getCreatedBy());
        m.put("branchId", r.getBranchId());
        m.put("warehouseName", r.getWarehouse() != null ? r.getWarehouse().getWarehouseName() : null);

        if (includeItems) {
            m.put("deliveryPerson", null);
            m.put("description", r.getNote());
            m.put("documentCount", r.getItems().size());
            m.put("referenceNo", r.getPurchaseOrderId() != null ? "PO-" + r.getPurchaseOrderId() : null);
            List<Map<String, Object>> items = r.getItems().stream().map(item -> {
                Map<String, Object> it = new LinkedHashMap<>();
                it.put("id", item.getId());
                it.put("productId", item.getProduct() != null ? item.getProduct().getId() : null);
                it.put("productCode", item.getProduct() != null ? item.getProduct().getProductCode() : "");
                it.put("productName", item.getProduct() != null ? item.getProduct().getProductName() : "");
                it.put("warehouseName", r.getWarehouse() != null ? r.getWarehouse().getWarehouseName() : null);
                it.put("debitAccount", "152");
                it.put("creditAccount", "331");
                it.put("unitOfMeasure", item.getProduct() != null ? item.getProduct().getPrimaryUnit() : null);
                it.put("quantity", item.getQuantity());
                it.put("unitCost", item.getUnitCost());
                it.put("lineTotal", item.getLineTotal());
                it.put("discountRate", BigDecimal.ZERO);
                it.put("discountAmount", BigDecimal.ZERO);
                it.put("purchaseCost", BigDecimal.ZERO);
                it.put("inventoryValue", item.getLineTotal());
                it.put("lotNo", item.getLotNo());
                it.put("expiryDate", item.getExpiryDate() != null ? item.getExpiryDate().toString() : null);
                it.put("frameNumber", item.getFrameNumber());
                it.put("engineNumber", item.getEngineNumber());
                it.put("batterySerial", item.getBatterySerial());
                it.put("serialNumber", item.getSerialNumber());
                return it;
            }).collect(Collectors.toList());
            m.put("items", items);
        }
        return m;
    }

    // ═══════════════════════════════════════════════════════
    // GOODS ISSUES — XUẤT KHO
    // ═══════════════════════════════════════════════════════

    @GetMapping("/issues")
    public ResponseEntity<Map<String, Object>> listIssues(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String issueType,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<GoodsIssue> issuePage = issueRepo.findAll(pageable);

        List<Map<String, Object>> items = issuePage.getContent().stream()
                .filter(i -> branchId == null || Objects.equals(i.getBranchId(), branchId))
                .filter(i -> status == null || status.isBlank() || i.getStatus().equals(status))
                .filter(i -> keyword == null || keyword.isBlank()
                        || i.getIssueNo().toLowerCase().contains(keyword.toLowerCase()))
                .filter(i -> fromDate == null || !i.getIssueDate().isBefore(fromDate))
                .filter(i -> toDate == null || !i.getIssueDate().isAfter(toDate))
                .map(i -> mapIssue(i, false))
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("items", items);
        result.put("page", page);
        result.put("pageSize", size);
        result.put("totalItems", issuePage.getTotalElements());
        result.put("totalPages", issuePage.getTotalPages());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/issues/{id}")
    public ResponseEntity<Map<String, Object>> getIssue(@PathVariable Long id) {
        return issueRepo.findById(id)
                .map(i -> ResponseEntity.ok(mapIssue(i, true)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/issues/{id}/issue")
    @com.chuanphat.warranty.audit.annotation.Audited(action = com.chuanphat.warranty.audit.enums.AuditAction.APPROVE, module = com.chuanphat.warranty.audit.enums.AuditModule.INVENTORY, entityType = "GoodsIssue")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Map<String, Object>> confirmIssue(
            @PathVariable Long id, Authentication auth) {
        return issueRepo.findById(id).map(i -> {
            if (!"DRAFT".equals(i.getStatus())) {
                throw new IllegalStateException("Chỉ được duyệt phiếu Nháp");
            }
            String currentUser = auth != null ? auth.getName() : "system";
            boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            
            if (!isAdmin && i.getCreatedBy() != null && i.getCreatedBy().equals(currentUser)) {
                throw new IllegalStateException("Lỗi phân quyền: Người tạo phiếu không được phép tự duyệt phiếu (Maker-Checker)");
            }
            
            // Deduct Stock Logic (FEFO and Serial validation)
            for (GoodsIssueItem item : i.getItems()) {
                if (item.getProduct().getCategory() == ProductCategory.SERVICE) {
                    continue;
                }
                if (item.getSerial() != null) {
                    // Xuất xe điện
                    ProductSerial s = item.getSerial();
                    if (s.getStatus() != SerialStatus.IN_STOCK) {
                        throw new IllegalStateException("Serial " + s.getSerialNumber() + " không có sẵn trong kho");
                    }
                    s.setStatus(SerialStatus.SOLD);
                    serialRepo.save(s);
                    createTransaction(i, item, null, s, 1, currentUser);
                } else {
                    // Xuất thực phẩm / phụ tùng (FEFO)
                    int remainingQty = item.getQuantity();
                    
                    if (item.getBatch() != null) {
                        InventoryStock stock = stockRepo.findWithLockByBranchIdAndWarehouseIdAndProductIdAndBatchId(
                                i.getBranchId(), i.getWarehouse().getId(), item.getProduct().getId(), item.getBatch().getId()
                        ).orElseThrow(() -> new IllegalStateException("Không tìm thấy tồn kho cho lô " + item.getBatch().getBatchCode()));
                        
                        if (stock.getQuantity() < remainingQty) {
                            throw new IllegalStateException("Không đủ tồn kho cho lô " + item.getBatch().getBatchCode());
                        }
                        stock.setQuantity(stock.getQuantity() - remainingQty);
                        stockRepo.save(stock);
                        createTransaction(i, item, item.getBatch(), null, remainingQty, currentUser);
                    } else {
                        // Auto FEFO
                        List<InventoryStock> availableStocks = stockRepo.findAvailableStocksOrderByExpDateAsc(
                                i.getBranchId(), i.getWarehouse().getId(), item.getProduct().getId()
                        );
                        for (InventoryStock stock : availableStocks) {
                            if (remainingQty <= 0) break;
                            int deduct = Math.min(stock.getQuantity(), remainingQty);
                            stock.setQuantity(stock.getQuantity() - deduct);
                            stockRepo.save(stock);
                            remainingQty -= deduct;
                            createTransaction(i, item, stock.getBatch(), null, deduct, currentUser);
                        }
                        if (remainingQty > 0) {
                            throw new IllegalStateException("Không đủ tồn kho tổng thể cho sản phẩm " + item.getProduct().getProductName());
                        }
                    }
                }
            }

            i.setStatus("ISSUED");
            i.setIssuedBy(currentUser);
            i.setIssuedAt(java.time.OffsetDateTime.now());
            issueRepo.save(i);
            return ResponseEntity.ok(mapIssue(i, false));
        }).orElse(ResponseEntity.notFound().build());
    }

    private void createTransaction(GoodsIssue i, GoodsIssueItem item, ProductBatch batch, ProductSerial serial, int qty, String createdBy) {
        InventoryTransaction tx = new InventoryTransaction();
        tx.setType(InventoryTransactionType.GOODS_ISSUE);
        tx.setTransactionNo("TX-" + i.getIssueNo() + "-" + System.currentTimeMillis() + "-" + qty);
        tx.setTransactionDate(i.getIssueDate());
        tx.setProduct(item.getProduct());
        tx.setBatch(batch);
        tx.setSerial(serial);
        tx.setFromBranchId(i.getBranchId());
        tx.setFromWarehouseId(i.getWarehouse().getId());
        tx.setQuantity(qty);
        tx.setUnitCost(item.getUnitCost());
        tx.setTotalCost(item.getUnitCost().multiply(BigDecimal.valueOf(qty)));
        tx.setReferenceType("GOODS_ISSUE");
        tx.setReferenceNo(i.getIssueNo());
        tx.setCreatedBy(createdBy);
        transactionRepo.save(tx);
    }

    @PostMapping("/issues/{id}/cancel")
    @com.chuanphat.warranty.audit.annotation.Audited(action = com.chuanphat.warranty.audit.enums.AuditAction.CANCEL, module = com.chuanphat.warranty.audit.enums.AuditModule.INVENTORY, entityType = "GoodsIssue")
    public ResponseEntity<Map<String, Object>> cancelIssue(@PathVariable Long id) {
        return issueRepo.findById(id).map(i -> {
            i.setStatus("CANCELLED");
            issueRepo.save(i);
            return ResponseEntity.ok(mapIssue(i, false));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/issues")
    @com.chuanphat.warranty.audit.annotation.Audited(action = com.chuanphat.warranty.audit.enums.AuditAction.CREATE, module = com.chuanphat.warranty.audit.enums.AuditModule.INVENTORY, entityType = "GoodsIssue")
    public ResponseEntity<Map<String, Object>> createIssue(
            @RequestBody Map<String, Object> payload, Authentication auth) {
        GoodsIssue i = new GoodsIssue();
        i.setIssueNo(payload.containsKey("issueNo") && payload.get("issueNo") != null 
                ? payload.get("issueNo").toString() : "PX" + System.currentTimeMillis());
        
        if (payload.containsKey("issueDate") && payload.get("issueDate") != null) {
            i.setIssueDate(LocalDate.parse(payload.get("issueDate").toString().substring(0, 10)));
        } else {
            i.setIssueDate(LocalDate.now());
        }
        
        if (payload.containsKey("warehouseId") && payload.get("warehouseId") != null) {
            warehouseRepo.findById(Long.valueOf(payload.get("warehouseId").toString())).ifPresent(i::setWarehouse);
        }
        
        if (payload.containsKey("branchId") && payload.get("branchId") != null) {
            i.setBranchId(Long.valueOf(payload.get("branchId").toString()));
        } else {
            i.setBranchId(1L); // default branch
        }
        
        i.setNote(payload.containsKey("description") && payload.get("description") != null 
                ? payload.get("description").toString() : null);
        if (payload.containsKey("receiverName") && payload.get("receiverName") != null) i.setReceiverName(payload.get("receiverName").toString());
        if (payload.containsKey("salesPerson") && payload.get("salesPerson") != null) i.setSalesPerson(payload.get("salesPerson").toString());
        if (payload.containsKey("deliveryAddress") && payload.get("deliveryAddress") != null) i.setDeliveryAddress(payload.get("deliveryAddress").toString());
        if (payload.containsKey("customerCode") && payload.get("customerCode") != null) i.setCustomerCode(payload.get("customerCode").toString());

        i.setStatus("DRAFT");
        if (payload.containsKey("issueType") && payload.get("issueType") != null) {
            try {
                i.setIssueType(GoodsIssueType.valueOf(payload.get("issueType").toString().toUpperCase()));
            } catch (Exception e) {
                i.setIssueType(GoodsIssueType.OTHER);
            }
        } else {
            i.setIssueType(GoodsIssueType.OTHER);
        }
        i.setCreatedBy(auth != null ? auth.getName() : "system");

        List<GoodsIssueItem> items = new ArrayList<>();
        if (payload.containsKey("items") && payload.get("items") != null) {
            List<Map<String, Object>> itemsList = (List<Map<String, Object>>) payload.get("items");
            for (Map<String, Object> it : itemsList) {
                GoodsIssueItem item = new GoodsIssueItem();
                item.setGoodsIssue(i);
                if (it.containsKey("productId") && it.get("productId") != null) {
                    productRepo.findById(Long.valueOf(it.get("productId").toString())).ifPresent(item::setProduct);
                }
                int parsedQty = it.containsKey("quantity") && it.get("quantity") != null 
                        ? Integer.parseInt(it.get("quantity").toString()) : 0;
                
                if (it.containsKey("unitConversionId") && it.get("unitConversionId") != null) {
                    Long unitId = Long.valueOf(it.get("unitConversionId").toString());
                    conversionRepo.findById(unitId).ifPresentOrElse(uc -> {
                        item.setQuantity((int) (parsedQty * uc.getConversionRate().doubleValue()));
                    }, () -> item.setQuantity(parsedQty));
                } else {
                    item.setQuantity(parsedQty);
                }

                item.setUnitCost(it.containsKey("unitCost") && it.get("unitCost") != null 
                        ? new BigDecimal(it.get("unitCost").toString()) : BigDecimal.ZERO);
                items.add(item);
            }
        }
        i.getItems().clear();
        i.getItems().addAll(items);

        issueRepo.save(i);
        return ResponseEntity.ok(mapIssue(i, true));
    }

    @PutMapping("/issues/{id}")
    @com.chuanphat.warranty.audit.annotation.Audited(action = com.chuanphat.warranty.audit.enums.AuditAction.UPDATE, module = com.chuanphat.warranty.audit.enums.AuditModule.INVENTORY, entityType = "GoodsIssue")
    public ResponseEntity<Map<String, Object>> updateIssue(
            @PathVariable Long id, @RequestBody Map<String, Object> payload, Authentication auth) {
        return issueRepo.findById(id).map(i -> {
            if (!"DRAFT".equals(i.getStatus())) {
                throw new IllegalStateException("Chỉ được sửa phiếu Nháp");
            }
            if (payload.containsKey("issueDate") && payload.get("issueDate") != null) {
                i.setIssueDate(LocalDate.parse(payload.get("issueDate").toString().substring(0, 10)));
            }
            if (payload.containsKey("warehouseId") && payload.get("warehouseId") != null) {
                warehouseRepo.findById(Long.valueOf(payload.get("warehouseId").toString())).ifPresent(i::setWarehouse);
            }
            if (payload.containsKey("description") && payload.get("description") != null) {
                i.setNote(payload.get("description").toString());
            }
            if (payload.containsKey("receiverName") && payload.get("receiverName") != null) i.setReceiverName(payload.get("receiverName").toString());
            if (payload.containsKey("salesPerson") && payload.get("salesPerson") != null) i.setSalesPerson(payload.get("salesPerson").toString());
            if (payload.containsKey("deliveryAddress") && payload.get("deliveryAddress") != null) i.setDeliveryAddress(payload.get("deliveryAddress").toString());
            if (payload.containsKey("customerCode") && payload.get("customerCode") != null) i.setCustomerCode(payload.get("customerCode").toString());
            if (payload.containsKey("issueType") && payload.get("issueType") != null) {
                try {
                    i.setIssueType(GoodsIssueType.valueOf(payload.get("issueType").toString().toUpperCase()));
                } catch (Exception ignored) {}
            }

            if (payload.containsKey("items") && payload.get("items") != null) {
                i.getItems().clear(); // Clear existing
                BigDecimal total = BigDecimal.ZERO;
                List<Map<String, Object>> itemsList = (List<Map<String, Object>>) payload.get("items");
                for (Map<String, Object> it : itemsList) {
                    GoodsIssueItem item = new GoodsIssueItem();
                    item.setGoodsIssue(i);
                    if (it.containsKey("productId") && it.get("productId") != null) {
                        productRepo.findById(Long.valueOf(it.get("productId").toString())).ifPresent(item::setProduct);
                    }
                    item.setQuantity(it.containsKey("quantity") && it.get("quantity") != null 
                            ? Integer.parseInt(it.get("quantity").toString()) : 0);
                    item.setUnitCost(it.containsKey("unitCost") && it.get("unitCost") != null 
                            ? new BigDecimal(it.get("unitCost").toString()) : BigDecimal.ZERO);
                    i.getItems().add(item);
                }
            }
            
            issueRepo.save(i);
            return ResponseEntity.ok(mapIssue(i, true));
        }).orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> mapIssue(GoodsIssue issue, boolean includeItems) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", issue.getId());
        m.put("issueNo", issue.getIssueNo());
        m.put("accountingDate", issue.getIssueDate());
        m.put("description", issue.getNote());
        m.put("totalAmount", issue.getItems().stream()
                .map(it -> it.getUnitCost().multiply(BigDecimal.valueOf(it.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        m.put("totalCost", m.get("totalAmount"));
        m.put("receiverName", null);
        m.put("customerName", null);
        m.put("invoiceIssued", false);
        m.put("invoiceStatus", null);
        m.put("taxAuthorityCode", null);
        m.put("issueType", issue.getIssueType() != null ? issue.getIssueType().name() : "OTHER");
        m.put("status", issue.getStatus());
        m.put("branchId", issue.getBranchId());

        if (includeItems) {
            m.put("issueReason", issue.getReferenceNo());
            m.put("documentCount", issue.getItems().size());
            List<Map<String, Object>> items = issue.getItems().stream().map(it -> {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", it.getId());
                item.put("productId", it.getProduct() != null ? it.getProduct().getId() : null);
                item.put("productCode", it.getProduct() != null ? it.getProduct().getProductCode() : "");
                item.put("productName", it.getProduct() != null ? it.getProduct().getProductName() : "");
                item.put("warehouseName", issue.getWarehouse() != null ? issue.getWarehouse().getWarehouseName() : null);
                item.put("debitAccount", "632");
                item.put("creditAccount", "156");
                item.put("unitOfMeasure", it.getProduct() != null ? it.getProduct().getPrimaryUnit() : null);
                item.put("quantity", it.getQuantity());
                item.put("unitCost", it.getUnitCost());
                item.put("unitPrice", it.getUnitCost());
                item.put("lineTotal", it.getUnitCost().multiply(BigDecimal.valueOf(it.getQuantity())));
                return item;
            }).collect(Collectors.toList());
            m.put("items", items);
        }
        return m;
    }

    // ═══════════════════════════════════════════════════════
    // TRANSFERS — CHUYỂN KHO (nâng cấp)
    // ═══════════════════════════════════════════════════════

    @GetMapping("/transfers")
    public ResponseEntity<Map<String, Object>> listTransfers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<InventoryTransfer> transferPage = transferRepo.findAll(pageable);

        List<Map<String, Object>> items = transferPage.getContent().stream()
                .filter(t -> keyword == null || keyword.isBlank()
                        || t.getTransferNo().toLowerCase().contains(keyword.toLowerCase()))
                .filter(t -> status == null || status.isBlank() || t.getStatus().name().equals(status))
                .filter(t -> fromDate == null || !t.getTransferDate().isBefore(fromDate))
                .filter(t -> toDate == null || !t.getTransferDate().isAfter(toDate))
                .map(t -> mapTransfer(t, false))
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("items", items);
        result.put("page", page);
        result.put("pageSize", size);
        result.put("totalItems", transferPage.getTotalElements());
        result.put("totalPages", transferPage.getTotalPages());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/transfers/{id}")
    public ResponseEntity<Map<String, Object>> getTransfer(@PathVariable Long id) {
        return transferRepo.findById(id)
                .map(t -> ResponseEntity.ok(mapTransfer(t, true)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/transfers")
    @com.chuanphat.warranty.audit.annotation.Audited(action = com.chuanphat.warranty.audit.enums.AuditAction.CREATE, module = com.chuanphat.warranty.audit.enums.AuditModule.INVENTORY, entityType = "InventoryTransfer")
    public ResponseEntity<Map<String, Object>> createTransfer(
            @RequestBody Map<String, Object> payload, Authentication auth) {
        InventoryTransfer t = new InventoryTransfer();
        t.setTransferNo(payload.containsKey("transferNo") && payload.get("transferNo") != null 
                ? payload.get("transferNo").toString() : "CK" + System.currentTimeMillis());
        
        if (payload.containsKey("transferDate") && payload.get("transferDate") != null) {
            t.setTransferDate(LocalDate.parse(payload.get("transferDate").toString().substring(0, 10)));
        } else {
            t.setTransferDate(LocalDate.now());
        }
        
        if (payload.containsKey("fromWarehouseId") && payload.get("fromWarehouseId") != null) {
            warehouseRepo.findById(Long.valueOf(payload.get("fromWarehouseId").toString())).ifPresent(t::setFromWarehouse);
        }
        if (payload.containsKey("toWarehouseId") && payload.get("toWarehouseId") != null) {
            warehouseRepo.findById(Long.valueOf(payload.get("toWarehouseId").toString())).ifPresent(t::setToWarehouse);
        }
        
        if (payload.containsKey("fromBranchId") && payload.get("fromBranchId") != null) {
            t.setFromBranchId(Long.valueOf(payload.get("fromBranchId").toString()));
        }
        if (payload.containsKey("toBranchId") && payload.get("toBranchId") != null) {
            t.setToBranchId(Long.valueOf(payload.get("toBranchId").toString()));
        }
        
        t.setNote(payload.containsKey("description") && payload.get("description") != null 
                ? payload.get("description").toString() : null);
        if (payload.containsKey("transporter") && payload.get("transporter") != null) t.setTransporter(payload.get("transporter").toString());
        if (payload.containsKey("transportVehicle") && payload.get("transportVehicle") != null) t.setTransportVehicle(payload.get("transportVehicle").toString());
        if (payload.containsKey("transportContract") && payload.get("transportContract") != null) t.setTransportContract(payload.get("transportContract").toString());
        if (payload.containsKey("transferType") && payload.get("transferType") != null) t.setTransferType(payload.get("transferType").toString());

        t.setStatus(TransferStatus.DRAFT);
        t.setCreatedBy(auth != null ? auth.getName() : "system");

        List<InventoryTransferItem> items = new ArrayList<>();
        if (payload.containsKey("items") && payload.get("items") != null) {
            List<Map<String, Object>> itemsList = (List<Map<String, Object>>) payload.get("items");
            for (Map<String, Object> it : itemsList) {
                InventoryTransferItem item = new InventoryTransferItem();
                if (it.containsKey("productId") && it.get("productId") != null) {
                    productRepo.findById(Long.valueOf(it.get("productId").toString())).ifPresent(item::setProduct);
                }
                item.setQuantity(it.containsKey("quantity") && it.get("quantity") != null 
                        ? Integer.parseInt(it.get("quantity").toString()) : 0);
                items.add(item);
            }
        }
        
        t = transferRepo.save(t); // save first to get ID
        for (InventoryTransferItem item : items) {
            item.setTransferId(t.getId());
        }
        t.getItems().addAll(items);

        transferRepo.save(t);
        return ResponseEntity.ok(mapTransfer(t, true));
    }

    @PutMapping("/transfers/{id}")
    @com.chuanphat.warranty.audit.annotation.Audited(action = com.chuanphat.warranty.audit.enums.AuditAction.UPDATE, module = com.chuanphat.warranty.audit.enums.AuditModule.INVENTORY, entityType = "InventoryTransfer")
    public ResponseEntity<Map<String, Object>> updateTransfer(
            @PathVariable Long id, @RequestBody Map<String, Object> payload, Authentication auth) {
        return transferRepo.findById(id).map(t -> {
            if (t.getStatus() != TransferStatus.DRAFT) {
                throw new IllegalStateException("Chỉ được sửa phiếu Nháp");
            }
            if (payload.containsKey("transferDate") && payload.get("transferDate") != null) {
                t.setTransferDate(LocalDate.parse(payload.get("transferDate").toString().substring(0, 10)));
            }
            if (payload.containsKey("fromWarehouseId") && payload.get("fromWarehouseId") != null) {
                warehouseRepo.findById(Long.valueOf(payload.get("fromWarehouseId").toString())).ifPresent(t::setFromWarehouse);
            }
            if (payload.containsKey("toWarehouseId") && payload.get("toWarehouseId") != null) {
                warehouseRepo.findById(Long.valueOf(payload.get("toWarehouseId").toString())).ifPresent(t::setToWarehouse);
            }
            if (payload.containsKey("description") && payload.get("description") != null) {
                t.setNote(payload.get("description").toString());
            }
            if (payload.containsKey("transporter") && payload.get("transporter") != null) t.setTransporter(payload.get("transporter").toString());
            if (payload.containsKey("transportVehicle") && payload.get("transportVehicle") != null) t.setTransportVehicle(payload.get("transportVehicle").toString());
            if (payload.containsKey("transportContract") && payload.get("transportContract") != null) t.setTransportContract(payload.get("transportContract").toString());
            if (payload.containsKey("transferType") && payload.get("transferType") != null) t.setTransferType(payload.get("transferType").toString());

            if (payload.containsKey("items") && payload.get("items") != null) {
                t.getItems().clear(); // Clear existing
                List<Map<String, Object>> itemsList = (List<Map<String, Object>>) payload.get("items");
                for (Map<String, Object> it : itemsList) {
                    InventoryTransferItem item = new InventoryTransferItem();
                    item.setTransferId(t.getId());
                    if (it.containsKey("productId") && it.get("productId") != null) {
                        productRepo.findById(Long.valueOf(it.get("productId").toString())).ifPresent(item::setProduct);
                    }
                    item.setQuantity(it.containsKey("quantity") && it.get("quantity") != null 
                            ? Integer.parseInt(it.get("quantity").toString()) : 0);
                    t.getItems().add(item);
                }
            }
            
            transferRepo.save(t);
            return ResponseEntity.ok(mapTransfer(t, true));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/transfers/{id}/approve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CHIEF_ACCOUNTANT') or hasRole('INVENTORY_MANAGER')")
    @com.chuanphat.warranty.audit.annotation.Audited(action = com.chuanphat.warranty.audit.enums.AuditAction.APPROVE, module = com.chuanphat.warranty.audit.enums.AuditModule.INVENTORY, entityType = "InventoryTransfer")
    public ResponseEntity<Map<String, Object>> approveTransfer(
            @PathVariable Long id, Authentication auth) {
        return transferRepo.findById(id).map(t -> {
            if (t.getStatus() != TransferStatus.DRAFT) {
                throw new IllegalStateException("Chỉ được duyệt phiếu Nháp");
            }
            String currentUser = auth != null ? auth.getName() : "system";
            boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            
            if (!isAdmin && t.getCreatedBy() != null && t.getCreatedBy().equals(currentUser)) {
                throw new IllegalStateException("Lỗi phân quyền: Người tạo phiếu không được phép tự duyệt phiếu (Maker-Checker)");
            }
            
            t.setStatus(TransferStatus.APPROVED);
            
            // Deduct from Source and Add to Destination
            for (InventoryTransferItem item : t.getItems()) {
                if (item.getProduct().getCategory() == ProductCategory.SERVICE) continue;
                
                if (item.getSerial() != null) {
                    ProductSerial s = item.getSerial();
                    if (s.getStatus() != SerialStatus.IN_STOCK || !s.getWarehouse().getId().equals(t.getFromWarehouse().getId())) {
                        throw new IllegalStateException("Serial " + s.getSerialNumber() + " không có sẵn trong kho xuất");
                    }
                    // Move serial
                    s.setWarehouse(t.getToWarehouse());
                    s.setBranchId(t.getToBranchId());
                    serialRepo.save(s);
                    
                    // Transaction
                    createTransferTransaction(t, item, null, s, 1, currentUser);
                } else {
                    // For now, simple transfer (assuming FEFO or generic stock for Food/Parts).
                    // In a real system, transfer items must specify batch. Here we assume generic transfer if no batch.
                    List<InventoryStock> fromStocks = stockRepo.findAvailableStocksOrderByExpDateAsc(
                            t.getFromBranchId(), t.getFromWarehouse().getId(), item.getProduct().getId()
                    );
                    
                    int remainingToTransfer = item.getQuantity();
                    for (InventoryStock fromStock : fromStocks) {
                        if (remainingToTransfer <= 0) break;
                        
                        int deductQty = Math.min(fromStock.getQuantity(), remainingToTransfer);
                        fromStock.setQuantity(fromStock.getQuantity() - deductQty);
                        stockRepo.save(fromStock);
                        
                        // Add to destination
                        InventoryStock toStock = stockRepo.findWithLockByBranchIdAndWarehouseIdAndProductIdAndBatchId(
                                t.getToBranchId(), t.getToWarehouse().getId(), item.getProduct().getId(), 
                                fromStock.getBatch() != null ? fromStock.getBatch().getId() : null
                        ).orElseGet(() -> {
                            InventoryStock newStock = new InventoryStock();
                            newStock.setBranchId(t.getToBranchId());
                            newStock.setWarehouse(t.getToWarehouse());
                            newStock.setProduct(item.getProduct());
                            newStock.setBatch(fromStock.getBatch());
                            newStock.setQuantity(0);
                            newStock.setMinStockLevel(1);
                            newStock.setMaxStockLevel(100);
                            return newStock;
                        });
                        
                        toStock.setQuantity(toStock.getQuantity() + deductQty);
                        stockRepo.save(toStock);
                        
                        createTransferTransaction(t, item, fromStock.getBatch(), null, deductQty, currentUser);
                        remainingToTransfer -= deductQty;
                    }
                    if (remainingToTransfer > 0) {
                        throw new IllegalStateException("Không đủ tồn kho ở kho xuất cho sản phẩm " + item.getProduct().getProductCode());
                    }
                }
            }
            
            transferRepo.save(t);
            return ResponseEntity.ok(mapTransfer(t, true));
        }).orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> mapTransfer(InventoryTransfer t, boolean includeItems) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", t.getId());
        m.put("transferNo", t.getTransferNo());
        m.put("transferDate", t.getTransferDate());
        m.put("accountingDate", t.getTransferDate());
        m.put("description", t.getNote());
        m.put("totalSaleAmount", t.getTransferCost());
        m.put("totalCostAmount", t.getTransferCost());
        m.put("carrierName", null);
        m.put("receivingUnitName", t.getToWarehouse() != null ? t.getToWarehouse().getWarehouseName() : null);
        m.put("transferType", "INTERNAL");
        m.put("status", t.getStatus().name());
        m.put("branchId", t.getFromBranchId());

        if (includeItems) {
            m.put("reason", t.getNote());
            m.put("fromWarehouseAddress", null);
            m.put("toWarehouseAddress", null);
            m.put("documentCount", 1);

            List<Map<String, Object>> items = new ArrayList<>();
            for (InventoryTransferItem iItem : t.getItems()) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", iItem.getId());
                item.put("productId", iItem.getProduct() != null ? iItem.getProduct().getId() : null);
                item.put("productCode", iItem.getProduct() != null ? iItem.getProduct().getProductCode() : "");
                item.put("productName", iItem.getProduct() != null ? iItem.getProduct().getProductName() : "");
                item.put("fromWarehouseName", t.getFromWarehouse() != null ? t.getFromWarehouse().getWarehouseName() : null);
                item.put("toWarehouseName", t.getToWarehouse() != null ? t.getToWarehouse().getWarehouseName() : null);
                item.put("debitAccount", "1562");
                item.put("creditAccount", "1561");
                item.put("quantity", iItem.getQuantity());
                item.put("saleUnitPrice", iItem.getUnitCost());
                item.put("saleLineTotal", iItem.getUnitCost().multiply(BigDecimal.valueOf(iItem.getQuantity())));
                item.put("costUnitPrice", iItem.getUnitCost());
                item.put("costLineTotal", iItem.getUnitCost().multiply(BigDecimal.valueOf(iItem.getQuantity())));
                items.add(item);
            }
            m.put("items", items);
        }
        return m;
    }

    private void createTransferTransaction(InventoryTransfer t, InventoryTransferItem item, ProductBatch batch, ProductSerial serial, int qty, String user) {
        InventoryTransaction tr = new InventoryTransaction();
        tr.setType(InventoryTransactionType.TRANSFER);
        tr.setTransactionNo(t.getTransferNo());
        tr.setTransactionDate(t.getTransferDate() != null ? t.getTransferDate() : LocalDate.now());
        tr.setProduct(item.getProduct());
        tr.setBatch(batch);
        tr.setSerial(serial);
        tr.setFromBranchId(t.getFromBranchId());
        tr.setToBranchId(t.getToBranchId());
        tr.setFromWarehouseId(t.getFromWarehouse() != null ? t.getFromWarehouse().getId() : null);
        tr.setToWarehouseId(t.getToWarehouse() != null ? t.getToWarehouse().getId() : null);
        tr.setQuantity(qty);
        tr.setUnitCost(item.getUnitCost());
        tr.setTotalCost(item.getUnitCost().multiply(BigDecimal.valueOf(qty)));
        tr.setCreatedBy(user);
        transactionRepo.save(tr);
    }

    // ═══════════════════════════════════════════════════════
    // INVENTORY COUNTS — KIỂM KÊ
    // ═══════════════════════════════════════════════════════

    @GetMapping("/counts")
    public ResponseEntity<Map<String, Object>> listCounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String status) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<InventoryCount> countsPage = countRepo.findAll(pageable);

        List<Map<String, Object>> items = countsPage.getContent().stream()
                .filter(c -> branchId == null || Objects.equals(c.getBranchId(), branchId))
                .filter(c -> status == null || status.isBlank() || c.getStatus().name().equals(status))
                .map(c -> mapCount(c, false))
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("items", items);
        result.put("page", page);
        result.put("pageSize", size);
        result.put("totalItems", countsPage.getTotalElements());
        result.put("totalPages", countsPage.getTotalPages());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/counts/{id}")
    public ResponseEntity<Map<String, Object>> getCount(@PathVariable Long id) {
        return countRepo.findById(id)
                .map(c -> ResponseEntity.ok(mapCount(c, true)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/counts")
    @com.chuanphat.warranty.audit.annotation.Audited(action = com.chuanphat.warranty.audit.enums.AuditAction.CREATE, module = com.chuanphat.warranty.audit.enums.AuditModule.INVENTORY, entityType = "InventoryCount")
    public ResponseEntity<Map<String, Object>> createCount(
            @RequestBody Map<String, Object> payload, Authentication auth) {
        InventoryCount c = new InventoryCount();
        c.setCountNo(payload.containsKey("countNo") && payload.get("countNo") != null 
                ? payload.get("countNo").toString() : "KK" + System.currentTimeMillis());
        
        if (payload.containsKey("countDate") && payload.get("countDate") != null) {
            c.setCountDate(LocalDate.parse(payload.get("countDate").toString().substring(0, 10)));
        } else {
            c.setCountDate(LocalDate.now());
        }
        
        if (payload.containsKey("warehouseId") && payload.get("warehouseId") != null) {
            warehouseRepo.findById(Long.valueOf(payload.get("warehouseId").toString())).ifPresent(c::setWarehouse);
        }
        
        if (payload.containsKey("branchId") && payload.get("branchId") != null) {
            c.setBranchId(Long.valueOf(payload.get("branchId").toString()));
        }
        
        c.setNote(payload.containsKey("description") && payload.get("description") != null 
                ? payload.get("description").toString() : null);
        c.setStatus(InventoryCountStatus.DRAFT);
        c.setCreatedBy(auth != null ? auth.getName() : "system");

        List<InventoryCountItem> items = new ArrayList<>();
        if (payload.containsKey("items") && payload.get("items") != null) {
            List<Map<String, Object>> itemsList = (List<Map<String, Object>>) payload.get("items");
            for (Map<String, Object> it : itemsList) {
                InventoryCountItem item = new InventoryCountItem();
                item.setCount(c);
                if (it.containsKey("productId") && it.get("productId") != null) {
                    productRepo.findById(Long.valueOf(it.get("productId").toString())).ifPresent(item::setProduct);
                }
                item.setSystemQuantity(it.containsKey("systemQuantity") && it.get("systemQuantity") != null 
                        ? Integer.parseInt(it.get("systemQuantity").toString()) : 0);
                item.setCountedQuantity(it.containsKey("actualQuantity") && it.get("actualQuantity") != null 
                        ? Integer.parseInt(it.get("actualQuantity").toString()) : 0);
                // variance is automatically calculated by item
                items.add(item);
            }
        }
        c.getItems().clear();
        c.getItems().addAll(items);

        countRepo.save(c);
        return ResponseEntity.ok(mapCount(c, true));
    }

    @PutMapping("/counts/{id}")
    @com.chuanphat.warranty.audit.annotation.Audited(action = com.chuanphat.warranty.audit.enums.AuditAction.UPDATE, module = com.chuanphat.warranty.audit.enums.AuditModule.INVENTORY, entityType = "InventoryCount")
    public ResponseEntity<Map<String, Object>> updateCount(
            @PathVariable Long id, @RequestBody Map<String, Object> payload, Authentication auth) {
        return countRepo.findById(id).map(c -> {
            if (c.getStatus() != InventoryCountStatus.DRAFT) {
                throw new IllegalStateException("Chỉ được sửa phiếu Nháp");
            }
            if (payload.containsKey("countDate") && payload.get("countDate") != null) {
                c.setCountDate(LocalDate.parse(payload.get("countDate").toString().substring(0, 10)));
            }
            if (payload.containsKey("warehouseId") && payload.get("warehouseId") != null) {
                warehouseRepo.findById(Long.valueOf(payload.get("warehouseId").toString())).ifPresent(c::setWarehouse);
            }
            if (payload.containsKey("description") && payload.get("description") != null) {
                c.setNote(payload.get("description").toString());
            }

            if (payload.containsKey("items") && payload.get("items") != null) {
                c.getItems().clear(); // Clear existing
                List<Map<String, Object>> itemsList = (List<Map<String, Object>>) payload.get("items");
                for (Map<String, Object> it : itemsList) {
                    InventoryCountItem item = new InventoryCountItem();
                    item.setCount(c);
                    if (it.containsKey("productId") && it.get("productId") != null) {
                        productRepo.findById(Long.valueOf(it.get("productId").toString())).ifPresent(item::setProduct);
                    }
                    item.setSystemQuantity(it.containsKey("systemQuantity") && it.get("systemQuantity") != null 
                            ? Integer.parseInt(it.get("systemQuantity").toString()) : 0);
                    item.setCountedQuantity(it.containsKey("actualQuantity") && it.get("actualQuantity") != null 
                            ? Integer.parseInt(it.get("actualQuantity").toString()) : 0);
                    c.getItems().add(item);
                }
            }
            
            countRepo.save(c);
            return ResponseEntity.ok(mapCount(c, true));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/counts/{id}/approve")
    @com.chuanphat.warranty.audit.annotation.Audited(action = com.chuanphat.warranty.audit.enums.AuditAction.APPROVE, module = com.chuanphat.warranty.audit.enums.AuditModule.INVENTORY, entityType = "InventoryCount")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Map<String, Object>> approveCount(
            @PathVariable Long id, Authentication auth) {
        return countRepo.findById(id).map(c -> {
            if (c.getStatus() != InventoryCountStatus.DRAFT) {
                throw new IllegalStateException("Chỉ được duyệt phiếu Nháp");
            }
            String currentUser = auth != null ? auth.getName() : "system";
            boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            
            if (!isAdmin && c.getCreatedBy() != null && c.getCreatedBy().equals(currentUser)) {
                throw new IllegalStateException("Lỗi phân quyền: Người tạo phiếu không được phép tự duyệt phiếu (Maker-Checker)");
            }
            
            // Logic: sinh ra điều chỉnh kho nếu có chênh lệch
            for (InventoryCountItem item : c.getItems()) {
                int diff = item.getCountedQuantity() - item.getSystemQuantity();
                if (diff != 0) {
                    // Update InventoryStock
                    InventoryStock stock = stockRepo.findWithLockByBranchIdAndWarehouseIdAndProductId(
                            c.getBranchId(), c.getWarehouse().getId(), item.getProduct().getId()
                    ).orElseGet(() -> {
                        InventoryStock newStock = new InventoryStock();
                        newStock.setBranchId(c.getBranchId());
                        newStock.setWarehouse(c.getWarehouse());
                        newStock.setProduct(item.getProduct());
                        newStock.setQuantity(0);
                        return newStock;
                    });
                    
                    stock.setQuantity(stock.getQuantity() + diff);
                    stockRepo.save(stock);
                    
                    // Transaction
                    InventoryTransaction tx = new InventoryTransaction();
                    tx.setType(diff > 0 ? InventoryTransactionType.COUNT_ADJUSTMENT_IN : InventoryTransactionType.COUNT_ADJUSTMENT_OUT);
                    tx.setTransactionNo("TX-" + c.getCountNo() + "-" + System.currentTimeMillis());
                    tx.setTransactionDate(c.getCountDate());
                    tx.setProduct(item.getProduct());
                    if (diff > 0) {
                        tx.setToBranchId(c.getBranchId());
                        tx.setToWarehouseId(c.getWarehouse().getId());
                    } else {
                        tx.setFromBranchId(c.getBranchId());
                        tx.setFromWarehouseId(c.getWarehouse().getId());
                    }
                    tx.setQuantity(Math.abs(diff));
                    tx.setReferenceType("INVENTORY_COUNT");
                    tx.setReferenceNo(c.getCountNo());
                    tx.setCreatedBy(currentUser);
                    transactionRepo.save(tx);
                }
            }

            c.setStatus(InventoryCountStatus.APPROVED);
            countRepo.save(c);
            return ResponseEntity.ok(mapCount(c, true));
        }).orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> mapCount(InventoryCount c, boolean includeItems) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("countNo", c.getCountNo());
        m.put("countDate", c.getCountDate());
        m.put("countTime", null);
        m.put("warehouseName", c.getWarehouse() != null ? c.getWarehouse().getWarehouseName() : null);
        m.put("countToDate", c.getCountDate());
        m.put("purpose", c.getNote());
        m.put("conclusion", null);
        m.put("isProcessed", c.getStatus().name().equals("APPROVED"));
        m.put("status", c.getStatus().name());
        m.put("branchId", c.getBranchId());
        m.put("branchName", null);

        if (includeItems) {
            List<Map<String, Object>> items = c.getItems().stream().map(it -> {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", it.getId());
                item.put("productId", it.getProduct() != null ? it.getProduct().getId() : null);
                item.put("productCode", it.getProduct() != null ? it.getProduct().getProductCode() : "");
                item.put("productName", it.getProduct() != null ? it.getProduct().getProductName() : "");
                item.put("warehouseCode", c.getWarehouse() != null ? c.getWarehouse().getWarehouseCode() : null);
                item.put("unitOfMeasure", it.getProduct() != null ? it.getProduct().getPrimaryUnit() : null);
                item.put("variantSpec", null);
                int sysQty = it.getSystemQuantity();
                Integer cntQty = it.getCountedQuantity();
                int diffQty = (cntQty != null ? cntQty : 0) - sysQty;
                item.put("systemQuantity", BigDecimal.valueOf(sysQty));
                item.put("countedQuantity", BigDecimal.valueOf(cntQty != null ? cntQty : 0));
                item.put("differenceQuantity", BigDecimal.valueOf(diffQty));
                item.put("unitCost", BigDecimal.ZERO);
                item.put("systemValue", BigDecimal.ZERO);
                item.put("countedValue", BigDecimal.ZERO);
                return item;
            }).collect(Collectors.toList());
            m.put("items", items);
        }
        return m;
    }

    // ═══════════════════════════════════════════════════════
    // PRODUCTS — HÀNG HÓA, DỊCH VỤ
    // ═══════════════════════════════════════════════════════

    @GetMapping("/products")
    public ResponseEntity<PageResponse<InventoryProductResponse>> listProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String productGroup,
            @RequestParam(required = false) String productNature,
            @RequestParam(required = false) Boolean lowStock,
            @RequestParam(required = false) Boolean outOfStock) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("productCode").ascending());
        Page<Product> productPage = productRepo.findAll(pageable);

        List<InventoryProductResponse> items = productPage.getContent().stream()
                .filter(p -> keyword == null || keyword.isBlank()
                        || p.getProductCode().toLowerCase().contains(keyword.toLowerCase())
                        || p.getProductName().toLowerCase().contains(keyword.toLowerCase()))
                .filter(p -> productGroup == null || productGroup.isBlank()
                        || Objects.equals(p.getProductGroup(), productGroup))
                .filter(p -> productNature == null || productNature.isBlank()
                        || Objects.equals(p.getProductNature(), productNature))
                .map(p -> new InventoryProductResponse(
                        p.getId(),
                        p.getProductCode(),
                        p.getProductName(),
                        p.getProductNature() != null ? p.getProductNature() : "GOODS",
                        p.getProductGroup(),
                        p.getTaxReductionCode(),
                        p.getPrimaryUnit(),
                        p.getInventoryStockQuantity(),
                        p.getInventoryStockValue() != null ? p.getInventoryStockValue() : BigDecimal.ZERO,
                        p.getMinQuantity() != null ? p.getMinQuantity() : BigDecimal.ZERO,
                        p.getDescription(),
                        p.getDefaultWarehouse() != null ? p.getDefaultWarehouse().getWarehouseName() : null,
                        p.getInventoryAccount() != null ? p.getInventoryAccount() : "156",
                        p.getImportPrice()
                ))
                .collect(Collectors.toList());

        PageResponse<InventoryProductResponse> response = new PageResponse<>(
                items,
                page,
                size,
                productPage.getTotalElements(),
                productPage.getTotalPages()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<InventoryProductResponse> getProductById(@PathVariable Long id) {
        Product p = productRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        InventoryProductResponse resp = new InventoryProductResponse(
                p.getId(),
                p.getProductCode(),
                p.getProductName(),
                p.getProductNature() != null ? p.getProductNature() : "GOODS",
                p.getProductGroup(),
                p.getTaxReductionCode(),
                p.getPrimaryUnit(),
                p.getInventoryStockQuantity(),
                p.getInventoryStockValue() != null ? p.getInventoryStockValue() : BigDecimal.ZERO,
                p.getMinQuantity() != null ? p.getMinQuantity() : BigDecimal.ZERO,
                p.getDescription(),
                p.getDefaultWarehouse() != null ? p.getDefaultWarehouse().getWarehouseName() : null,
                p.getInventoryAccount() != null ? p.getInventoryAccount() : "156",
                p.getImportPrice()
        );
        return ResponseEntity.ok(resp);
    }



    @GetMapping("/products/summary")
    public ResponseEntity<Map<String, Object>> getProductSummary() {
        List<Product> all = productRepo.findAll();
        long lowStockCount = all.stream()
                .filter(p -> p.getInventoryStockQuantity() != null
                        && p.getInventoryStockQuantity().compareTo(BigDecimal.TEN) <= 0
                        && p.getInventoryStockQuantity().compareTo(BigDecimal.ZERO) > 0)
                .count();
        long outOfStockCount = all.stream()
                .filter(p -> p.getInventoryStockQuantity() == null
                        || p.getInventoryStockQuantity().compareTo(BigDecimal.ZERO) <= 0)
                .count();
        long totalSkus = all.size();
        BigDecimal totalValue = all.stream()
                .map(p -> p.getInventoryStockValue() != null ? p.getInventoryStockValue() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalSkus", totalSkus);
        result.put("lowStockCount", lowStockCount);
        result.put("outOfStockCount", outOfStockCount);
        result.put("totalStockValue", totalValue);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/products/groups")
    public ResponseEntity<List<String>> getProductGroups() {
        List<String> groups = productRepo.findAll().stream()
                .map(Product::getProductGroup)
                .filter(g -> g != null && !g.isBlank())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        return ResponseEntity.ok(groups);
    }

    // ═══════════════════════════════════════════════════════
    // WAREHOUSES — DANH SÁCH KHO
    // ═══════════════════════════════════════════════════════

    @GetMapping("/warehouses")
    public ResponseEntity<Map<String, Object>> listWarehouses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("warehouseCode").ascending());
        Page<Warehouse> warehousePage = warehouseRepo.findAll(pageable);

        List<Map<String, Object>> items = warehousePage.getContent().stream()
                .filter(w -> branchId == null || Objects.equals(w.getBranchId(), branchId))
                .filter(w -> keyword == null || keyword.isBlank()
                        || w.getWarehouseCode().toLowerCase().contains(keyword.toLowerCase())
                        || w.getWarehouseName().toLowerCase().contains(keyword.toLowerCase()))
                .map(w -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", w.getId());
                    m.put("warehouseCode", w.getWarehouseCode());
                    m.put("warehouseName", w.getWarehouseName());
                    m.put("branchId", w.getBranchId());
                    m.put("type", w.getType().name());
                    m.put("status", w.getStatus().name());
                    m.put("locationAisle", w.getLocationAisle());
                    m.put("locationShelf", w.getLocationShelf());
                    m.put("locationBin", w.getLocationBin());
                    m.put("description", w.getDescription());
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("items", items);
        result.put("page", page);
        result.put("pageSize", size);
        result.put("totalItems", warehousePage.getTotalElements());
        result.put("totalPages", warehousePage.getTotalPages());
        return ResponseEntity.ok(result);
    }

    // ═══════════════════════════════════════════════════════
    // REPORTS — BÁO CÁO KHO
    // ═══════════════════════════════════════════════════════

    @GetMapping("/reports/stock-summary")
    public ResponseEntity<List<Map<String, Object>>> getStockSummaryReport(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) String productGroup,
            @RequestParam(required = false) String keyword,
            org.springframework.security.core.Authentication auth) {

        String username = auth != null ? auth.getName() : "system";
        boolean hasCrossWarehouseView = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_CHIEF_ACCOUNTANT"));

        List<Long> allowedWarehouseIds = null;
        if (!hasCrossWarehouseView) {
            allowedWarehouseIds = employeeWarehouseRepo.findByUsername(username).stream()
                    .map(ew -> ew.getWarehouse().getId())
                    .collect(Collectors.toList());
        }

        List<InventoryStock> stocks = branchId != null
                ? stockRepo.findByBranchId(branchId)
                : stockRepo.findAll();

        final List<Long> finalAllowedWarehouseIds = allowedWarehouseIds;

        List<Map<String, Object>> result = stocks.stream()
                .filter(s -> hasCrossWarehouseView || (finalAllowedWarehouseIds != null && s.getWarehouse() != null && finalAllowedWarehouseIds.contains(s.getWarehouse().getId())))
                .filter(s -> warehouseId == null || (s.getWarehouse() != null && s.getWarehouse().getId().equals(warehouseId)))
                .filter(s -> keyword == null || keyword.isBlank()
                        || (s.getProduct() != null && (
                        s.getProduct().getProductCode().toLowerCase().contains(keyword.toLowerCase())
                                || s.getProduct().getProductName().toLowerCase().contains(keyword.toLowerCase()))))
                .map(s -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("productCode", s.getProduct() != null ? s.getProduct().getProductCode() : "");
                    m.put("productName", s.getProduct() != null ? s.getProduct().getProductName() : "");
                    m.put("productGroup", s.getProduct() != null ? s.getProduct().getProductGroup() : null);
                    m.put("unit", s.getProduct() != null ? s.getProduct().getPrimaryUnit() : null);
                    m.put("openingQty", BigDecimal.ZERO);
                    m.put("openingValue", BigDecimal.ZERO);
                    m.put("importQty", BigDecimal.ZERO);
                    m.put("importValue", BigDecimal.ZERO);
                    m.put("exportQty", BigDecimal.ZERO);
                    m.put("exportValue", BigDecimal.ZERO);
                    BigDecimal qty = BigDecimal.valueOf(s.getQuantity());
                    BigDecimal cost = BigDecimal.ZERO;
                    m.put("closingQty", qty);
                    m.put("closingValue", qty.multiply(cost));
                    m.put("unitCost", cost);
                    return m;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/reports/stock-detail")
    public ResponseEntity<Map<String, Object>> getStockDetailReport(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("openingBalance", 0);
        result.put("transactions", List.of());
        result.put("closingBalance", 0);
        return ResponseEntity.ok(result);
    }
}


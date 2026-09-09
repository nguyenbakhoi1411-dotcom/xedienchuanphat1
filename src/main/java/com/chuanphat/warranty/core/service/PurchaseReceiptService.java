package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.dto.PurchaseReceiptDto;
import com.chuanphat.warranty.core.dto.PurchaseReceiptItemRequest;
import com.chuanphat.warranty.core.dto.PurchaseReceiptRequest;
import com.chuanphat.warranty.core.entity.*;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.ReceiptStatus;
import com.chuanphat.warranty.core.enums.SerialStatus;
import com.chuanphat.warranty.core.enums.InventoryTransactionType;
import com.chuanphat.warranty.core.repository.*;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.ConflictException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * PurchaseReceiptService — Quan ly phieu nhap kho.
 *
 * Luong: DRAFT → confirm() → CONFIRMED
 *   - Xe dien: tao ProductSerial tu frameNumber/engineNumber/batterySerial
 *   - Phu tung: tang InventoryStock + updateAverageCost
 *   - Ghi InventoryTransaction(PURCHASE_RECEIPT) cho tung dong
 *   - Cap nhat PurchaseOrder.stockReceived = true neu co PO
 */
@Service
@Transactional
public class PurchaseReceiptService {

    private final PurchaseReceiptRepository receiptRepo;
    private final ProductRepository productRepo;
    private final SupplierRepository supplierRepo;
    private final WarehouseRepository warehouseRepo;
    private final PurchaseOrderRepository poRepo;
    private final ProductSerialRepository serialRepo;
    private final InventoryService inventoryService;
    private final PayableService payableService;
    private final PurchaseOrderService purchaseOrderService;
    private final BranchSecurity branchSecurity;

    public PurchaseReceiptService(
            PurchaseReceiptRepository receiptRepo,
            ProductRepository productRepo,
            SupplierRepository supplierRepo,
            WarehouseRepository warehouseRepo,
            PurchaseOrderRepository poRepo,
            ProductSerialRepository serialRepo,
            InventoryService inventoryService,
            PayableService payableService,
            PurchaseOrderService purchaseOrderService,
            BranchSecurity branchSecurity
    ) {
        this.receiptRepo = receiptRepo;
        this.productRepo = productRepo;
        this.supplierRepo = supplierRepo;
        this.warehouseRepo = warehouseRepo;
        this.poRepo = poRepo;
        this.serialRepo = serialRepo;
        this.inventoryService = inventoryService;
        this.payableService = payableService;
        this.purchaseOrderService = purchaseOrderService;
        this.branchSecurity = branchSecurity;
    }

    // ──────────────────────────────────────────────
    // QUERY
    // ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PageResponse<PurchaseReceiptDto> list(Long branchId, ReceiptStatus status, int page, int size) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (scopedBranchId == null) {
            if (status != null) return PageResponse.from(receiptRepo.findByStatus(status, pageable).map(PurchaseReceiptDto::from));
            return PageResponse.from(receiptRepo.findAll(pageable).map(PurchaseReceiptDto::from));
        }
        if (status != null) return PageResponse.from(receiptRepo.findByBranchIdAndStatus(scopedBranchId, status, pageable).map(PurchaseReceiptDto::from));
        return PageResponse.from(receiptRepo.findByBranchId(scopedBranchId, pageable).map(PurchaseReceiptDto::from));
    }

    @Transactional(readOnly = true)
    public PurchaseReceiptDto get(Long id) {
        return PurchaseReceiptDto.from(findById(id));
    }

    // ──────────────────────────────────────────────
    // CREATE
    // ──────────────────────────────────────────────

    public PurchaseReceiptDto create(PurchaseReceiptRequest req) {
        branchSecurity.requireBranchAccess(req.branchId());

        Supplier supplier = supplierRepo.findById(req.supplierId())
                .orElseThrow(() -> new BusinessException("Khong tim thay nha cung cap: " + req.supplierId()));

        Warehouse warehouse = null;
        if (req.warehouseId() != null) {
            warehouse = warehouseRepo.findById(req.warehouseId())
                    .orElseThrow(() -> new BusinessException("Khong tim thay kho: " + req.warehouseId()));
            if (!warehouse.getBranchId().equals(req.branchId())) {
                throw new BusinessException("Kho khong thuoc chi nhanh nay");
            }
        }

        PurchaseReceipt receipt = new PurchaseReceipt();
        receipt.setReceiptNo(generateReceiptNo());
        receipt.setSupplier(supplier);
        receipt.setBranchId(req.branchId());
        receipt.setWarehouse(warehouse);
        receipt.setPurchaseOrderId(req.purchaseOrderId());
        receipt.setReceiptDate(req.receiptDate() != null ? req.receiptDate() : LocalDate.now());
        receipt.setNote(req.note());
        receipt.setCreatedBy(currentUsername());

        BigDecimal total = BigDecimal.ZERO;
        for (PurchaseReceiptItemRequest itemReq : req.items()) {
            Product product = productRepo.findById(itemReq.productId())
                    .orElseThrow(() -> new BusinessException("Khong tim thay san pham: " + itemReq.productId()));
            PurchaseReceiptItem item = new PurchaseReceiptItem();
            item.setProduct(product);
            item.setQuantity(itemReq.quantity());
            item.setUnitCost(itemReq.unitCost());
            item.setLineTotal(itemReq.unitCost().multiply(BigDecimal.valueOf(itemReq.quantity())));
            item.setFrameNumber(itemReq.frameNumber());
            item.setEngineNumber(itemReq.engineNumber());
            item.setBatterySerial(itemReq.batterySerial());
            item.setNote(itemReq.note());
            receipt.addItem(item);
            total = total.add(item.getLineTotal());
        }
        receipt.setTotalAmount(total);
        return PurchaseReceiptDto.from(receiptRepo.save(receipt));
    }

    // ──────────────────────────────────────────────
    // CONFIRM — nhap kho thuc su
    // ──────────────────────────────────────────────

    public PurchaseReceiptDto confirm(Long id) {
        PurchaseReceipt receipt = findById(id);
        branchSecurity.requireBranchAccess(receipt.getBranchId());

        if (receipt.getStatus() != ReceiptStatus.DRAFT) {
            throw new BusinessException("Chi co the xac nhan phieu o trang thai DRAFT");
        }

        // Lay warehouse hieu qua
        Warehouse effectiveWarehouse = resolveEffectiveWarehouse(receipt);

        for (PurchaseReceiptItem item : receipt.getItems()) {
            Product product = item.getProduct();
            BigDecimal beforeCost = inventoryService.getAverageCost(receipt.getBranchId(), effectiveWarehouse.getId(), product.getId());
            item.setGiaVonTruocNhap(beforeCost);

            if (product.getCategory() == ProductCategory.ELECTRIC_MOTORBIKE) {
                // Xe dien: tao serial
                confirmVehicleItem(receipt, item, product, effectiveWarehouse);
            } else {
                // Phu tung / phu kien: tang so luong
                inventoryService.increase(receipt.getBranchId(), effectiveWarehouse, product,
                        item.getQuantity(), item.getUnitCost());
            }

            BigDecimal afterCost = inventoryService.getAverageCost(receipt.getBranchId(), effectiveWarehouse.getId(), product.getId());
            item.setGiaVonSauNhap(afterCost);
        }

        receipt.setStatus(ReceiptStatus.CONFIRMED);
        receipt.setConfirmedBy(currentUsername());
        receipt.setConfirmedAt(OffsetDateTime.now());
        PurchaseReceipt saved = receiptRepo.save(receipt);

        // Tao Payable (cong no phai tra NCC)
        int paymentTermsDays = receipt.getSupplier().getPaymentTermsDays();
        payableService.createFromReceipt(
                receipt.getSupplier().getId(),
                receipt.getBranchId(),
                saved.getId(),
                saved.getReceiptNo(),
                saved.getTotalAmount(),
                paymentTermsDays
        );

        // Cap nhat PO neu co
        if (receipt.getPurchaseOrderId() != null) {
            // Kiem tra con phieu nhap DRAFT khac cua PO khong
            long remainingDraft = receiptRepo.countByPurchaseOrderIdAndStatus(
                    receipt.getPurchaseOrderId(), ReceiptStatus.DRAFT);
            if (remainingDraft == 0) {
                purchaseOrderService.markFullyReceived(receipt.getPurchaseOrderId());
            } else {
                purchaseOrderService.markPartiallyReceived(receipt.getPurchaseOrderId());
            }
        }

        return PurchaseReceiptDto.from(saved);
    }

    // ──────────────────────────────────────────────
    // CANCEL
    // ──────────────────────────────────────────────

    public PurchaseReceiptDto cancel(Long id) {
        PurchaseReceipt receipt = findById(id);
        branchSecurity.requireBranchAccess(receipt.getBranchId());
        if (receipt.getStatus() == ReceiptStatus.CONFIRMED) {
            throw new BusinessException("Khong the huy phieu da xac nhan. Tao phieu dieu chinh thay.");
        }
        receipt.setStatus(ReceiptStatus.CANCELLED);
        return PurchaseReceiptDto.from(receiptRepo.save(receipt));
    }

    // ──────────────────────────────────────────────
    // PRIVATE HELPERS
    // ──────────────────────────────────────────────

    private void confirmVehicleItem(PurchaseReceipt receipt, PurchaseReceiptItem item,
                                     Product product, Warehouse warehouse) {
        // Xu ly tung chiec xe (quantity co the > 1 nhung thuong = 1 cho xe)
        String frameNo = item.getFrameNumber();
        String engineNo = item.getEngineNumber();
        String batteryNo = item.getBatterySerial();

        // Validation
        if (frameNo != null && !frameNo.isBlank() && serialRepo.existsByFrameNumberIgnoreCase(frameNo)) {
            throw new ConflictException("So khung da ton tai: " + frameNo);
        }
        if (batteryNo != null && !batteryNo.isBlank() && serialRepo.existsByBatterySerialIgnoreCase(batteryNo)) {
            throw new ConflictException("So pin da ton tai: " + batteryNo);
        }
        if (engineNo != null && !engineNo.isBlank() && serialRepo.existsByEngineNumberIgnoreCase(engineNo)) {
            throw new ConflictException("So may da ton tai: " + engineNo);
        }

        ProductSerial serial = new ProductSerial();
        String serialNumber = "XE-" + receipt.getBranchId() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        serial.setSerialNumber(serialNumber);
        serial.setProduct(product);
        serial.setBranchId(receipt.getBranchId());
        serial.setWarehouse(warehouse);
        serial.setFrameNumber(frameNo);
        serial.setEngineNumber(engineNo);
        serial.setBatterySerial(batteryNo);
        serial.setImportDate(receipt.getReceiptDate());
        serial.setSupplierId(receipt.getSupplier().getId());
        serial.setPurchaseCost(item.getUnitCost());
        serial.setStatus(SerialStatus.IN_STOCK);

        serialRepo.save(serial);
        item.setSerialNumber(serialNumber);

        // Tang ton kho 1 don vi cho xe (theo serial, khong theo quantity)
        inventoryService.increase(receipt.getBranchId(), warehouse, product, 1, item.getUnitCost());
    }

    private Warehouse resolveEffectiveWarehouse(PurchaseReceipt receipt) {
        if (receipt.getWarehouse() != null) return receipt.getWarehouse();
        // Tim kho chinh cua chi nhanh
        return warehouseRepo.findByBranchIdAndTypeAndStatus(
                        receipt.getBranchId(),
                        com.chuanphat.warranty.core.enums.WarehouseType.MAIN,
                        com.chuanphat.warranty.core.enums.RecordStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException("Khong tim thay kho chinh cho chi nhanh: " + receipt.getBranchId()));
    }

    private PurchaseReceipt findById(Long id) {
        return receiptRepo.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay phieu nhap: " + id));
    }

    private String generateReceiptNo() {
        int seq = receiptRepo.findMaxReceiptSeq() + 1;
        return String.format("GNK%05d", seq);
    }

    private String currentUsername() {
        try { return branchSecurity.currentUser().getUsername(); }
        catch (Exception e) { return "SYSTEM"; }
    }
}

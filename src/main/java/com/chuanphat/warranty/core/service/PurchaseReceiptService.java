package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.dto.PurchaseReceiptDto;
import com.chuanphat.warranty.core.dto.PurchaseReceiptItemRequest;
import com.chuanphat.warranty.core.dto.PurchaseReceiptRequest;
import com.chuanphat.warranty.core.entity.*;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.PurchaseOrderStatus;
import com.chuanphat.warranty.core.enums.ReceiptStatus;
import com.chuanphat.warranty.core.enums.SerialStatus;
import com.chuanphat.warranty.core.enums.InventoryTransactionType;
import com.chuanphat.warranty.core.repository.*;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.ConflictException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * PurchaseReceiptService — Quan ly phieu nhap kho.
 *
 * Luong: DRAFT → confirm() → CONFIRMED
 *   - Phieu moi bat buoc tham chieu PurchaseOrder da duoc duyet
 *   - Xe dien: tao ProductSerial tu frameNumber/engineNumber/batterySerial
 *   - Phu tung: tang InventoryStock + updateAverageCost
 *   - Ghi InventoryTransaction(PURCHASE_RECEIPT) cho tung dong
 *   - Cap nhat PurchaseOrder theo so luong thuc nhap
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
        PurchaseOrder purchaseOrder = requireReceivablePurchaseOrder(req.purchaseOrderId(), req.supplierId(), req.branchId());
        Map<Long, Integer> orderedQuantities = orderedQuantitiesByProduct(purchaseOrder);
        Map<Long, Integer> requestedQuantities = requestedQuantitiesByProduct(req.items());
        validateRequestedQuantities(purchaseOrder.getId(), orderedQuantities, requestedQuantities);

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
        receipt.setPurchaseOrderId(purchaseOrder.getId());
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
            if (product.getCategory() == ProductCategory.ELECTRIC_MOTORBIKE) {
                // Xe dien: tao serial
                confirmVehicleItem(receipt, item, product, effectiveWarehouse);
            } else {
                // Phu tung / phu kien: tang so luong
                inventoryService.increase(receipt.getBranchId(), effectiveWarehouse, product,
                        item.getQuantity(), item.getUnitCost());
            }
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

        // Cap nhat PO neu co. Du lieu cu co the co phieu nhap khong gan PO.
        if (receipt.getPurchaseOrderId() != null) {
            if (isPurchaseOrderFullyReceived(receipt.getPurchaseOrderId())) {
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

    private PurchaseOrder requireReceivablePurchaseOrder(Long purchaseOrderId, Long supplierId, Long branchId) {
        if (purchaseOrderId == null) {
            throw new BusinessException("Phieu nhap kho phai tham chieu don mua hang da duyet");
        }
        PurchaseOrder purchaseOrder = poRepo.findById(purchaseOrderId)
                .orElseThrow(() -> new BusinessException("Khong tim thay don mua hang: " + purchaseOrderId));
        branchSecurity.requireBranchAccess(purchaseOrder.getBranchId());
        if (!purchaseOrder.getBranchId().equals(branchId)) {
            throw new BusinessException("Chi nhanh phieu nhap khong khop voi don mua hang");
        }
        if (!purchaseOrder.getSupplier().getId().equals(supplierId)) {
            throw new BusinessException("Nha cung cap phieu nhap khong khop voi don mua hang");
        }
        if (purchaseOrder.getStatus() != PurchaseOrderStatus.APPROVED
                && purchaseOrder.getStatus() != PurchaseOrderStatus.PARTIALLY_RECEIVED) {
            throw new BusinessException("Chi duoc tao phieu nhap cho don mua hang da duyet hoac dang nhap mot phan");
        }
        return purchaseOrder;
    }

    private Map<Long, Integer> orderedQuantitiesByProduct(PurchaseOrder purchaseOrder) {
        Map<Long, Integer> quantities = new HashMap<>();
        for (PurchaseOrderItem item : purchaseOrder.getItems()) {
            quantities.merge(item.getProduct().getId(), item.getQuantity(), Integer::sum);
        }
        return quantities;
    }

    private Map<Long, Integer> requestedQuantitiesByProduct(List<PurchaseReceiptItemRequest> items) {
        Map<Long, Integer> quantities = new HashMap<>();
        for (PurchaseReceiptItemRequest item : items) {
            quantities.merge(item.productId(), item.quantity(), Integer::sum);
        }
        return quantities;
    }

    private void validateRequestedQuantities(Long purchaseOrderId,
                                             Map<Long, Integer> orderedQuantities,
                                             Map<Long, Integer> requestedQuantities) {
        for (var entry : requestedQuantities.entrySet()) {
            Long productId = entry.getKey();
            int orderedQuantity = orderedQuantities.getOrDefault(productId, 0);
            if (orderedQuantity == 0) {
                throw new BusinessException("San pham khong nam trong don mua hang: " + productId);
            }
            long alreadyPlannedOrReceived = receiptRepo.sumQuantityByPurchaseOrderIdAndProductIdAndStatusIn(
                    purchaseOrderId, productId, List.of(ReceiptStatus.DRAFT, ReceiptStatus.CONFIRMED));
            if (alreadyPlannedOrReceived + entry.getValue() > orderedQuantity) {
                throw new BusinessException("So luong nhap vuot qua so luong con lai cua don mua hang");
            }
        }
    }

    private boolean isPurchaseOrderFullyReceived(Long purchaseOrderId) {
        PurchaseOrder purchaseOrder = purchaseOrderService.findById(purchaseOrderId);
        for (PurchaseOrderItem item : purchaseOrder.getItems()) {
            long receivedQuantity = receiptRepo.sumQuantityByPurchaseOrderIdAndProductIdAndStatusIn(
                    purchaseOrderId, item.getProduct().getId(), List.of(ReceiptStatus.CONFIRMED));
            if (receivedQuantity < item.getQuantity()) {
                return false;
            }
        }
        return true;
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

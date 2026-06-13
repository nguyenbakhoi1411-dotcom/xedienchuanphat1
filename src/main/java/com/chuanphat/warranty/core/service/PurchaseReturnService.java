package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.entity.*;
import com.chuanphat.warranty.core.enums.SerialStatus;
import com.chuanphat.warranty.core.repository.*;
import com.chuanphat.warranty.exception.BusinessException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * PurchaseReturnService — Tra hang nha cung cap.
 *
 * Luong:
 *   create() -> DRAFT
 *   complete() -> COMPLETED:
 *     1. Xuat kho (tru ton)
 *     2. Doi serial -> RETURNED_TO_SUPPLIER (neu la xe)
 *     3a. DEDUCT_PAYABLE: tim payable cua NCC, tru remainingAmount
 *     3b. CASH_REFUND: ghi nhan NCC phai tra lai tien (tao payable am)
 *
 * cancel() -> CANCELLED (chi DRAFT)
 */
@Service
@Transactional
public class PurchaseReturnService {

    private final PurchaseReturnRepository returnRepo;
    private final PurchaseReturnItemRepository returnItemRepo;
    private final ProductRepository productRepo;
    private final ProductSerialRepository serialRepo;
    private final InventoryService inventoryService;
    private final PayableRepository payableRepo;
    private final PayableService payableService;
    private final SupplierService supplierService;
    private final BranchSecurity branchSecurity;

    public PurchaseReturnService(PurchaseReturnRepository returnRepo,
                                 PurchaseReturnItemRepository returnItemRepo,
                                 ProductRepository productRepo,
                                 ProductSerialRepository serialRepo,
                                 InventoryService inventoryService,
                                 PayableRepository payableRepo,
                                 PayableService payableService,
                                 SupplierService supplierService,
                                 BranchSecurity branchSecurity) {
        this.returnRepo      = returnRepo;
        this.returnItemRepo  = returnItemRepo;
        this.productRepo     = productRepo;
        this.serialRepo      = serialRepo;
        this.inventoryService = inventoryService;
        this.payableRepo     = payableRepo;
        this.payableService  = payableService;
        this.supplierService = supplierService;
        this.branchSecurity  = branchSecurity;
    }

    // ── QUERY ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<PurchaseReturn> list(Long branchId, int page, int size) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (scopedBranchId == null) return returnRepo.findAll(pageable);
        return returnRepo.findByBranchId(scopedBranchId, pageable);
    }

    @Transactional(readOnly = true)
    public PurchaseReturn get(Long id) {
        return findById(id);
    }

    // ── CREATE ─────────────────────────────────────────────────────

    public PurchaseReturn create(Long supplierId, Long branchId, Long purchaseOrderId,
                                  String refundMethod, String reason, String note,
                                  List<ReturnItemRequest> itemRequests) {
        branchSecurity.requireBranchAccess(branchId);
        supplierService.findById(supplierId); // validate NCC

        PurchaseReturn ret = new PurchaseReturn();
        ret.setReturnCode(generateReturnCode());
        ret.setSupplierId(supplierId);
        ret.setBranchId(branchId);
        ret.setPurchaseOrderId(purchaseOrderId);
        ret.setReturnDate(LocalDate.now());
        ret.setRefundMethod(refundMethod != null ? refundMethod : "DEDUCT_PAYABLE");
        ret.setReason(reason);
        ret.setNote(note);
        ret.setStatus("DRAFT");
        ret.setCreatedBy(safeUsername());

        BigDecimal total = BigDecimal.ZERO;
        for (var itemReq : itemRequests) {
            var product = productRepo.findById(itemReq.productId())
                    .orElseThrow(() -> new BusinessException("Sản phẩm không tồn tại: " + itemReq.productId()));
            PurchaseReturnItem item = new PurchaseReturnItem();
            item.setProduct(product);
            item.setQuantity(itemReq.quantity());
            item.setUnitPrice(itemReq.unitPrice());
            item.setLineTotal(itemReq.unitPrice().multiply(BigDecimal.valueOf(itemReq.quantity())));
            if (itemReq.serialId() != null) {
                var serial = serialRepo.findById(itemReq.serialId())
                        .orElseThrow(() -> new BusinessException("Serial không tồn tại: " + itemReq.serialId()));
                item.setSerial(serial);
            }
            ret.addItem(item);
            total = total.add(item.getLineTotal());
        }
        ret.setTotalAmount(total);
        return returnRepo.save(ret);
    }

    // ── COMPLETE ───────────────────────────────────────────────────

    public PurchaseReturn complete(Long id) {
        PurchaseReturn ret = findById(id);
        branchSecurity.requireBranchAccess(ret.getBranchId());
        if (!"DRAFT".equals(ret.getStatus())) {
            throw new BusinessException("Chỉ hoàn tất phiếu DRAFT, hiện tại: " + ret.getStatus());
        }

        // 1. Xuat kho + doi serial
        for (PurchaseReturnItem item : ret.getItems()) {
            if (item.getSerial() != null) {
                // Xe dien: doi serial RETURNED_TO_SUPPLIER
                ProductSerial serial = serialRepo.findWithLockById(item.getSerial().getId())
                        .orElseThrow(() -> new BusinessException("Serial không tìm thấy: " + item.getSerial().getId()));
                if (serial.getStatus() == SerialStatus.SOLD) {
                    throw new BusinessException("Xe đã bán không thể trả nhà cung cấp: " + serial.getSerialNumber());
                }
                serial.setStatus(SerialStatus.RETURNED_TO_SUPPLIER);
                serialRepo.save(serial);
            }
            // Tru ton kho (cho ca xe lan phu tung)
            try {
                inventoryService.decrease(ret.getBranchId(), item.getProduct().getId(), item.getQuantity());
            } catch (Exception e) {
                // Neu xe dien da doi serial -> ton kho co the khong co (inventory_stock)
                // Bo qua loi ton kho neu la xe (item.serial != null)
                if (item.getSerial() == null) throw e;
            }
        }
        ret.setStockReturned(true);

        // 2. Xu ly cong no
        if ("DEDUCT_PAYABLE".equals(ret.getRefundMethod())) {
            // Tim payable cua NCC theo thu tu het han
            List<Payable> openPayables = payableRepo.findOpenPayablesBySupplier(ret.getSupplierId());
            BigDecimal remaining = ret.getTotalAmount();
            for (Payable p : openPayables) {
                if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;
                Payable locked = payableRepo.findWithLockById(p.getId()).orElse(p);
                BigDecimal applied = locked.applyPayment(remaining);
                remaining = remaining.subtract(applied);
                payableRepo.save(locked);
                // Giam currentDebt NCC
                supplierService.decreaseDebt(ret.getSupplierId(), applied);
            }
            ret.setPayableAdjusted(true);
        } else {
            // CASH_REFUND: NCC phai tra lai tien -> tao payable am (ghi nhan NCC no)
            payableService.createReturnCredit(
                ret.getSupplierId(), ret.getBranchId(),
                ret.getId(), ret.getReturnCode(),
                ret.getTotalAmount());
            ret.setPayableAdjusted(true);
            // Giam currentDebt NCC
            supplierService.decreaseDebt(ret.getSupplierId(), ret.getTotalAmount());
        }

        ret.setStatus("COMPLETED");
        ret.setAccountingRecorded(true);
        return returnRepo.save(ret);
    }

    // ── CANCEL ─────────────────────────────────────────────────────

    public PurchaseReturn cancel(Long id) {
        PurchaseReturn ret = findById(id);
        if (!"DRAFT".equals(ret.getStatus())) {
            throw new BusinessException("Chỉ hủy phiếu DRAFT, hiện tại: " + ret.getStatus());
        }
        ret.setStatus("CANCELLED");
        return returnRepo.save(ret);
    }

    // ── REQUEST DTO ───────────────────────────────────────────────

    public record ReturnItemRequest(
            Long productId,
            Long serialId,
            int quantity,
            BigDecimal unitPrice
    ) {}

    // ── HELPERS ────────────────────────────────────────────────────

    private PurchaseReturn findById(Long id) {
        return returnRepo.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy phiếu trả hàng: " + id));
    }

    private String generateReturnCode() {
        long count = returnRepo.count() + 1;
        return String.format("THNCC-%05d", count);
    }

    private String safeUsername() {
        try { return branchSecurity.currentUser().getUsername(); }
        catch (Exception e) { return "SYSTEM"; }
    }
}

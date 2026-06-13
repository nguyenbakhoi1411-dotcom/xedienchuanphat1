package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.dto.PurchaseOrderDto;
import com.chuanphat.warranty.core.dto.PurchaseOrderRequest;
import com.chuanphat.warranty.core.entity.PurchaseOrder;
import com.chuanphat.warranty.core.entity.PurchaseOrderItem;
import com.chuanphat.warranty.core.entity.Supplier;
import com.chuanphat.warranty.core.enums.PurchaseOrderStatus;
import com.chuanphat.warranty.core.repository.PurchaseOrderRepository;
import com.chuanphat.warranty.core.repository.ProductRepository;
import com.chuanphat.warranty.exception.BusinessException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * PurchaseOrderService — Quan ly don mua hang.
 *
 * Luong:
 *   create() -> DRAFT
 *   submit() -> PENDING_APPROVAL (neu vuot nguong) hoac APPROVED (tu dong duyet)
 *   approve() / reject() -> APPROVED / REJECTED
 *   cancel() -> CANCELLED (chi DRAFT / PENDING_APPROVAL)
 *
 * Sau khi APPROVED:
 *   PurchaseReceiptService.create(purchaseOrderId=...) -> nhap kho
 *   Receipt.confirm() -> cap nhat PARTIALLY_RECEIVED / RECEIVED
 */
@Service
@Transactional
public class PurchaseOrderService {

    private final PurchaseOrderRepository poRepo;
    private final ProductRepository productRepo;
    private final SupplierService supplierService;
    private final BranchSecurity branchSecurity;

    public PurchaseOrderService(PurchaseOrderRepository poRepo,
                                ProductRepository productRepo,
                                SupplierService supplierService,
                                BranchSecurity branchSecurity) {
        this.poRepo = poRepo;
        this.productRepo = productRepo;
        this.supplierService = supplierService;
        this.branchSecurity = branchSecurity;
    }

    // ── QUERY ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PageResponse<PurchaseOrderDto> list(Long branchId, PurchaseOrderStatus status, Long supplierId, int page, int size) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        if (supplierId != null) {
            return PageResponse.from(poRepo.findBySupplier_Id(supplierId, pageable).map(PurchaseOrderDto::from));
        }
        if (scopedBranchId == null) {
            if (status != null) return PageResponse.from(poRepo.findByStatus(status, pageable).map(PurchaseOrderDto::from));
            return PageResponse.from(poRepo.findAll(pageable).map(PurchaseOrderDto::from));
        }
        if (status != null) return PageResponse.from(poRepo.findByBranchIdAndStatus(scopedBranchId, status, pageable).map(PurchaseOrderDto::from));
        return PageResponse.from(poRepo.findByBranchId(scopedBranchId, pageable).map(PurchaseOrderDto::from));
    }

    @Transactional(readOnly = true)
    public PurchaseOrderDto get(Long id) {
        return PurchaseOrderDto.from(findById(id));
    }

    // ── CREATE ─────────────────────────────────────────────────────

    public PurchaseOrderDto create(PurchaseOrderRequest req) {
        branchSecurity.requireBranchAccess(req.branchId());
        Supplier supplier = supplierService.findById(req.supplierId());

        PurchaseOrder po = new PurchaseOrder();
        po.setPurchaseOrderNo(generatePoNo());
        po.setSupplier(supplier);
        po.setBranchId(req.branchId());
        po.setStatus(PurchaseOrderStatus.DRAFT);
        po.setPurchaseDate(req.purchaseDate() != null ? req.purchaseDate() : LocalDate.now());
        po.setExpectedDelivery(req.expectedDelivery());
        po.setNote(req.note());
        po.setCreatedBy(currentUsername());

        BigDecimal total = BigDecimal.ZERO;
        for (var itemReq : req.items()) {
            var product = productRepo.findById(itemReq.productId())
                    .orElseThrow(() -> new BusinessException("Không tìm thấy sản phẩm: " + itemReq.productId()));
            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setProduct(product);
            item.setQuantity(itemReq.quantity());
            item.setUnitCost(itemReq.unitCost());
            item.setLineTotal(itemReq.unitCost().multiply(BigDecimal.valueOf(itemReq.quantity())));
            po.addItem(item);
            total = total.add(item.getLineTotal());
        }
        po.setTotalAmount(total);
        return PurchaseOrderDto.from(poRepo.save(po));
    }

    // ── SUBMIT ─────────────────────────────────────────────────────

    public PurchaseOrderDto submit(Long id) {
        PurchaseOrder po = findById(id);
        branchSecurity.requireBranchAccess(po.getBranchId());
        requireStatus(po, PurchaseOrderStatus.DRAFT);

        po.setSubmittedAt(OffsetDateTime.now());
        po.setSubmittedBy(currentUsername());

        if (po.requiresApproval()) {
            po.setStatus(PurchaseOrderStatus.PENDING_APPROVAL);
        } else {
            // Tu dong duyet neu nho hon nguong
            po.setStatus(PurchaseOrderStatus.APPROVED);
            po.setApprovedAt(OffsetDateTime.now());
            po.setApprovedBy("AUTO");
        }
        return PurchaseOrderDto.from(poRepo.save(po));
    }

    // ── APPROVE ────────────────────────────────────────────────────

    public PurchaseOrderDto approve(Long id) {
        PurchaseOrder po = findById(id);
        requireStatus(po, PurchaseOrderStatus.PENDING_APPROVAL);
        po.setStatus(PurchaseOrderStatus.APPROVED);
        po.setApprovedAt(OffsetDateTime.now());
        po.setApprovedBy(currentUsername());
        return PurchaseOrderDto.from(poRepo.save(po));
    }

    // ── REJECT ─────────────────────────────────────────────────────

    public PurchaseOrderDto reject(Long id, String reason) {
        PurchaseOrder po = findById(id);
        requireStatus(po, PurchaseOrderStatus.PENDING_APPROVAL);
        po.setStatus(PurchaseOrderStatus.REJECTED);
        po.setRejectedAt(OffsetDateTime.now());
        po.setRejectedBy(currentUsername());
        po.setRejectReason(reason);
        return PurchaseOrderDto.from(poRepo.save(po));
    }

    // ── CANCEL ─────────────────────────────────────────────────────

    public PurchaseOrderDto cancel(Long id, String reason) {
        PurchaseOrder po = findById(id);
        branchSecurity.requireBranchAccess(po.getBranchId());
        if (po.getStatus() == PurchaseOrderStatus.RECEIVED || po.getStatus() == PurchaseOrderStatus.PARTIALLY_RECEIVED) {
            throw new BusinessException("Không thể hủy đơn đã nhập kho. Tạo phiếu trả hàng thay.");
        }
        if (po.getStatus() == PurchaseOrderStatus.CANCELLED) {
            throw new BusinessException("Đơn đã hủy");
        }
        po.setStatus(PurchaseOrderStatus.CANCELLED);
        po.setCancelledAt(OffsetDateTime.now());
        po.setCancelledBy(currentUsername());
        po.setCancelReason(reason);
        return PurchaseOrderDto.from(poRepo.save(po));
    }

    // ── MARK RECEIVED (internal — goi tu PurchaseReceiptService) ──

    public void markPartiallyReceived(Long poId) {
        PurchaseOrder po = findById(poId);
        if (po.getStatus() == PurchaseOrderStatus.APPROVED || po.getStatus() == PurchaseOrderStatus.PARTIALLY_RECEIVED) {
            po.setStatus(PurchaseOrderStatus.PARTIALLY_RECEIVED);
            po.setStockReceived(false);
            poRepo.save(po);
        }
    }

    public void markFullyReceived(Long poId) {
        PurchaseOrder po = findById(poId);
        po.setStatus(PurchaseOrderStatus.RECEIVED);
        po.setStockReceived(true);
        poRepo.save(po);
    }

    // ── HELPERS ────────────────────────────────────────────────────

    public PurchaseOrder findById(Long id) {
        return poRepo.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy đơn mua hàng: " + id));
    }

    private void requireStatus(PurchaseOrder po, PurchaseOrderStatus required) {
        if (po.getStatus() != required) {
            throw new BusinessException("Đơn mua hàng phải ở trạng thái " + required.name()
                    + ", hiện tại: " + po.getStatus().name());
        }
    }

    private String generatePoNo() {
        int seq = poRepo.findMaxPoSeq() + 1;
        return String.format("DH-%05d", seq);
    }

    private String currentUsername() {
        try { return branchSecurity.currentUser().getUsername(); }
        catch (Exception e) { return "SYSTEM"; }
    }
}

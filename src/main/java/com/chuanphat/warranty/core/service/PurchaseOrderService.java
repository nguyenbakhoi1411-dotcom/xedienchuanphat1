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
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
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
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    public PurchaseOrderService(PurchaseOrderRepository poRepo,
                                ProductRepository productRepo,
                                SupplierService supplierService,
                                BranchSecurity branchSecurity,
                                org.springframework.context.ApplicationEventPublisher eventPublisher) {
        this.poRepo = poRepo;
        this.productRepo = productRepo;
        this.supplierService = supplierService;
        this.branchSecurity = branchSecurity;
        this.eventPublisher = eventPublisher;
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

    /** Don mua co han thanh toan da qua + chua thanh toan du */
    @Transactional(readOnly = true)
    public List<PurchaseOrderDto> getOverduePayments(Long branchId) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        List<PurchaseOrder> list;
        if (scopedBranchId != null) {
            list = poRepo.findByBranchIdAndHanThanhToanBeforeAndTrangThaiThanhToanNot(
                    scopedBranchId, LocalDate.now(), "PAID");
        } else {
            list = poRepo.findByHanThanhToanBeforeAndTrangThaiThanhToanNot(
                    LocalDate.now(), "PAID");
        }
        return list.stream().map(PurchaseOrderDto::from).toList();
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
        po.setNguoiPhuTrach(req.nguoiPhuTrach() != null ? req.nguoiPhuTrach() : currentUsername());
        po.setDiaChiGiaoHang(req.diaChiGiaoHang());
        po.setCreatedBy(currentUsername());

        // Hinh thuc thanh toan
        String hinhThucTT = req.hinhThucTT() != null ? req.hinhThucTT() : "DEBT";
        po.setHinhThucTT(hinhThucTT);

        // Han thanh toan: lay tu request hoac tinh tu paymentTermsDays cua NCC
        if (req.paymentTermsDays() != null && req.paymentTermsDays() > 0) {
            po.setHanThanhToan(po.getPurchaseDate().plusDays(req.paymentTermsDays()));
        } else if (supplier.getPaymentTermsDays() > 0) {
            po.setHanThanhToan(po.getPurchaseDate().plusDays(supplier.getPaymentTermsDays()));
        }

        // Tinh toan tong tien
        BigDecimal tongTienHang = BigDecimal.ZERO;
        BigDecimal tongChietKhau = BigDecimal.ZERO;
        BigDecimal tongThueGtgt = BigDecimal.ZERO;
        BigDecimal tongThanhTien = BigDecimal.ZERO;

        int thuTu = 0;
        for (var itemReq : req.items()) {
            thuTu++;
            var product = productRepo.findById(itemReq.productId())
                    .orElseThrow(() -> new BusinessException("Không tìm thấy sản phẩm: " + itemReq.productId()));

            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setProduct(product);
            item.setTenSanPham(itemReq.tenSanPham() != null ? itemReq.tenSanPham() : product.getProductName());
            item.setDonViTinh(itemReq.donViTinh());
            item.setQuantity(itemReq.quantity());
            item.setUnitCost(itemReq.unitCost());
            item.setChietKhauPhanTram(itemReq.chietKhauPhanTram() != null ? itemReq.chietKhauPhanTram() : BigDecimal.ZERO);
            item.setThueGtgtPhanTram(itemReq.thueGtgtPhanTram() != null ? itemReq.thueGtgtPhanTram() : BigDecimal.ZERO);
            item.setThuTu(itemReq.thuTu() > 0 ? itemReq.thuTu() : thuTu);
            item.calcLineTotal();

            // Tinh tung phan
            BigDecimal base = itemReq.unitCost().multiply(BigDecimal.valueOf(itemReq.quantity()));
            BigDecimal ck = base.multiply(item.getChietKhauPhanTram()).divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
            BigDecimal afterDiscount = base.subtract(ck);
            BigDecimal vatAmount = afterDiscount.multiply(item.getThueGtgtPhanTram()).divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);

            tongTienHang = tongTienHang.add(base);
            tongChietKhau = tongChietKhau.add(ck);
            tongThueGtgt = tongThueGtgt.add(vatAmount);
            tongThanhTien = tongThanhTien.add(item.getLineTotal());

            po.addItem(item);
        }

        po.setTongTienHang(tongTienHang);
        po.setTongChietKhau(tongChietKhau);
        po.setTongThueGtgt(tongThueGtgt);
        po.setTotalAmount(tongThanhTien);

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
        PurchaseOrder savedPo = poRepo.save(po);

        // Bắn sự kiện để module kế toán tự động sinh Hóa đơn Mua vào
        eventPublisher.publishEvent(new com.chuanphat.warranty.core.event.PurchaseOrderReceivedEvent(savedPo.getId()));

        return PurchaseOrderDto.from(savedPo);
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

    // ── PAY (ghi nhan thanh toan NCC truc tiep tu don mua) ────────

    public PurchaseOrderDto pay(Long id, BigDecimal amount) {
        PurchaseOrder po = findById(id);
        branchSecurity.requireBranchAccess(po.getBranchId());

        if (po.getStatus() == PurchaseOrderStatus.DRAFT || po.getStatus() == PurchaseOrderStatus.CANCELLED) {
            throw new BusinessException("Không thể thanh toán đơn ở trạng thái " + po.getStatus().name());
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Số tiền thanh toán phải lớn hơn 0");
        }
        BigDecimal conLai = po.getConLaiPhaiTra();
        if (amount.compareTo(conLai) > 0) {
            throw new BusinessException("Số tiền thanh toán (" + amount + ") vượt quá số còn lại (" + conLai + ")");
        }

        BigDecimal newPaid = (po.getPaidAmount() == null ? BigDecimal.ZERO : po.getPaidAmount()).add(amount);
        po.setPaidAmount(newPaid);
        po.recalcPaymentStatus();
        // NCC debt update
        supplierService.decreaseDebt(po.getSupplier().getId(), amount);

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
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int seq = poRepo.findMaxPoSeq() + 1;
        return String.format("DH-%s-%03d", date, seq);
    }

    private String currentUsername() {
        try { return branchSecurity.currentUser().getUsername(); }
        catch (Exception e) { return "SYSTEM"; }
    }
}

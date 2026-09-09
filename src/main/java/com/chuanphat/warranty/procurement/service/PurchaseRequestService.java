package com.chuanphat.warranty.procurement.service;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.auth.repository.AppUserRepository;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.PurchaseOrder;
import com.chuanphat.warranty.core.entity.PurchaseOrderItem;
import com.chuanphat.warranty.core.entity.PurchaseRequest;
import com.chuanphat.warranty.core.entity.PurchaseRequestItem;
import com.chuanphat.warranty.core.entity.Supplier;
import com.chuanphat.warranty.core.enums.PurchaseOrderStatus;
import com.chuanphat.warranty.core.enums.PurchaseRequestPriority;
import com.chuanphat.warranty.core.enums.PurchaseRequestStatus;
import com.chuanphat.warranty.core.repository.ProductRepository;
import com.chuanphat.warranty.core.repository.PurchaseOrderRepository;
import com.chuanphat.warranty.core.repository.PurchaseRequestItemRepository;
import com.chuanphat.warranty.core.repository.PurchaseRequestRepository;
import com.chuanphat.warranty.core.repository.SupplierRepository;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.procurement.dto.CreatePurchaseRequestRequest;
import com.chuanphat.warranty.procurement.dto.PurchaseRequestResponse;
import com.chuanphat.warranty.procurement.dto.ConvertResponse;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Transactional
public class PurchaseRequestService {

    private final PurchaseRequestRepository prRepo;
    private final PurchaseRequestItemRepository prItemRepo;
    private final AppUserRepository userRepo;
    private final ProductRepository productRepo;
    private final PurchaseOrderRepository poRepo;
    private final SupplierRepository supplierRepo;
    private final BranchSecurity branchSecurity;

    public PurchaseRequestService(
            PurchaseRequestRepository prRepo,
            PurchaseRequestItemRepository prItemRepo,
            AppUserRepository userRepo,
            ProductRepository productRepo,
            PurchaseOrderRepository poRepo,
            SupplierRepository supplierRepo,
            BranchSecurity branchSecurity) {
        this.prRepo = prRepo;
        this.prItemRepo = prItemRepo;
        this.userRepo = userRepo;
        this.productRepo = productRepo;
        this.poRepo = poRepo;
        this.supplierRepo = supplierRepo;
        this.branchSecurity = branchSecurity;
    }

    // ── QUERY ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PageResponse<PurchaseRequestResponse> list(PurchaseRequestStatus status, Long branchId, int page, int size) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        if (scopedBranchId == null) {
            if (status != null) {
                return PageResponse.from(prRepo.findByStatus(status, pageable).map(PurchaseRequestResponse::from));
            }
            return PageResponse.from(prRepo.findAll(pageable).map(PurchaseRequestResponse::from));
        }

        if (status != null) {
            return PageResponse.from(prRepo.findByBranchIdAndStatus(scopedBranchId, status, pageable).map(PurchaseRequestResponse::from));
        }
        return PageResponse.from(prRepo.findByBranchId(scopedBranchId, pageable).map(PurchaseRequestResponse::from));
    }

    @Transactional(readOnly = true)
    public PurchaseRequestResponse get(Long id) {
        return PurchaseRequestResponse.from(findById(id));
    }

    // ── CREATE ─────────────────────────────────────────────────────

    public PurchaseRequestResponse create(CreatePurchaseRequestRequest req, Long branchId) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        if (scopedBranchId == null) {
            throw new BusinessException("Không xác định được chi nhánh hạch toán");
        }
        branchSecurity.requireBranchAccess(scopedBranchId);

        PurchaseRequest pr = new PurchaseRequest();
        pr.setPrNo(generatePrNo());
        pr.setPrDate(req.prDate() != null ? req.prDate() : LocalDate.now());
        pr.setRequestedBy(currentAppUser());
        pr.setDepartment(req.department());
        pr.setPriority(req.priority() != null ? req.priority() : PurchaseRequestPriority.NORMAL);
        pr.setReason(req.reason());
        pr.setExpectedDate(req.expectedDate());
        pr.setStatus(PurchaseRequestStatus.DRAFT);
        pr.setBranchId(scopedBranchId);

        for (var itemReq : req.items()) {
            PurchaseRequestItem item = new PurchaseRequestItem();
            if (itemReq.productId() != null) {
                Product product = productRepo.findById(itemReq.productId())
                        .orElseThrow(() -> new BusinessException("Không tìm thấy sản phẩm ID: " + itemReq.productId()));
                item.setProduct(product);
                item.setProductName(product.getProductName());
            } else {
                item.setProductName(itemReq.productName());
            }
            item.setQuantity(itemReq.quantity());
            item.setUnit(itemReq.unit());
            item.setEstimatedPrice(itemReq.estimatedPrice() != null ? itemReq.estimatedPrice() : BigDecimal.ZERO);
            item.setNote(itemReq.note());
            pr.addItem(item);
        }

        return PurchaseRequestResponse.from(prRepo.save(pr));
    }

    // ── UPDATE ─────────────────────────────────────────────────────

    public PurchaseRequestResponse update(Long id, CreatePurchaseRequestRequest req) {
        PurchaseRequest pr = findById(id);
        branchSecurity.requireBranchAccess(pr.getBranchId());

        if (pr.getStatus() != PurchaseRequestStatus.DRAFT) {
            throw new BusinessException("Chỉ có thể cập nhật đề nghị mua hàng ở trạng thái NHÁP");
        }

        pr.setPrDate(req.prDate() != null ? req.prDate() : LocalDate.now());
        pr.setDepartment(req.department());
        pr.setPriority(req.priority() != null ? req.priority() : PurchaseRequestPriority.NORMAL);
        pr.setReason(req.reason());
        pr.setExpectedDate(req.expectedDate());

        // Refresh items
        pr.getItems().clear();
        for (var itemReq : req.items()) {
            PurchaseRequestItem item = new PurchaseRequestItem();
            if (itemReq.productId() != null) {
                Product product = productRepo.findById(itemReq.productId())
                        .orElseThrow(() -> new BusinessException("Không tìm thấy sản phẩm ID: " + itemReq.productId()));
                item.setProduct(product);
                item.setProductName(product.getProductName());
            } else {
                item.setProductName(itemReq.productName());
            }
            item.setQuantity(itemReq.quantity());
            item.setUnit(itemReq.unit());
            item.setEstimatedPrice(itemReq.estimatedPrice() != null ? itemReq.estimatedPrice() : BigDecimal.ZERO);
            item.setNote(itemReq.note());
            pr.addItem(item);
        }

        return PurchaseRequestResponse.from(prRepo.save(pr));
    }

    // ── STATE TRANSITIONS ──────────────────────────────────────────

    public PurchaseRequestResponse submit(Long id) {
        PurchaseRequest pr = findById(id);
        branchSecurity.requireBranchAccess(pr.getBranchId());

        if (pr.getStatus() != PurchaseRequestStatus.DRAFT) {
            throw new BusinessException("Chỉ có thể gửi duyệt đề nghị mua hàng từ trạng thái NHÁP");
        }

        pr.setStatus(PurchaseRequestStatus.PENDING);
        return PurchaseRequestResponse.from(prRepo.save(pr));
    }

    public PurchaseRequestResponse approve(Long id) {
        PurchaseRequest pr = findById(id);

        if (pr.getStatus() != PurchaseRequestStatus.PENDING) {
            throw new BusinessException("Chỉ có thể duyệt đề nghị mua hàng đang chờ duyệt");
        }

        pr.setStatus(PurchaseRequestStatus.APPROVED);
        pr.setApprovedBy(currentAppUser());
        pr.setApprovedAt(OffsetDateTime.now());
        return PurchaseRequestResponse.from(prRepo.save(pr));
    }

    public PurchaseRequestResponse reject(Long id, String reason) {
        PurchaseRequest pr = findById(id);

        if (pr.getStatus() != PurchaseRequestStatus.PENDING) {
            throw new BusinessException("Chỉ có thể từ chối đề nghị mua hàng đang chờ duyệt");
        }

        pr.setStatus(PurchaseRequestStatus.REJECTED);
        pr.setApprovedBy(currentAppUser());
        pr.setApprovedAt(OffsetDateTime.now());
        pr.setRejectedReason(reason);
        return PurchaseRequestResponse.from(prRepo.save(pr));
    }

    // ── CONVERT TO PO ──────────────────────────────────────────────

    public ConvertResponse convertToPo(Long id) {
        PurchaseRequest pr = findById(id);
        branchSecurity.requireBranchAccess(pr.getBranchId());

        if (pr.getStatus() != PurchaseRequestStatus.APPROVED) {
            throw new BusinessException("Chỉ có thể chuyển đổi đề nghị mua hàng đã được DUYỆT sang đơn đặt hàng");
        }

        // Fetch supplier fallback for PO constraint
        Supplier supplier = supplierRepo.findAll().stream().findFirst()
                .orElseThrow(() -> new BusinessException("Không có nhà cung cấp nào trên hệ thống để chuyển đổi đơn mua hàng"));

        PurchaseOrder po = new PurchaseOrder();
        po.setPurchaseOrderNo(generatePoNo());
        po.setSupplier(supplier);
        po.setBranchId(pr.getBranchId());
        po.setStatus(PurchaseOrderStatus.DRAFT);
        po.setPurchaseDate(LocalDate.now());
        po.setExpectedDelivery(pr.getExpectedDate());
        po.setNote("Chuyển đổi từ đề nghị mua hàng " + pr.getPrNo() + ". Lý do: " + pr.getReason());
        po.setCreatedBy(currentUsername());

        BigDecimal total = BigDecimal.ZERO;
        for (var prItem : pr.getItems()) {
            if (prItem.getProduct() == null) {
                // Skips conversion of generic non-product request items or log warning
                continue;
            }
            PurchaseOrderItem poItem = new PurchaseOrderItem();
            poItem.setProduct(prItem.getProduct());
            poItem.setQuantity(prItem.getQuantity().intValue());
            poItem.setUnitCost(prItem.getEstimatedPrice());
            poItem.setLineTotal(prItem.getEstimatedPrice().multiply(BigDecimal.valueOf(poItem.getQuantity())));
            po.addItem(poItem);
            total = total.add(poItem.getLineTotal());
        }

        po.setTotalAmount(total);
        PurchaseOrder savedPo = poRepo.save(po);

        // Update PR status
        pr.setStatus(PurchaseRequestStatus.CONVERTED);
        prRepo.save(pr);

        return new ConvertResponse(savedPo.getId(), savedPo.getPurchaseOrderNo());
    }

    // ── HELPERS ────────────────────────────────────────────────────

    private PurchaseRequest findById(Long id) {
        return prRepo.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy đề nghị mua hàng ID: " + id));
    }

    private String generatePrNo() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "PR" + dateStr;

        Pageable limitOne = PageRequest.of(0, 1);
        List<String> lastNos = prRepo.findLastPrNo(prefix, limitOne);
        int nextSeq = 1;
        if (lastNos != null && !lastNos.isEmpty()) {
            String lastNo = lastNos.get(0);
            try {
                nextSeq = Integer.parseInt(lastNo.substring(lastNo.length() - 3)) + 1;
            } catch (Exception e) {
                // ignore
            }
        }
        return String.format("%s%03d", prefix, nextSeq);
    }

    private String generatePoNo() {
        int seq = poRepo.findMaxPoSeq() + 1;
        return String.format("DH-%05d", seq);
    }

    private AppUser currentAppUser() {
        try {
            String username = branchSecurity.currentUser().getUsername();
            return userRepo.findByUsernameIgnoreCase(username).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private String currentUsername() {
        try {
            return branchSecurity.currentUser().getUsername();
        } catch (Exception e) {
            return "SYSTEM";
        }
    }
}

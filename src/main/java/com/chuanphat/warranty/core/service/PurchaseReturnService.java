package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.entity.ProductSerial;
import com.chuanphat.warranty.core.entity.PurchaseReceipt;
import com.chuanphat.warranty.core.entity.PurchaseReceiptItem;
import com.chuanphat.warranty.core.entity.PurchaseReturn;
import com.chuanphat.warranty.core.entity.PurchaseReturnItem;
import com.chuanphat.warranty.core.entity.SupplierInvoice;
import com.chuanphat.warranty.core.entity.SupplierReceivable;
import com.chuanphat.warranty.core.enums.PurchaseReturnReasonCode;
import com.chuanphat.warranty.core.enums.PurchaseReturnStatus;
import com.chuanphat.warranty.core.enums.ReceiptStatus;
import com.chuanphat.warranty.core.enums.SerialStatus;
import com.chuanphat.warranty.core.enums.SupplierInvoicePaymentStatus;
import com.chuanphat.warranty.core.repository.ProductSerialRepository;
import com.chuanphat.warranty.core.repository.PurchaseReceiptItemRepository;
import com.chuanphat.warranty.core.repository.PurchaseReceiptRepository;
import com.chuanphat.warranty.core.repository.PurchaseReturnItemRepository;
import com.chuanphat.warranty.core.repository.PurchaseReturnRepository;
import com.chuanphat.warranty.core.repository.SupplierInvoiceRepository;
import com.chuanphat.warranty.core.repository.SupplierReceivableRepository;
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

@Service
@Transactional
public class PurchaseReturnService {

    private final PurchaseReturnRepository returnRepo;
    private final PurchaseReturnItemRepository returnItemRepo;
    private final PurchaseReceiptRepository receiptRepo;
    private final PurchaseReceiptItemRepository receiptItemRepo;
    private final SupplierInvoiceRepository invoiceRepo;
    private final SupplierReceivableRepository supplierReceivableRepo;
    private final ProductSerialRepository serialRepo;
    private final InventoryService inventoryService;
    private final PurchasePaymentService purchasePaymentService;
    private final BranchSecurity branchSecurity;

    public PurchaseReturnService(PurchaseReturnRepository returnRepo,
                                 PurchaseReturnItemRepository returnItemRepo,
                                 PurchaseReceiptRepository receiptRepo,
                                 PurchaseReceiptItemRepository receiptItemRepo,
                                 SupplierInvoiceRepository invoiceRepo,
                                 SupplierReceivableRepository supplierReceivableRepo,
                                 ProductSerialRepository serialRepo,
                                 InventoryService inventoryService,
                                 PurchasePaymentService purchasePaymentService,
                                 BranchSecurity branchSecurity) {
        this.returnRepo = returnRepo;
        this.returnItemRepo = returnItemRepo;
        this.receiptRepo = receiptRepo;
        this.receiptItemRepo = receiptItemRepo;
        this.invoiceRepo = invoiceRepo;
        this.supplierReceivableRepo = supplierReceivableRepo;
        this.serialRepo = serialRepo;
        this.inventoryService = inventoryService;
        this.purchasePaymentService = purchasePaymentService;
        this.branchSecurity = branchSecurity;
    }

    @Transactional(readOnly = true)
    public Page<PurchaseReturn> list(Long branchId, int page, int size) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (scopedBranchId == null) {
            return returnRepo.findAll(pageable);
        }
        return returnRepo.findByBranchId(scopedBranchId, pageable);
    }

    @Transactional(readOnly = true)
    public PurchaseReturn get(Long id) {
        return findById(id);
    }

    public PurchaseReturn create(Long purchaseReceiptId,
                                 PurchaseReturnReasonCode reasonCode,
                                 String reasonNote,
                                 String note,
                                 List<ReturnItemRequest> itemRequests) {
        if (purchaseReceiptId == null) {
            throw new BusinessException("Phieu tra hang NCC phai tham chieu phieu nhap kho goc");
        }
        if (reasonCode == null) {
            throw new BusinessException("Ly do tra hang NCC phai chon tu danh muc co san");
        }
        PurchaseReceipt receipt = receiptRepo.findById(purchaseReceiptId)
                .orElseThrow(() -> new BusinessException("Khong tim thay phieu nhap kho goc: " + purchaseReceiptId));
        branchSecurity.requireBranchAccess(receipt.getBranchId());
        if (receipt.getStatus() != ReceiptStatus.CONFIRMED) {
            throw new BusinessException("Chi duoc tra hang tu phieu nhap da xac nhan");
        }
        if (itemRequests == null || itemRequests.isEmpty()) {
            throw new BusinessException("Phieu tra hang NCC phai co it nhat mot dong hang");
        }

        PurchaseReturn ret = new PurchaseReturn();
        ret.setReturnCode(generateReturnCode());
        ret.setSupplierId(receipt.getSupplier().getId());
        ret.setBranchId(receipt.getBranchId());
        ret.setPurchaseOrderId(receipt.getPurchaseOrderId());
        ret.setPurchaseReceiptId(receipt.getId());
        ret.setReturnDate(LocalDate.now());
        ret.setReasonCode(reasonCode);
        ret.setReasonNote(reasonNote);
        ret.setNote(note);
        ret.setStatus(PurchaseReturnStatus.REQUESTED);
        ret.setCreatedBy(currentUsername());

        BigDecimal total = BigDecimal.ZERO;
        for (ReturnItemRequest itemReq : itemRequests) {
            PurchaseReceiptItem receiptItem = requireReceiptItem(receipt, itemReq);
            validateRemainingQuantity(receipt, receiptItem, itemReq.quantity());
            PurchaseReturnItem item = buildReturnItem(itemReq, receiptItem);
            ret.addItem(item);
            total = total.add(item.getLineTotal());
        }
        ret.setTotalAmount(total);
        return returnRepo.save(ret);
    }

    public PurchaseReturn approve(Long id) {
        PurchaseReturn ret = findById(id);
        branchSecurity.requireBranchAccess(ret.getBranchId());
        if (ret.getStatus() != PurchaseReturnStatus.REQUESTED) {
            throw new BusinessException("Chi duoc duyet phieu tra hang NCC o trang thai REQUESTED");
        }
        String username = currentUsername();
        if (sameUser(username, ret.getCreatedBy())) {
            throw new BusinessException("Nguoi tao phieu tra hang NCC khong duoc tu duyet phieu cua chinh minh");
        }
        ret.setStatus(PurchaseReturnStatus.APPROVED);
        ret.setApprovedBy(username);
        ret.setApprovedAt(OffsetDateTime.now());
        return returnRepo.save(ret);
    }

    public PurchaseReturn reject(Long id, String reason) {
        PurchaseReturn ret = findById(id);
        branchSecurity.requireBranchAccess(ret.getBranchId());
        if (ret.getStatus() != PurchaseReturnStatus.REQUESTED) {
            throw new BusinessException("Chi duoc tu choi phieu tra hang NCC o trang thai REQUESTED");
        }
        ret.setStatus(PurchaseReturnStatus.REJECTED);
        ret.setNote(appendNote(ret.getNote(), reason));
        return returnRepo.save(ret);
    }

    public PurchaseReturn shipBack(Long id) {
        PurchaseReturn ret = findById(id);
        branchSecurity.requireBranchAccess(ret.getBranchId());
        if (ret.getStatus() != PurchaseReturnStatus.APPROVED) {
            throw new BusinessException("Chi duoc xuat tra NCC sau khi phieu da duoc duyet");
        }
        for (PurchaseReturnItem item : ret.getItems()) {
            PurchaseReceiptItem receiptItem = requireReceiptItemForSavedReturn(ret, item);
            Long warehouseId = receiptItem.getReceipt().getWarehouse() == null ? null : receiptItem.getReceipt().getWarehouse().getId();
            inventoryService.recordPurchaseReturn(ret.getBranchId(), warehouseId,
                    item.getProduct(), item.getQuantity(), ret.getReturnCode());
            if (item.getSerial() != null) {
                ProductSerial serial = serialRepo.findWithLockById(item.getSerial().getId())
                        .orElseThrow(() -> new BusinessException("Serial khong ton tai: " + item.getSerial().getId()));
                serial.setStatus(SerialStatus.RETURNED_TO_SUPPLIER);
                serialRepo.save(serial);
            }
        }
        ret.setStockReturned(true);
        ret.setShippedBackBy(currentUsername());
        ret.setShippedBackAt(OffsetDateTime.now());
        settleFinancialEffect(ret);
        return returnRepo.save(ret);
    }

    public PurchaseReturn complete(Long id) {
        return shipBack(id);
    }

    public PurchaseReturn cancel(Long id) {
        return reject(id, "Cancelled");
    }

    public record ReturnItemRequest(
            Long productId,
            Long purchaseReceiptItemId,
            Long batchId,
            Long serialId,
            int quantity,
            BigDecimal unitPrice
    ) {}

    private PurchaseReturnItem buildReturnItem(ReturnItemRequest itemReq, PurchaseReceiptItem receiptItem) {
        PurchaseReturnItem item = new PurchaseReturnItem();
        item.setProduct(receiptItem.getProduct());
        item.setPurchaseReceiptItemId(receiptItem.getId());
        item.setBatchId(itemReq.batchId());
        item.setQuantity(itemReq.quantity());
        item.setUnitPrice(itemReq.unitPrice() != null ? itemReq.unitPrice() : receiptItem.getUnitCost());
        item.setLineTotal(item.getUnitPrice().multiply(BigDecimal.valueOf(itemReq.quantity())));
        if (itemReq.serialId() != null) {
            ProductSerial serial = serialRepo.findById(itemReq.serialId())
                    .orElseThrow(() -> new BusinessException("Serial khong ton tai: " + itemReq.serialId()));
            requireSerialFromReceiptItem(receiptItem, serial);
            item.setSerial(serial);
        }
        return item;
    }

    private PurchaseReceiptItem requireReceiptItem(PurchaseReceipt receipt, ReturnItemRequest itemReq) {
        if (itemReq.purchaseReceiptItemId() == null) {
            throw new BusinessException("Dong tra hang phai tham chieu dong phieu nhap goc");
        }
        if (itemReq.quantity() <= 0) {
            throw new BusinessException("So luong tra hang NCC phai > 0");
        }
        PurchaseReceiptItem receiptItem = receiptItemRepo.findWithReceiptById(itemReq.purchaseReceiptItemId())
                .orElseThrow(() -> new BusinessException("Khong tim thay dong phieu nhap goc: " + itemReq.purchaseReceiptItemId()));
        if (!receiptItem.getReceipt().getId().equals(receipt.getId())) {
            throw new BusinessException("Dong tra hang khong thuoc phieu nhap goc da chon");
        }
        if (itemReq.productId() != null && !receiptItem.getProduct().getId().equals(itemReq.productId())) {
            throw new BusinessException("San pham tra hang khong khop voi dong phieu nhap goc");
        }
        if (receiptItem.getSerialNumber() != null && !receiptItem.getSerialNumber().isBlank()) {
            if (itemReq.serialId() == null) {
                throw new BusinessException("Tra xe dien ve NCC phai chi dinh dung serial da nhan");
            }
            if (itemReq.quantity() != 1) {
                throw new BusinessException("Tra xe dien ve NCC phai xu ly tung serial, quantity = 1");
            }
        }
        return receiptItem;
    }

    private PurchaseReceiptItem requireReceiptItemForSavedReturn(PurchaseReturn ret, PurchaseReturnItem item) {
        PurchaseReceiptItem receiptItem = receiptItemRepo.findWithReceiptById(item.getPurchaseReceiptItemId())
                .orElseThrow(() -> new BusinessException("Khong tim thay dong phieu nhap goc: " + item.getPurchaseReceiptItemId()));
        if (!receiptItem.getReceipt().getId().equals(ret.getPurchaseReceiptId())) {
            throw new BusinessException("Dong tra hang khong thuoc phieu nhap goc da chon");
        }
        if (!receiptItem.getProduct().getId().equals(item.getProduct().getId())) {
            throw new BusinessException("San pham tra hang khong khop voi dong phieu nhap goc");
        }
        if (item.getSerial() != null) {
            requireSerialFromReceiptItem(receiptItem, item.getSerial());
        }
        return receiptItem;
    }

    private void validateRemainingQuantity(PurchaseReceipt receipt, PurchaseReceiptItem receiptItem, int newQuantity) {
        long alreadyReturned = returnItemRepo.sumNonRejectedQuantityByReceiptItemId(receipt.getId(), receiptItem.getId());
        if (alreadyReturned + newQuantity > receiptItem.getQuantity()) {
            throw new BusinessException("So luong tra NCC vuot qua so luong da nhan tu phieu nhap goc");
        }
    }

    private void requireSerialFromReceiptItem(PurchaseReceiptItem receiptItem, ProductSerial serial) {
        if (receiptItem.getSerialNumber() == null || !receiptItem.getSerialNumber().equalsIgnoreCase(serial.getSerialNumber())) {
            throw new BusinessException("Serial tra NCC khong phai serial da nhan trong phieu nhap goc");
        }
    }

    private void settleFinancialEffect(PurchaseReturn ret) {
        SupplierInvoice invoice = invoiceRepo.findByReceiptId(ret.getPurchaseReceiptId())
                .orElseThrow(() -> new BusinessException("Khong tim thay hoa don NCC lien quan phieu nhap tra hang"));
        ret.setSupplierInvoiceId(invoice.getId());
        if (invoice.getPaymentStatus() == SupplierInvoicePaymentStatus.PAID) {
            SupplierReceivable receivable = new SupplierReceivable();
            receivable.setSupplier(invoice.getSupplier());
            receivable.setPurchaseReturn(ret);
            receivable.setSupplierInvoice(invoice);
            receivable.setBranchId(ret.getBranchId());
            receivable.setAmount(ret.getTotalAmount());
            receivable.setReceivableDate(LocalDate.now());
            receivable.setNote("NCC phai hoan lai tien do tra hang " + ret.getReturnCode());
            receivable.setCreatedBy(currentUsername());
            SupplierReceivable saved = supplierReceivableRepo.save(receivable);
            ret.setSupplierReceivableId(saved.getId());
            ret.setStatus(PurchaseReturnStatus.REFUND_RECEIVED);
        } else {
            purchasePaymentService.applyReturnCredit(invoice, ret.getTotalAmount(), ret.getReturnCode());
            ret.setStatus(PurchaseReturnStatus.CREDITED);
        }
        ret.setPayableAdjusted(true);
        ret.setAccountingRecorded(true);
        ret.setCreditedBy(currentUsername());
        ret.setCreditedAt(OffsetDateTime.now());
    }

    private PurchaseReturn findById(Long id) {
        return returnRepo.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay phieu tra hang NCC: " + id));
    }

    private String generateReturnCode() {
        long count = returnRepo.count() + 1;
        return String.format("THNCC-%05d", count);
    }

    private String currentUsername() {
        try {
            AppUser user = branchSecurity.currentUser();
            return user.getUsername() != null ? user.getUsername() : "SYSTEM";
        } catch (Exception e) {
            return "SYSTEM";
        }
    }

    private boolean sameUser(String left, String right) {
        return left != null && right != null && left.equalsIgnoreCase(right);
    }

    private String appendNote(String note, String suffix) {
        if (suffix == null || suffix.isBlank()) {
            return note;
        }
        if (note == null || note.isBlank()) {
            return suffix.trim();
        }
        return note + " | " + suffix.trim();
    }
}

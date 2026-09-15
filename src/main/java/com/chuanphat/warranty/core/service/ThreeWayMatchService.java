package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.auth.entity.AppUser;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.config.ThreeWayMatchingProperties;
import com.chuanphat.warranty.core.dto.SupplierInvoiceDto;
import com.chuanphat.warranty.core.entity.PurchaseOrder;
import com.chuanphat.warranty.core.entity.PurchaseOrderItem;
import com.chuanphat.warranty.core.entity.SupplierInvoice;
import com.chuanphat.warranty.core.entity.SupplierInvoiceItem;
import com.chuanphat.warranty.core.enums.ReceiptStatus;
import com.chuanphat.warranty.core.enums.SupplierInvoiceStatus;
import com.chuanphat.warranty.core.repository.PurchaseOrderRepository;
import com.chuanphat.warranty.core.repository.PurchaseReceiptRepository;
import com.chuanphat.warranty.core.repository.SupplierInvoiceRepository;
import com.chuanphat.warranty.exception.BusinessException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ThreeWayMatchService {
    private final SupplierInvoiceRepository invoiceRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseReceiptRepository receiptRepository;
    private final BranchSecurity branchSecurity;
    private final ThreeWayMatchingProperties properties;

    public ThreeWayMatchService(SupplierInvoiceRepository invoiceRepository,
                                PurchaseOrderRepository purchaseOrderRepository,
                                PurchaseReceiptRepository receiptRepository,
                                BranchSecurity branchSecurity,
                                ThreeWayMatchingProperties properties) {
        this.invoiceRepository = invoiceRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.receiptRepository = receiptRepository;
        this.branchSecurity = branchSecurity;
        this.properties = properties;
    }

    public SupplierInvoiceDto match(Long supplierInvoiceId) {
        SupplierInvoice invoice = findInvoice(supplierInvoiceId);
        branchSecurity.requireBranchAccess(invoice.getBranchId());
        PurchaseOrder purchaseOrder = findPurchaseOrder(invoice.getPurchaseOrderId());

        MatchEvaluation evaluation = evaluate(invoice, purchaseOrder);
        invoice.setMatchDetails(evaluation.details());
        invoice.setStatus(evaluation.matched()
                ? SupplierInvoiceStatus.MATCHED
                : SupplierInvoiceStatus.HOLD_FOR_REVIEW);
        return SupplierInvoiceDto.from(invoiceRepository.save(invoice));
    }

    public SupplierInvoiceDto resolveMismatch(Long supplierInvoiceId, String reason) {
        if (reason == null || reason.isBlank()) {
            throw new BusinessException("Ly do xu ly chenhlech hoa don khong duoc de trong");
        }
        SupplierInvoice invoice = findInvoice(supplierInvoiceId);
        branchSecurity.requireBranchAccess(invoice.getBranchId());
        AppUser user = branchSecurity.currentUser();
        if (user.getUsername() != null && user.getUsername().equalsIgnoreCase(invoice.getCreatedBy())) {
            throw new BusinessException("Nguoi tao hoa don nha cung cap khong duoc tu xu ly chenhlech cua chinh minh");
        }
        MatchEvaluation evaluation = evaluate(invoice, findPurchaseOrder(invoice.getPurchaseOrderId()));
        invoice.setStatus(SupplierInvoiceStatus.RESOLVED);
        invoice.setResolvedBy(user.getUsername());
        invoice.setResolvedAt(OffsetDateTime.now());
        invoice.setResolveReason(reason.trim());
        invoice.setMatchDetails(evaluation.details() + " | resolvedReason=" + reason.trim());
        return SupplierInvoiceDto.from(invoiceRepository.save(invoice));
    }

    public void requireInvoicePayable(Long purchaseOrderId) {
        if (purchaseOrderId == null) {
            return;
        }
        var invoices = invoiceRepository.findByPurchaseOrderIdAndStatusIn(
                purchaseOrderId,
                java.util.List.of(SupplierInvoiceStatus.MATCHED, SupplierInvoiceStatus.RESOLVED));
        if (invoices.isEmpty()) {
            throw new BusinessException("Chua co hoa don nha cung cap MATCHED/RESOLVED cho don mua hang, khong duoc thanh toan");
        }
    }

    private MatchEvaluation evaluate(SupplierInvoice invoice, PurchaseOrder purchaseOrder) {
        Map<Long, PurchaseOrderItem> poItemsByProduct = purchaseOrder.getItems().stream()
                .collect(Collectors.toMap(item -> item.getProduct().getId(), item -> item, (a, b) -> a));
        ArrayList<String> mismatches = new ArrayList<>();

        if (!receiptRepository.existsByPurchaseOrderIdAndStatus(purchaseOrder.getId(), ReceiptStatus.CONFIRMED)) {
            mismatches.add("NO_CONFIRMED_RECEIPT: poId=" + purchaseOrder.getId());
        }

        for (SupplierInvoiceItem invoiceItem : invoice.getItems()) {
            PurchaseOrderItem poItem = poItemsByProduct.get(invoiceItem.getProductId());
            if (poItem == null) {
                mismatches.add("PRODUCT_NOT_IN_PO: productId=" + invoiceItem.getProductId()
                        + ", invoiceQty=" + invoiceItem.getQuantity());
                continue;
            }
            long receivedQuantity = receiptRepository.sumConfirmedQuantityByPurchaseOrderIdAndProductId(
                    purchaseOrder.getId(), invoiceItem.getProductId());
            if (invoiceItem.getQuantity() != receivedQuantity) {
                mismatches.add("QUANTITY_MISMATCH: productId=" + invoiceItem.getProductId()
                        + ", invoiceQty=" + invoiceItem.getQuantity()
                        + ", receivedQty=" + receivedQuantity
                        + ", delta=" + (invoiceItem.getQuantity() - receivedQuantity));
            }
            BigDecimal allowedDelta = poItem.getUnitPrice()
                    .multiply(priceTolerancePercent())
                    .divide(new BigDecimal("100"), 6, RoundingMode.HALF_UP);
            BigDecimal priceDelta = invoiceItem.getUnitPrice().subtract(poItem.getUnitPrice()).abs();
            if (priceDelta.compareTo(allowedDelta) > 0) {
                mismatches.add("PRICE_MISMATCH: productId=" + invoiceItem.getProductId()
                        + ", invoiceUnitPrice=" + invoiceItem.getUnitPrice()
                        + ", poUnitPrice=" + poItem.getUnitPrice()
                        + ", delta=" + priceDelta
                        + ", allowedDelta=" + allowedDelta);
            }
        }
        if (mismatches.isEmpty()) {
            return new MatchEvaluation(true, "MATCHED");
        }
        return new MatchEvaluation(false, String.join("; ", mismatches));
    }

    private BigDecimal priceTolerancePercent() {
        return properties.getPriceTolerancePercent().max(BigDecimal.ZERO);
    }

    private SupplierInvoice findInvoice(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay hoa don nha cung cap: " + id));
    }

    private PurchaseOrder findPurchaseOrder(Long id) {
        if (id == null) {
            throw new BusinessException("Hoa don nha cung cap phai lien ket don mua hang de doi chieu 3 ben");
        }
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay don mua hang: " + id));
    }

    private record MatchEvaluation(boolean matched, String details) {
    }
}

package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.PurchaseReceipt;
import com.chuanphat.warranty.core.enums.ReceiptStatus;
import java.util.Collection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PurchaseReceiptRepository extends JpaRepository<PurchaseReceipt, Long> {

    Page<PurchaseReceipt> findByBranchId(Long branchId, Pageable pageable);

    Page<PurchaseReceipt> findByBranchIdAndStatus(Long branchId, ReceiptStatus status, Pageable pageable);

    Page<PurchaseReceipt> findByStatus(ReceiptStatus status, Pageable pageable);

    /** Dem so phieu nhap cua 1 PO theo trang thai (de biet PARTIALLY_RECEIVED hay RECEIVED) */
    long countByPurchaseOrderIdAndStatus(Long purchaseOrderId, ReceiptStatus status);

    @Query("""
            select coalesce(sum(item.quantity), 0)
            from PurchaseReceipt receipt
            join receipt.items item
            where receipt.purchaseOrderId = :purchaseOrderId
              and item.product.id = :productId
              and receipt.status in :statuses
            """)
    long sumQuantityByPurchaseOrderIdAndProductIdAndStatusIn(
            @Param("purchaseOrderId") Long purchaseOrderId,
            @Param("productId") Long productId,
            @Param("statuses") Collection<ReceiptStatus> statuses);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(r.receiptNo, 4) AS int)), 0) FROM PurchaseReceipt r WHERE r.receiptNo LIKE 'GNK%'")
    int findMaxReceiptSeq();
}

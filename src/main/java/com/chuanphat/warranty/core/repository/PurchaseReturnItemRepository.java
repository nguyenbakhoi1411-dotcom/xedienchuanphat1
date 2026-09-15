package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.PurchaseReturnItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PurchaseReturnItemRepository extends JpaRepository<PurchaseReturnItem, Long> {
    List<PurchaseReturnItem> findByPurchaseReturn_Id(Long returnId);

    @Query("""
            select coalesce(sum(item.quantity), 0)
            from PurchaseReturnItem item
            where item.purchaseReturn.purchaseReceiptId = :purchaseReceiptId
              and item.purchaseReceiptItemId = :receiptItemId
              and item.purchaseReturn.status <> com.chuanphat.warranty.core.enums.PurchaseReturnStatus.REJECTED
            """)
    long sumNonRejectedQuantityByReceiptItemId(
            @Param("purchaseReceiptId") Long purchaseReceiptId,
            @Param("receiptItemId") Long receiptItemId);
}

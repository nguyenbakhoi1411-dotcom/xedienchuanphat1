package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.PurchaseReceiptItem;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PurchaseReceiptItemRepository extends JpaRepository<PurchaseReceiptItem, Long> {
    @Query("""
            select item from PurchaseReceiptItem item
            join fetch item.receipt receipt
            join fetch item.product
            where item.id = :id
            """)
    Optional<PurchaseReceiptItem> findWithReceiptById(@Param("id") Long id);
}

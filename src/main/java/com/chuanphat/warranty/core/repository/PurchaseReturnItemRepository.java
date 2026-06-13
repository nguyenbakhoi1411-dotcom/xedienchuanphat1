package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.PurchaseReturnItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseReturnItemRepository extends JpaRepository<PurchaseReturnItem, Long> {
    List<PurchaseReturnItem> findByPurchaseReturn_Id(Long returnId);
}

package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.InventoryTransferItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryTransferItemRepository extends JpaRepository<InventoryTransferItem, Long> {
    List<InventoryTransferItem> findByTransferId(Long transferId);
    void deleteByTransferId(Long transferId);
}

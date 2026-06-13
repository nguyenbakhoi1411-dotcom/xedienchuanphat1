package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.InventoryAverageCost;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;

public interface InventoryAverageCostRepository extends JpaRepository<InventoryAverageCost, Long> {
    Optional<InventoryAverageCost> findByBranchIdAndWarehouseIdAndProductId(Long branchId, Long warehouseId, Long productId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select cost from InventoryAverageCost cost where cost.branchId = :branchId and cost.warehouse.id = :warehouseId and cost.product.id = :productId")
    Optional<InventoryAverageCost> findWithLockByBranchIdAndWarehouseIdAndProductId(Long branchId, Long warehouseId, Long productId);
}

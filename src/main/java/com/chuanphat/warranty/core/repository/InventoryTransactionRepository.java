package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.InventoryTransaction;
import com.chuanphat.warranty.core.enums.InventoryTransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    Page<InventoryTransaction> findByType(InventoryTransactionType type, Pageable pageable);

    Page<InventoryTransaction> findByFromBranchIdOrToBranchId(Long fromBranchId, Long toBranchId, Pageable pageable);

    Page<InventoryTransaction> findByFromWarehouseIdOrToWarehouseId(Long fromWarehouseId, Long toWarehouseId, Pageable pageable);

    Page<InventoryTransaction> findByTypeAndFromBranchIdOrTypeAndToBranchId(
            InventoryTransactionType fromType,
            Long fromBranchId,
            InventoryTransactionType toType,
            Long toBranchId,
            Pageable pageable
    );

    Page<InventoryTransaction> findByTypeAndFromWarehouseIdOrTypeAndToWarehouseId(
            InventoryTransactionType fromType,
            Long fromWarehouseId,
            InventoryTransactionType toType,
            Long toWarehouseId,
            Pageable pageable
    );
}

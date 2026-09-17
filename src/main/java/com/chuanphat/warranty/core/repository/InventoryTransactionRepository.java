package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.InventoryTransaction;
import com.chuanphat.warranty.core.enums.InventoryTransactionType;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("""
            select transaction from InventoryTransaction transaction
            where (transaction.fromWarehouseId in :warehouseIds or transaction.toWarehouseId in :warehouseIds)
              and (:type is null or transaction.type = :type)
            """)
    Page<InventoryTransaction> findAccessible(
            @Param("warehouseIds") List<Long> warehouseIds,
            @Param("type") InventoryTransactionType type,
            Pageable pageable
    );
}

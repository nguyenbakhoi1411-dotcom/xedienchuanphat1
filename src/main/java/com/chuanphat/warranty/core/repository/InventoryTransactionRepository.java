package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.InventoryTransaction;
import com.chuanphat.warranty.core.enums.InventoryTransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    Page<InventoryTransaction> findByType(InventoryTransactionType type, Pageable pageable);

    @Query("select t from InventoryTransaction t where t.fromBranchId = :branchId1 or t.toBranchId = :branchId2")
    Page<InventoryTransaction> findByFromBranchIdOrToBranchId(Long branchId1, Long branchId2, Pageable pageable);

    Page<InventoryTransaction> findByFromWarehouseIdOrToWarehouseId(Long fromWarehouseId, Long toWarehouseId, Pageable pageable);

    @Query("select t from InventoryTransaction t where (t.type = :type1 and t.fromBranchId = :branchId1) or (t.type = :type2 and t.toBranchId = :branchId2)")
    Page<InventoryTransaction> findByTypeAndFromBranchIdOrTypeAndToBranchId(
            InventoryTransactionType type1,
            Long branchId1,
            InventoryTransactionType type2,
            Long branchId2,
            Pageable pageable
    );

    Page<InventoryTransaction> findByTypeAndFromWarehouseIdOrTypeAndToWarehouseId(
            InventoryTransactionType fromType,
            Long fromWarehouseId,
            InventoryTransactionType toType,
            Long toWarehouseId,
            Pageable pageable
    );

    Page<InventoryTransaction> findByProductId(Long productId, Pageable pageable);
    
    Page<InventoryTransaction> findByProductIdAndType(Long productId, InventoryTransactionType type, Pageable pageable);

    @Query("select t from InventoryTransaction t where t.product.id = :productId and (t.fromBranchId = :branchId1 or t.toBranchId = :branchId2)")
    Page<InventoryTransaction> findByProductIdAndFromBranchIdOrToBranchId(Long productId, Long branchId1, Long branchId2, Pageable pageable);

    @Query("select t from InventoryTransaction t where t.product.id = :productId and ((t.type = :type1 and t.fromBranchId = :branchId1) or (t.type = :type2 and t.toBranchId = :branchId2))")
    Page<InventoryTransaction> findByProductIdAndTypeAndFromBranchIdOrTypeAndToBranchId(Long productId, InventoryTransactionType type1, Long branchId1, InventoryTransactionType type2, Long branchId2, Pageable pageable);
}

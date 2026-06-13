package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.InventoryStock;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;

public interface InventoryStockRepository extends JpaRepository<InventoryStock, Long> {
    Optional<InventoryStock> findByBranchIdAndProductId(Long branchId, Long productId);

    Optional<InventoryStock> findByBranchIdAndWarehouseIdAndProductId(Long branchId, Long warehouseId, Long productId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select stock from InventoryStock stock where stock.branchId = :branchId and stock.product.id = :productId")
    Optional<InventoryStock> findWithLockByBranchIdAndProductId(Long branchId, Long productId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select stock from InventoryStock stock where stock.branchId = :branchId and stock.warehouse.id = :warehouseId and stock.product.id = :productId")
    Optional<InventoryStock> findWithLockByBranchIdAndWarehouseIdAndProductId(Long branchId, Long warehouseId, Long productId);

    Page<InventoryStock> findByBranchId(Long branchId, Pageable pageable);

    Page<InventoryStock> findByWarehouse_Id(Long warehouseId, Pageable pageable);

    @Query("select stock from InventoryStock stock where stock.availableQuantity <= stock.minStockLevel")
    Page<InventoryStock> findLowStock(Pageable pageable);

    @Query("select stock from InventoryStock stock where stock.branchId = :branchId and stock.availableQuantity <= stock.minStockLevel")
    Page<InventoryStock> findLowStockByBranchId(Long branchId, Pageable pageable);

    @Query("select stock from InventoryStock stock where stock.warehouse.id = :warehouseId and stock.availableQuantity <= stock.minStockLevel")
    Page<InventoryStock> findLowStockByWarehouseId(Long warehouseId, Pageable pageable);
}

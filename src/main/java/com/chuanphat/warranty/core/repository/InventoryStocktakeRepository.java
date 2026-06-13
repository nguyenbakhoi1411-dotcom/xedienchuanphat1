package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.InventoryStocktake;
import com.chuanphat.warranty.core.enums.StocktakeStatus;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;

public interface InventoryStocktakeRepository extends JpaRepository<InventoryStocktake, Long> {
    Page<InventoryStocktake> findByBranchId(Long branchId, Pageable pageable);

    Page<InventoryStocktake> findByStatus(StocktakeStatus status, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select stocktake from InventoryStocktake stocktake where stocktake.id = :id")
    Optional<InventoryStocktake> findWithLockById(Long id);
}

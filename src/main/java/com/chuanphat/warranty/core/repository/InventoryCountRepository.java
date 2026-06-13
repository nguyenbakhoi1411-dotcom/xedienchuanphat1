package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.InventoryCount;
import com.chuanphat.warranty.core.enums.InventoryCountStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InventoryCountRepository extends JpaRepository<InventoryCount, Long> {

    Page<InventoryCount> findByBranchId(Long branchId, Pageable pageable);

    Page<InventoryCount> findByBranchIdAndStatus(Long branchId, InventoryCountStatus status, Pageable pageable);

    Page<InventoryCount> findByStatus(InventoryCountStatus status, Pageable pageable);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(c.countNo, 4) AS int)), 0) FROM InventoryCount c WHERE c.countNo LIKE 'KKE%'")
    int findMaxCountSeq();
}

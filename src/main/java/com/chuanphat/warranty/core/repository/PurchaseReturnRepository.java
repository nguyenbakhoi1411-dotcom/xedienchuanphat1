package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.PurchaseReturn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseReturnRepository extends JpaRepository<PurchaseReturn, Long> {
    Page<PurchaseReturn> findByBranchId(Long branchId, Pageable pageable);
    Page<PurchaseReturn> findBySupplierId(Long supplierId, Pageable pageable);
    long countBySupplierId(Long supplierId);
}

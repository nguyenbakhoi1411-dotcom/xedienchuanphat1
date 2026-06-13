package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.SalesReturn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SalesReturnRepository extends JpaRepository<SalesReturn, Long> {
    Page<SalesReturn> findByBranchId(Long branchId, Pageable pageable);
}

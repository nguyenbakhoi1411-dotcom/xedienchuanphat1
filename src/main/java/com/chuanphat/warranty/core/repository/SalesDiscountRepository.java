package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.SalesDiscount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SalesDiscountRepository extends JpaRepository<SalesDiscount, Long> {
    Page<SalesDiscount> findByBranchId(Long branchId, Pageable pageable);
    Optional<SalesDiscount> findByDiscountNo(String discountNo);
    Page<SalesDiscount> findByBranchIdAndStatus(Long branchId, String status, Pageable pageable);
    long countByCustomerId(Long customerId);
}

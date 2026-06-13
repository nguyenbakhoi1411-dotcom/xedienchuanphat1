package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.Supplier;
import com.chuanphat.warranty.core.enums.RecordStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    boolean existsByCodeIgnoreCase(String code);

    Page<Supplier> findByStatusNotAndNameContainingIgnoreCase(RecordStatus status, String keyword, Pageable pageable);
}

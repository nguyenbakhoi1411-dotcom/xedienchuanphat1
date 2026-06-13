package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.Branch;
import com.chuanphat.warranty.core.enums.RecordStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BranchRepository extends JpaRepository<Branch, Long> {
    boolean existsByCodeIgnoreCase(String code);

    Page<Branch> findByStatusNotAndNameContainingIgnoreCase(RecordStatus status, String keyword, Pageable pageable);
}

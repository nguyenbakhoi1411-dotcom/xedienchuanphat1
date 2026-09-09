package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.CostCenter;
import com.chuanphat.warranty.core.enums.RecordStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CostCenterRepository extends JpaRepository<CostCenter, Long> {
    Page<CostCenter> findByStatusNotAndNameContainingIgnoreCaseOrCodeContainingIgnoreCase(
            RecordStatus status, String name, String code, Pageable pageable);
            
    List<CostCenter> findByStatus(RecordStatus status);

    boolean existsByCodeIgnoreCase(String code);
}

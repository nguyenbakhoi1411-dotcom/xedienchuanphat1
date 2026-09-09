package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.VatOffsetRun;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VatOffsetRunRepository extends JpaRepository<VatOffsetRun, Long> {
    Optional<VatOffsetRun> findByPeriodMonthAndPeriodYearAndBranchId(Integer month, Integer year, Long branchId);
    List<VatOffsetRun> findByBranchIdOrderByPeriodYearDescPeriodMonthDesc(Long branchId);
}

package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.AccountingPeriod;
import com.chuanphat.warranty.accounting.enums.AccountingPeriodStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AccountingPeriodRepository extends JpaRepository<AccountingPeriod, Long> {
    List<AccountingPeriod> findByBranchIdIsNullOrBranchId(Long branchId);
    
    @Query("SELECT p FROM AccountingPeriod p WHERE p.status = :status AND (p.branchId IS NULL OR p.branchId = :branchId)")
    List<AccountingPeriod> findByStatusAndBranch(AccountingPeriodStatus status, Long branchId);
    
    @Query("SELECT p FROM AccountingPeriod p WHERE p.status = 'LOCKED' AND :date BETWEEN p.startDate AND p.endDate AND (p.branchId IS NULL OR p.branchId = :branchId)")
    Optional<AccountingPeriod> findLockedPeriodForDate(LocalDate date, Long branchId);
    
    boolean existsByPeriodCode(String periodCode);
}

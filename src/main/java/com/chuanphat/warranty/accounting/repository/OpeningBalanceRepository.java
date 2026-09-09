package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.OpeningBalance;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OpeningBalanceRepository extends JpaRepository<OpeningBalance, Long> {
    List<OpeningBalance> findByPeriodIdAndBranchId(Long periodId, Long branchId);
    void deleteByPeriodIdAndBranchId(Long periodId, Long branchId);
    boolean existsByPeriodIdAndBranchIdAndLockedAtIsNotNull(Long periodId, Long branchId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.debitBalance) FROM OpeningBalance o " +
           "WHERE o.accountCode = :accountCode " +
           "AND o.period.year = :year " +
           "AND (:branchId IS NULL OR o.branch.id = :branchId)")
    java.math.BigDecimal sumDebitBalanceByAccountCodeAndYear(
            @org.springframework.data.repository.query.Param("accountCode") String accountCode,
            @org.springframework.data.repository.query.Param("year") Integer year,
            @org.springframework.data.repository.query.Param("branchId") Long branchId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.creditBalance) FROM OpeningBalance o " +
           "WHERE o.accountCode = :accountCode " +
           "AND o.period.year = :year " +
           "AND (:branchId IS NULL OR o.branch.id = :branchId)")
    java.math.BigDecimal sumCreditBalanceByAccountCodeAndYear(
            @org.springframework.data.repository.query.Param("accountCode") String accountCode,
            @org.springframework.data.repository.query.Param("year") Integer year,
            @org.springframework.data.repository.query.Param("branchId") Long branchId);
}

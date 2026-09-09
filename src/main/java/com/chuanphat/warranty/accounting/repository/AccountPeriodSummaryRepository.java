package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.AccountPeriodSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountPeriodSummaryRepository extends JpaRepository<AccountPeriodSummary, Long> {
    Optional<AccountPeriodSummary> findByAccountingYearAndAccountingMonthAndAccountCodeAndBranchId(
            Integer accountingYear, Integer accountingMonth, String accountCode, Long branchId);
}

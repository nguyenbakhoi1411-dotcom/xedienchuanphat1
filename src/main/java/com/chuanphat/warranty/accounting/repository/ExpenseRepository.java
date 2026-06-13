package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.Expense;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    Page<Expense> findByBranchIdAndStatusNot(Long branchId, String status, Pageable pageable);

    Page<Expense> findByBranchIdAndCategory(Long branchId, String category, Pageable pageable);

    List<Expense> findByExpenseDateBetweenAndBranchId(LocalDate from, LocalDate to, Long branchId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e " +
           "WHERE e.branchId = :branchId AND e.status = 'POSTED' " +
           "AND e.expenseDate BETWEEN :from AND :to")
    java.math.BigDecimal sumPostedByBranchAndPeriod(
            @Param("branchId") Long branchId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}

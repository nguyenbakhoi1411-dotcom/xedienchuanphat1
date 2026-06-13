package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.AccountingTransaction;
import com.chuanphat.warranty.accounting.enums.AccountingTransactionType;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AccountingTransactionRepository extends JpaRepository<AccountingTransaction, Long> {
    boolean existsBySourceNoAndType(String sourceNo, AccountingTransactionType type);

    @Query("""
            select coalesce(sum(t.amount), 0)
            from AccountingTransaction t
            where t.type = :type
              and t.transactionDate between :fromDate and :toDate
            """)
    BigDecimal sumAmountByTypeAndDateRange(
            @Param("type") AccountingTransactionType type,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

    @Query("""
            select coalesce(sum(t.costAmount), 0)
            from AccountingTransaction t
            where t.type = :type
              and t.transactionDate between :fromDate and :toDate
            """)
    BigDecimal sumCostAmountByTypeAndDateRange(
            @Param("type") AccountingTransactionType type,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );
}

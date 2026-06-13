package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.CashBook;
import com.chuanphat.warranty.accounting.enums.AccountingSourceType;
import com.chuanphat.warranty.accounting.enums.CashBookType;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CashBookRepository extends JpaRepository<CashBook, Long> {
    Page<CashBook> findBySourceType(AccountingSourceType sourceType, Pageable pageable);

    @Query("""
            select coalesce(sum(c.amountIn), 0)
            from CashBook c
            where c.transactionDate between :fromDate and :toDate
            """)
    BigDecimal sumCashIn(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query("""
            select coalesce(sum(c.amountOut), 0)
            from CashBook c
            where c.transactionDate between :fromDate and :toDate
            """)
    BigDecimal sumCashOut(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query("""
            select coalesce(sum(c.amountIn), 0) - coalesce(sum(c.amountOut), 0)
            from CashBook c
            where c.type in (:cashInType, :cashOutType)
            """)
    BigDecimal cashBalance(
            @Param("cashInType") CashBookType cashInType,
            @Param("cashOutType") CashBookType cashOutType
    );
}

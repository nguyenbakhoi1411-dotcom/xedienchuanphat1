package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.Receivable;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReceivableRepository extends JpaRepository<Receivable, Long> {
    List<Receivable> findByCustomerIdOrderByTransactionDateDescIdDesc(Long customerId);

    @Query("""
            select coalesce(sum(r.debitAmount), 0) - coalesce(sum(r.creditAmount), 0)
            from Receivable r
            where r.customerId = :customerId
            """)
    BigDecimal balanceByCustomerId(@Param("customerId") Long customerId);
}

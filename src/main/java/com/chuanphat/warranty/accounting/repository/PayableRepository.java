package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.Payable;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository("accountingPayableRepository")
public interface PayableRepository extends JpaRepository<Payable, Long> {
    List<Payable> findBySupplierIdOrderByTransactionDateDescIdDesc(Long supplierId);

    @Query("""
            select coalesce(sum(p.creditAmount), 0) - coalesce(sum(p.debitAmount), 0)
            from AccountingPayable p
            where p.supplierId = :supplierId
            """)
    BigDecimal balanceBySupplierId(@Param("supplierId") Long supplierId);
}

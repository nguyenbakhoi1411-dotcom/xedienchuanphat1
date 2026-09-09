package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.CustomerDebtLedger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerDebtLedgerRepository extends JpaRepository<CustomerDebtLedger, Long> {
    Page<CustomerDebtLedger> findByCustomerIdOrderByTransactionDateDesc(Long customerId, Pageable pageable);
}

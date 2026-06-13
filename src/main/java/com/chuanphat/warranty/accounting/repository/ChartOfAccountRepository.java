package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.ChartOfAccount;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChartOfAccountRepository extends JpaRepository<ChartOfAccount, Long> {
    Optional<ChartOfAccount> findByAccountCode(String accountCode);
    boolean existsByAccountCode(String accountCode);
    Page<ChartOfAccount> findByActive(boolean active, Pageable pageable);
}

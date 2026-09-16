package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.AccountMapping;
import com.chuanphat.warranty.accounting.enums.AccountMappingTransactionType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountMappingRepository extends JpaRepository<AccountMapping, Long> {
    Optional<AccountMapping> findByTransactionType(AccountMappingTransactionType transactionType);
}

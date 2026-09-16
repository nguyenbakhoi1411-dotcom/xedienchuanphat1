package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.AccountMappingHistory;
import com.chuanphat.warranty.accounting.enums.AccountMappingTransactionType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountMappingHistoryRepository extends JpaRepository<AccountMappingHistory, Long> {
    List<AccountMappingHistory> findByTransactionTypeOrderByChangedAtDesc(AccountMappingTransactionType transactionType);
}

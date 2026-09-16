package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.dto.AccountMappingDtos;
import com.chuanphat.warranty.accounting.entity.AccountMapping;
import com.chuanphat.warranty.accounting.entity.AccountMappingHistory;
import com.chuanphat.warranty.accounting.enums.AccountMappingTransactionType;
import com.chuanphat.warranty.accounting.repository.AccountMappingHistoryRepository;
import com.chuanphat.warranty.accounting.repository.AccountMappingRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountMappingService {
    private final AccountMappingRepository accountMappingRepository;
    private final AccountMappingHistoryRepository historyRepository;

    public AccountMappingService(AccountMappingRepository accountMappingRepository, AccountMappingHistoryRepository historyRepository) {
        this.accountMappingRepository = accountMappingRepository;
        this.historyRepository = historyRepository;
    }

    @Transactional(readOnly = true)
    public List<AccountMappingDtos.AccountMappingResponse> listMappings() {
        return accountMappingRepository.findAll().stream()
                .map(AccountMappingDtos.AccountMappingResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public String accountCodeFor(AccountMappingTransactionType transactionType) {
        return accountMappingRepository.findByTransactionType(transactionType)
                .map(AccountMapping::getAccountCode)
                .orElseThrow(() -> new IllegalStateException("Missing account mapping for " + transactionType));
    }

    @Transactional
    public AccountMappingDtos.AccountMappingResponse updateMapping(AccountMappingDtos.UpdateAccountMappingRequest request, String changedBy) {
        String accountCode = normalizeAccountCode(request.accountCode());
        AccountMapping mapping = accountMappingRepository.findByTransactionType(request.transactionType())
                .orElseGet(() -> {
                    AccountMapping created = new AccountMapping();
                    created.setTransactionType(request.transactionType());
                    return created;
                });
        String oldAccountCode = mapping.getAccountCode();

        mapping.updateAccountCode(accountCode, changedBy);
        AccountMapping saved = accountMappingRepository.save(mapping);
        historyRepository.save(new AccountMappingHistory(request.transactionType(), oldAccountCode, accountCode, changedBy));

        return AccountMappingDtos.AccountMappingResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<AccountMappingDtos.AccountMappingHistoryResponse> history(AccountMappingTransactionType transactionType) {
        return historyRepository.findByTransactionTypeOrderByChangedAtDesc(transactionType).stream()
                .map(AccountMappingDtos.AccountMappingHistoryResponse::from)
                .toList();
    }

    private static String normalizeAccountCode(String accountCode) {
        if (accountCode == null || accountCode.isBlank()) {
            throw new IllegalArgumentException("Account code is required");
        }
        return accountCode.trim();
    }
}

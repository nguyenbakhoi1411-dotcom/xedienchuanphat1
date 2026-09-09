package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.entity.AccountPeriodSummary;
import com.chuanphat.warranty.accounting.entity.JournalEntry;
import com.chuanphat.warranty.accounting.entity.JournalEntryLine;
import com.chuanphat.warranty.accounting.repository.AccountPeriodSummaryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;

@Service
public class AccountPeriodSummaryService {
    private final AccountPeriodSummaryRepository summaryRepository;

    public AccountPeriodSummaryService(AccountPeriodSummaryRepository summaryRepository) {
        this.summaryRepository = summaryRepository;
    }

    @Transactional
    public void upsert(JournalEntry entry) {
        if (entry.getLines() == null) return;
        
        for (JournalEntryLine line : entry.getLines()) {
            if (line.getAccount() == null) continue;
            
            String accountCode = line.getAccount().getAccountCode();
            Long branchId = entry.getBranchId();
            Integer year = entry.getAccountingYear();
            Integer month = entry.getAccountingMonth();

            Optional<AccountPeriodSummary> opt = summaryRepository
                .findByAccountingYearAndAccountingMonthAndAccountCodeAndBranchId(year, month, accountCode, branchId);
            
            AccountPeriodSummary summary = opt.orElseGet(() -> {
                AccountPeriodSummary s = new AccountPeriodSummary();
                s.setAccountingYear(year);
                s.setAccountingMonth(month);
                s.setAccountCode(accountCode);
                s.setBranchId(branchId);
                return s;
            });

            // If updating an existing entry, this approach might double count if we don't subtract old values.
            // For true upsert on insert/update/delete, we should ideally compute delta. 
            // Assuming this event is fired on initial save (or we recalculate the whole period).
            // For phase 1, we just add the debit and credit amount.
            summary.setDebitAmount(summary.getDebitAmount().add(line.getDebitAmount()));
            summary.setCreditAmount(summary.getCreditAmount().add(line.getCreditAmount()));
            summary.setLastUpdatedAt(OffsetDateTime.now());

            summaryRepository.save(summary);
        }
    }
}

package com.chuanphat.warranty.accounting.listener;

import com.chuanphat.warranty.accounting.event.JournalEntrySavedEvent;
import com.chuanphat.warranty.accounting.service.AccountPeriodSummaryService;
import com.chuanphat.warranty.accounting.service.ReportCacheService;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class AccountSummaryListener {

    private final AccountPeriodSummaryService summaryService;
    private final ReportCacheService reportCacheService;

    public AccountSummaryListener(AccountPeriodSummaryService summaryService, ReportCacheService reportCacheService) {
        this.summaryService = summaryService;
        this.reportCacheService = reportCacheService;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onJournalEntrySaved(JournalEntrySavedEvent event) {
        summaryService.upsert(event.getEntry());
        reportCacheService.invalidate(event.getEntry().getAccountingYear(), event.getEntry().getAccountingMonth());
    }
}

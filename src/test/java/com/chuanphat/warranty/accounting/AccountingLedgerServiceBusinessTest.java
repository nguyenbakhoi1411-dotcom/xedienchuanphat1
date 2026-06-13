package com.chuanphat.warranty.accounting;

import static com.chuanphat.warranty.BusinessCriticalTestSupport.withId;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.chuanphat.warranty.accounting.dto.JournalEntryLineRequest;
import com.chuanphat.warranty.accounting.dto.JournalEntryRequest;
import com.chuanphat.warranty.accounting.entity.ChartOfAccount;
import com.chuanphat.warranty.accounting.entity.JournalEntry;
import com.chuanphat.warranty.accounting.enums.AccountType;
import com.chuanphat.warranty.accounting.enums.JournalEntryStatus;
import com.chuanphat.warranty.accounting.enums.JournalReferenceType;
import com.chuanphat.warranty.accounting.enums.PaymentMethod;
import com.chuanphat.warranty.accounting.repository.ChartOfAccountRepository;
import com.chuanphat.warranty.accounting.repository.JournalEntryLineRepository;
import com.chuanphat.warranty.accounting.repository.JournalEntryRepository;
import com.chuanphat.warranty.accounting.service.AccountingLedgerService;
import com.chuanphat.warranty.accounting.service.AccountingPeriodService;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.exception.BusinessException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AccountingLedgerServiceBusinessTest {
    @Mock ChartOfAccountRepository accountRepository;
    @Mock JournalEntryRepository journalEntryRepository;
    @Mock JournalEntryLineRepository lineRepository;
    @Mock AccountingPeriodService accountingPeriodService;
    @Mock BranchSecurity branchSecurity;

    AccountingLedgerService service;
    Map<Long, JournalEntry> savedEntries;
    long nextEntryId;

    @BeforeEach
    void setUp() {
        service = new AccountingLedgerService(accountRepository, journalEntryRepository, lineRepository, accountingPeriodService, branchSecurity);
        savedEntries = new HashMap<>();
        nextEntryId = 1L;
        mockAccount("111", AccountType.ASSET);
        mockAccount("112", AccountType.ASSET);
        mockAccount("131", AccountType.ASSET);
        mockAccount("156", AccountType.ASSET);
        mockAccount("331", AccountType.LIABILITY);
        mockAccount("511", AccountType.REVENUE);
        mockAccount("632", AccountType.COST_OF_GOODS_SOLD);
        mockAccount("642", AccountType.EXPENSE);
        mockAccount("336", AccountType.LIABILITY);
        when(journalEntryRepository.save(any())).thenAnswer(invocation -> {
            JournalEntry entry = invocation.getArgument(0);
            if (entry.getId() == null) {
                com.chuanphat.warranty.BusinessCriticalTestSupport.setField(entry, "id", nextEntryId++);
            }
            savedEntries.put(entry.getId(), entry);
            return entry;
        });
        when(journalEntryRepository.findById(any())).thenAnswer(invocation -> Optional.ofNullable(savedEntries.get(invocation.getArgument(0))));
        when(journalEntryRepository.findByReferenceTypeAndReferenceIdAndStatus(any(), any(), any())).thenReturn(Optional.empty());
    }

    @Test
    void salesPurchaseReturnWarrantyAndServiceEntriesAreBalanced() {
        assertBalancedAfter(() -> service.postSalesOrder("SO-1", LocalDate.now(), new BigDecimal("30000000"), new BigDecimal("10000000"), new BigDecimal("20000000"), PaymentMethod.CASH, null, "sale"));
        assertBalancedAfter(() -> service.postPurchaseOrder("PO-1", LocalDate.now(), new BigDecimal("15000000"), new BigDecimal("5000000"), PaymentMethod.CASH, "purchase"));
        assertBalancedAfter(() -> service.postSalesReturnReversal("SR-1", LocalDate.now(), new BigDecimal("3000000"), new BigDecimal("2000000"), "return"));
        assertBalancedAfter(() -> service.postWarrantyWithParts("ST-1", LocalDate.now(), new BigDecimal("800000"), new BigDecimal("200000"), "642", "tech"));
        assertBalancedAfter(() -> service.postServiceWithVat("ST-2", LocalDate.now(), 1L, "Khach A", new BigDecimal("1000000"), BigDecimal.ZERO, new BigDecimal("300000"), PaymentMethod.CASH, "511", "tech"));
    }

    @Test
    void manualUnbalancedJournalEntryIsRejected() {
        JournalEntryRequest request = new JournalEntryRequest(
                LocalDate.now(),
                JournalReferenceType.MANUAL,
                "MAN-1",
                "bad entry",
                List.of(
                        new JournalEntryLineRequest("111", new BigDecimal("1000000"), BigDecimal.ZERO, "cash"),
                        new JournalEntryLineRequest("511", BigDecimal.ZERO, new BigDecimal("900000"), "revenue")
                )
        );

        assertThatThrownBy(() -> service.createJournalEntry(request)).isInstanceOf(BusinessException.class);
    }

    private void assertBalancedAfter(Runnable action) {
        ArgumentCaptor<JournalEntry> captor = ArgumentCaptor.forClass(JournalEntry.class);
        action.run();
        Mockito.verify(journalEntryRepository, Mockito.atLeastOnce()).save(captor.capture());
        JournalEntry entry = captor.getValue();
        assertThat(entry.getStatus()).isEqualTo(JournalEntryStatus.POSTED);
        assertThat(entry.getTotalDebit()).isEqualByComparingTo(entry.getTotalCredit());
        Mockito.clearInvocations(journalEntryRepository);
    }

    private void mockAccount(String code, AccountType type) {
        ChartOfAccount account = withId(new ChartOfAccount(), Long.parseLong(code.replaceAll("\\D", "").isBlank() ? "1" : code.replaceAll("\\D", "")));
        account.setAccountCode(code);
        account.setAccountName(code);
        account.setAccountType(type);
        account.setActive(true);
        when(accountRepository.findByAccountCode(code)).thenReturn(Optional.of(account));
    }
}

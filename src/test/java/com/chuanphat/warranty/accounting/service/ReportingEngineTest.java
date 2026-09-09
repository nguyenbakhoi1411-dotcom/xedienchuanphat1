package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.entity.ChartOfAccount;
import com.chuanphat.warranty.accounting.enums.JournalEntryStatus;
import com.chuanphat.warranty.accounting.repository.ChartOfAccountRepository;
import com.chuanphat.warranty.accounting.repository.JournalEntryRepository;
import com.chuanphat.warranty.accounting.repository.OpeningBalanceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ReportingEngineTest {

    @Mock
    private OpeningBalanceRepository openingBalanceRepository;

    @Mock
    private ChartOfAccountRepository chartOfAccountRepository;

    @Mock
    private JournalEntryRepository journalEntryRepository;

    @InjectMocks
    private ReportingEngine reportingEngine;

    private final Long branchId = 1L;
    private final Integer year = 2026;
    private final LocalDate fromDate = LocalDate.of(2026, 1, 1);
    private final LocalDate toDate = LocalDate.of(2026, 1, 31);

    @BeforeEach
    void setUp() {
    }

    private void setupMock(String maTK, String tinhChat, 
                           BigDecimal obNo, BigDecimal obCo, 
                           BigDecimal psNo, BigDecimal psCo) {
        
        ChartOfAccount coa = new ChartOfAccount();
        coa.setAccountCode(maTK);
        coa.setAccountNature(tinhChat);
        when(chartOfAccountRepository.findByAccountCode(maTK)).thenReturn(Optional.of(coa));

        when(openingBalanceRepository.sumDebitBalanceByAccountCodeAndYear(maTK, year, branchId)).thenReturn(obNo);
        when(openingBalanceRepository.sumCreditBalanceByAccountCodeAndYear(maTK, year, branchId)).thenReturn(obCo);

        when(journalEntryRepository.sumDebitByAccountCodePrefixAndDateRange(eq(maTK + "%"), eq(fromDate), eq(toDate), eq(branchId), eq(JournalEntryStatus.POSTED)))
                .thenReturn(psNo);
        when(journalEntryRepository.sumCreditByAccountCodePrefixAndDateRange(eq(maTK + "%"), eq(fromDate), eq(toDate), eq(branchId), eq(JournalEntryStatus.POSTED)))
                .thenReturn(psCo);
    }

    @Test
    void testCase1_DEBIT_NORMAL() {
        // TK DU_NO (111 Tiền mặt)
        // ob: duNo=10tr, duCo=0
        // ps: No=25tr, Co=18tr
        // Expected closing: duNo=17tr, duCo=0
        setupMock("111", "DEBIT_NORMAL", 
            new BigDecimal("10000000"), BigDecimal.ZERO, 
            new BigDecimal("25000000"), new BigDecimal("18000000"));

        ReportingEngine.BalanceResult result = reportingEngine.getClosingBalance("111", fromDate, toDate, year, branchId);
        
        assertEquals(new BigDecimal("17000000"), result.duNo);
        assertEquals(BigDecimal.ZERO, result.duCo);
    }

    @Test
    void testCase2_CREDIT_NORMAL() {
        // TK DU_CO (331 Phải trả NCC)
        // ob: duNo=0, duCo=40tr
        // ps: No=10tr (đã trả), Co=20tr (mua thêm)
        // Expected closing: duNo=0, duCo=50tr
        setupMock("331", "CREDIT_NORMAL", 
            BigDecimal.ZERO, new BigDecimal("40000000"), 
            new BigDecimal("10000000"), new BigDecimal("20000000"));

        ReportingEngine.BalanceResult result = reportingEngine.getClosingBalance("331", fromDate, toDate, year, branchId);
        
        assertEquals(BigDecimal.ZERO, result.duNo);
        assertEquals(new BigDecimal("50000000"), result.duCo);
    }

    @Test
    void testCase3_DUAL_NATURE() {
        // TK LUONG_TINH (131 Phải thu KH)
        // ob: duNo=30tr, duCo=5tr
        // ps: No=20tr, Co=15tr
        // Expected closing: duNo=50tr, duCo=20tr
        setupMock("131", "DUAL_NATURE", 
            new BigDecimal("30000000"), new BigDecimal("5000000"), 
            new BigDecimal("20000000"), new BigDecimal("15000000"));

        ReportingEngine.BalanceResult result = reportingEngine.getClosingBalance("131", fromDate, toDate, year, branchId);
        
        assertEquals(new BigDecimal("50000000"), result.duNo);
        assertEquals(new BigDecimal("20000000"), result.duCo);
    }
}

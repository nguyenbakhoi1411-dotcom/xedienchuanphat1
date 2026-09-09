package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.entity.ChartOfAccount;
import com.chuanphat.warranty.accounting.enums.JournalEntryStatus;
import com.chuanphat.warranty.accounting.repository.ChartOfAccountRepository;
import com.chuanphat.warranty.accounting.repository.JournalEntryRepository;
import com.chuanphat.warranty.accounting.repository.OpeningBalanceRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class ReportingEngine {

    private final OpeningBalanceRepository openingBalanceRepository;
    private final ChartOfAccountRepository chartOfAccountRepository;
    private final JournalEntryRepository journalEntryRepository;

    public ReportingEngine(OpeningBalanceRepository openingBalanceRepository,
                           ChartOfAccountRepository chartOfAccountRepository,
                           JournalEntryRepository journalEntryRepository) {
        this.openingBalanceRepository = openingBalanceRepository;
        this.chartOfAccountRepository = chartOfAccountRepository;
        this.journalEntryRepository = journalEntryRepository;
    }

    public static class BalanceResult {
        public BigDecimal duNo = BigDecimal.ZERO;
        public BigDecimal duCo = BigDecimal.ZERO;
        public BalanceResult(BigDecimal no, BigDecimal co) { this.duNo = no; this.duCo = co; }
    }

    public static class MovementResult {
        public BigDecimal phatSinhNo = BigDecimal.ZERO;
        public BigDecimal phatSinhCo = BigDecimal.ZERO;
        public MovementResult(BigDecimal no, BigDecimal co) { this.phatSinhNo = no; this.phatSinhCo = co; }
    }

    // 1. getOpeningBalance
    public BalanceResult getOpeningBalance(String maTK, LocalDate fromDate, Integer namKeToan, Long branchId) {
        // 1. Lấy số dư đầu năm từ OpeningBalance
        BigDecimal obNo = openingBalanceRepository.sumDebitBalanceByAccountCodeAndYear(maTK, namKeToan, branchId);
        if (obNo == null) obNo = BigDecimal.ZERO;
        BigDecimal obCo = openingBalanceRepository.sumCreditBalanceByAccountCodeAndYear(maTK, namKeToan, branchId);
        if (obCo == null) obCo = BigDecimal.ZERO;

        LocalDate firstDayOfYear = LocalDate.of(namKeToan, 1, 1);
        
        // Nếu fromDate là ngày đầu năm thì không cần tính phát sinh
        if (fromDate.isEqual(firstDayOfYear) || fromDate.isBefore(firstDayOfYear)) {
            return new BalanceResult(obNo, obCo);
        }

        LocalDate endDate = fromDate.minusDays(1);

        // 2. Tính phát sinh từ đầu năm đến fromDate - 1
        BigDecimal psNo = journalEntryRepository.sumDebitByAccountCodePrefixAndDateRange(maTK + "%", firstDayOfYear, endDate, branchId, JournalEntryStatus.POSTED);
        if (psNo == null) psNo = BigDecimal.ZERO;
        BigDecimal psCo = journalEntryRepository.sumCreditByAccountCodePrefixAndDateRange(maTK + "%", firstDayOfYear, endDate, branchId, JournalEntryStatus.POSTED);
        if (psCo == null) psCo = BigDecimal.ZERO;

        // 3. Xử lý theo tính chất tài khoản
        ChartOfAccount coa = chartOfAccountRepository.findByAccountCode(maTK).orElse(null);
        String tinhChat = coa != null ? coa.getAccountNature() : "DEBIT_NORMAL";

        if ("DEBIT_NORMAL".equals(tinhChat)) {
            BigDecimal net = obNo.subtract(obCo).add(psNo).subtract(psCo);
            return new BalanceResult(net.max(BigDecimal.ZERO), net.min(BigDecimal.ZERO).abs());
        } else if ("CREDIT_NORMAL".equals(tinhChat)) {
            BigDecimal net = obCo.subtract(obNo).add(psCo).subtract(psNo);
            return new BalanceResult(net.min(BigDecimal.ZERO).abs(), net.max(BigDecimal.ZERO));
        } else {
            // LUONG_TINH: không cấn trừ
            return new BalanceResult(obNo.add(psNo), obCo.add(psCo));
        }
    }

    // 2. getPeriodMovement
    public MovementResult getPeriodMovement(String maTK, LocalDate fromDate, LocalDate toDate, Long branchId) {
        BigDecimal no = journalEntryRepository.sumDebitByAccountCodePrefixAndDateRange(maTK + "%", fromDate, toDate, branchId, JournalEntryStatus.POSTED);
        if (no == null) no = BigDecimal.ZERO;
        BigDecimal co = journalEntryRepository.sumCreditByAccountCodePrefixAndDateRange(maTK + "%", fromDate, toDate, branchId, JournalEntryStatus.POSTED);
        if (co == null) co = BigDecimal.ZERO;

        return new MovementResult(no, co);
    }

    // 3. getClosingBalance
    public BalanceResult getClosingBalance(String maTK, LocalDate fromDate, LocalDate toDate, Integer namKeToan, Long branchId) {
        BalanceResult ob = getOpeningBalance(maTK, fromDate, namKeToan, branchId);
        MovementResult ps = getPeriodMovement(maTK, fromDate, toDate, branchId);

        ChartOfAccount coa = chartOfAccountRepository.findByAccountCode(maTK).orElse(null);
        String tinhChat = coa != null ? coa.getAccountNature() : "DEBIT_NORMAL";

        if ("DEBIT_NORMAL".equals(tinhChat)) {
            BigDecimal net = ob.duNo.subtract(ob.duCo).add(ps.phatSinhNo).subtract(ps.phatSinhCo);
            return new BalanceResult(net.max(BigDecimal.ZERO), net.min(BigDecimal.ZERO).abs());
        } else if ("CREDIT_NORMAL".equals(tinhChat)) {
            BigDecimal net = ob.duCo.subtract(ob.duNo).add(ps.phatSinhCo).subtract(ps.phatSinhNo);
            return new BalanceResult(net.min(BigDecimal.ZERO).abs(), net.max(BigDecimal.ZERO));
        } else {
            // LUONG_TINH
            return new BalanceResult(ob.duNo.add(ps.phatSinhNo), ob.duCo.add(ps.phatSinhCo));
        }
    }

    // 4. getNetForGroup
    public BigDecimal getNetForGroup(List<String> listMaTK, LocalDate fromDate, LocalDate toDate, Integer namKeToan, Long branchId) {
        BigDecimal total = BigDecimal.ZERO;
        for (String tk : listMaTK) {
            BalanceResult bal = getClosingBalance(tk, fromDate, toDate, namKeToan, branchId);
            ChartOfAccount coa = chartOfAccountRepository.findByAccountCode(tk).orElse(null);
            String tinhChat = coa != null ? coa.getAccountNature() : "DEBIT_NORMAL";

            if ("DEBIT_NORMAL".equals(tinhChat) || "DUAL_NATURE".equals(tinhChat)) {
                // Tùy theo Balance Sheet config, thường tài sản lấy Dư Nợ, Nguồn vốn lấy Dư Có.
                // Ở hàm này, ta trả về NET chung (Nợ - Có) để linh hoạt.
                total = total.add(bal.duNo).subtract(bal.duCo);
            } else {
                total = total.add(bal.duCo).subtract(bal.duNo);
            }
        }
        return total;
    }
}

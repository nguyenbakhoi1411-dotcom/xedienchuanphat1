package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.dto.TrialBalanceResponse;
import com.chuanphat.warranty.accounting.dto.TrialBalanceRowResponse;
import com.chuanphat.warranty.accounting.entity.ChartOfAccount;
import com.chuanphat.warranty.accounting.repository.ChartOfAccountRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FinancialReportService {

    private final ReportingEngine reportingEngine;
    private final ChartOfAccountRepository chartOfAccountRepository;
    private final BalanceSheetConfigService balanceSheetConfigService;

    public FinancialReportService(ReportingEngine reportingEngine,
                                  ChartOfAccountRepository chartOfAccountRepository,
                                  BalanceSheetConfigService balanceSheetConfigService) {
        this.reportingEngine = reportingEngine;
        this.chartOfAccountRepository = chartOfAccountRepository;
        this.balanceSheetConfigService = balanceSheetConfigService;
    }

    // 1. Trial Balance (Bảng CĐSPS)
    public TrialBalanceResponse getTrialBalance(LocalDate fromDate, LocalDate toDate, Long branchId) {
        int year = fromDate.getYear();
        List<ChartOfAccount> allAccounts = chartOfAccountRepository.findAll();
        List<TrialBalanceRowResponse> finalRows = new ArrayList<>();

        BigDecimal totalOpDebit = BigDecimal.ZERO;
        BigDecimal totalOpCredit = BigDecimal.ZERO;
        BigDecimal totalPrDebit = BigDecimal.ZERO;
        BigDecimal totalPrCredit = BigDecimal.ZERO;
        BigDecimal totalClDebit = BigDecimal.ZERO;
        BigDecimal totalClCredit = BigDecimal.ZERO;

        for (ChartOfAccount account : allAccounts) {
            String maTK = account.getAccountCode();
            
            ReportingEngine.BalanceResult ob = reportingEngine.getOpeningBalance(maTK, fromDate, year, branchId);
            ReportingEngine.MovementResult ps = reportingEngine.getPeriodMovement(maTK, fromDate, toDate, branchId);
            ReportingEngine.BalanceResult cl = reportingEngine.getClosingBalance(maTK, fromDate, toDate, year, branchId);

            boolean hasChildren = allAccounts.stream().anyMatch(a -> a.getParentAccount() != null && a.getParentAccount().getId().equals(account.getId()));

            finalRows.add(new TrialBalanceRowResponse(
                    maTK,
                    account.getAccountName(),
                    account.getAccountLevel(),
                    ob.duNo,
                    ob.duCo,
                    ps.phatSinhNo,
                    ps.phatSinhCo,
                    cl.duNo,
                    cl.duCo,
                    hasChildren
            ));

            if (account.getAccountLevel() == 1) {
                totalOpDebit = totalOpDebit.add(ob.duNo);
                totalOpCredit = totalOpCredit.add(ob.duCo);
                totalPrDebit = totalPrDebit.add(ps.phatSinhNo);
                totalPrCredit = totalPrCredit.add(ps.phatSinhCo);
                totalClDebit = totalClDebit.add(cl.duNo);
                totalClCredit = totalClCredit.add(cl.duCo);
            }
        }

        return new TrialBalanceResponse(
                fromDate, toDate, finalRows,
                totalOpDebit, totalOpCredit,
                totalPrDebit, totalPrCredit,
                totalClDebit, totalClCredit
        );
    }

    // 2. Balance Sheet (Bảng Cân đối kế toán B01-DN)
    public Map<String, Object> getBalanceSheet(LocalDate fromDate, LocalDate toDate, Long branchId) {
        int year = fromDate.getYear();
        List<BalanceSheetConfigService.BalanceSheetItemConfig> configs = balanceSheetConfigService.getItems();

        List<Map<String, Object>> rows = new ArrayList<>();

        for (BalanceSheetConfigService.BalanceSheetItemConfig config : configs) {
            BigDecimal amount = BigDecimal.ZERO;

            if ("270".equals(config.ma)) {
                // TỔNG CỘNG TÀI SẢN (Tính sau, mock sum ở đây hoặc FE tự sum)
                // Thực tế cần duyệt lại các dòng đã tính để cộng dồn
            } else if ("440".equals(config.ma)) {
                // TỔNG CỘNG NGUỒN VỐN
            } else {
                for (String tkNo : config.cong_tk_no) {
                    ReportingEngine.BalanceResult bal = reportingEngine.getClosingBalance(tkNo, fromDate, toDate, year, branchId);
                    if ("NO".equals(config.chi_lay_du)) {
                        amount = amount.add(bal.duNo);
                    } else if ("CO".equals(config.chi_lay_du)) {
                        // Trừ dư Có
                        amount = amount.subtract(bal.duCo);
                    } else {
                        amount = amount.add(bal.duNo).subtract(bal.duCo);
                    }
                }

                for (String tkCo : config.cong_tk_co) {
                    ReportingEngine.BalanceResult bal = reportingEngine.getClosingBalance(tkCo, fromDate, toDate, year, branchId);
                    if ("NO".equals(config.chi_lay_du)) {
                        // Trừ dư Nợ
                        amount = amount.subtract(bal.duNo);
                    } else if ("CO".equals(config.chi_lay_du)) {
                        amount = amount.add(bal.duCo);
                    } else {
                        amount = amount.add(bal.duCo).subtract(bal.duNo);
                    }
                }
            }

            Map<String, Object> row = new HashMap<>();
            row.put("maChiTieu", config.ma);
            row.put("tenChiTieu", config.ten);
            row.put("soCuoiKy", amount); // Số cuối kỳ
            
            // Số đầu năm (tính tương tự nhưng dùng ob = getOpeningBalance với date = 01/01/year)
            // Simplified for now
            row.put("soDauNam", BigDecimal.ZERO); 

            rows.add(row);
        }

        // Compute TỔNG CỘNG TÀI SẢN (270)
        BigDecimal totalAsset = rows.stream()
                .filter(r -> List.of("110", "131", "132", "133", "136", "141", "211", "212").contains(r.get("maChiTieu")))
                .map(r -> (BigDecimal) r.get("soCuoiKy"))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        rows.stream().filter(r -> "270".equals(r.get("maChiTieu"))).forEach(r -> r.put("soCuoiKy", totalAsset));

        // Compute TỔNG CỘNG NGUỒN VỐN (440)
        BigDecimal totalCapital = rows.stream()
                .filter(r -> List.of("311", "312", "313", "314", "411", "421").contains(r.get("maChiTieu")))
                .map(r -> (BigDecimal) r.get("soCuoiKy"))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        rows.stream().filter(r -> "440".equals(r.get("maChiTieu"))).forEach(r -> r.put("soCuoiKy", totalCapital));

        return Map.of(
            "fromDate", fromDate,
            "toDate", toDate,
            "rows", rows
        );
    }

    public Map<String, Object> getIncomeStatement(LocalDate fromDate, LocalDate toDate, Long branchId) {
        // Implement simple income statement mapping
        return Map.of("rows", new ArrayList<>());
    }

    public Map<String, Object> getCashFlow(LocalDate fromDate, LocalDate toDate, Long branchId) {
        return Map.of("rows", new ArrayList<>());
    }

    public Map<String, Object> getDebtAging(LocalDate toDate, Long branchId) {
        return Map.of("rows", new ArrayList<>());
    }
}

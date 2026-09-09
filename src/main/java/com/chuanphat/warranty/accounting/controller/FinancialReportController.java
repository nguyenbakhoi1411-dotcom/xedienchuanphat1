package com.chuanphat.warranty.accounting.controller;

import com.chuanphat.warranty.accounting.dto.FinancialStatementResponse;
import com.chuanphat.warranty.accounting.dto.GeneralLedgerResponse;
import com.chuanphat.warranty.accounting.dto.TrialBalanceResponse;
import com.chuanphat.warranty.accounting.dto.JournalEntryResponse;
import com.chuanphat.warranty.accounting.enums.JournalEntryStatus;
import com.chuanphat.warranty.accounting.service.AccountingLedgerService;
import com.chuanphat.warranty.accounting.service.FinancialExportService;
import com.chuanphat.warranty.accounting.service.FinancialReportService;
import com.chuanphat.warranty.common.dto.PageResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/accounting/reports")
@PreAuthorize("hasAnyRole('ADMIN')")
public class FinancialReportController {

    private final FinancialReportService reportService;
    private final AccountingLedgerService ledgerService;
    private final FinancialExportService exportService;

    public FinancialReportController(FinancialReportService reportService, 
                                     AccountingLedgerService ledgerService,
                                     FinancialExportService exportService) {
        this.reportService = reportService;
        this.ledgerService = ledgerService;
        this.exportService = exportService;
    }

    @GetMapping("/trial-balance")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public TrialBalanceResponse getTrialBalance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long branchId) {
        return reportService.getTrialBalance(fromDate, toDate, branchId);
    }

    @GetMapping("/trial-balance/export")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportTrialBalance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long branchId,
            @RequestParam(defaultValue = "excel") String format) {
        
        byte[] data = exportService.exportTrialBalance(fromDate, toDate, branchId, format);
        String filename = "Bang_CDSPS_" + fromDate + "_" + toDate + ("pdf".equals(format) ? ".pdf" : ".xlsx");
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(filename).build().toString())
                .contentType("pdf".equals(format) ? MediaType.APPLICATION_PDF : MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/balance-sheet")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public Map<String, Object> getBalanceSheet(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long branchId) {
        return reportService.getBalanceSheet(fromDate, toDate, branchId);
    }

    @GetMapping("/balance-sheet/export")
    @PreAuthorize("hasAuthority('REPORT_EXPORT')")
    public ResponseEntity<byte[]> exportBalanceSheet(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long branchId,
            @RequestParam(defaultValue = "excel") String format) {
        
        byte[] data = exportService.exportBalanceSheet(fromDate, toDate, branchId, format);
        String filename = "Bang_CDKT_" + fromDate + "_" + toDate + ("pdf".equals(format) ? ".pdf" : ".xlsx");
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(filename).build().toString())
                .contentType("pdf".equals(format) ? MediaType.APPLICATION_PDF : MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }

    @GetMapping("/income-statement")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public Map<String, Object> getIncomeStatement(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long branchId) {
        return reportService.getIncomeStatement(fromDate, toDate, branchId);
    }

    @GetMapping("/cash-flow")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public Map<String, Object> getCashFlow(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long branchId) {
        return reportService.getCashFlow(fromDate, toDate, branchId);
    }

    @GetMapping("/debt-aging")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public Map<String, Object> getDebtAging(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long branchId) {
        return reportService.getDebtAging(toDate, branchId);
    }

    @GetMapping("/journal-ledger")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public PageResponse<JournalEntryResponse> getJournalLedger(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int pageSize) {
        return ledgerService.journalEntries(JournalEntryStatus.POSTED, fromDate, toDate, branchId, keyword, page, pageSize, "entryDate,asc");
    }

    @GetMapping("/general-ledger/{maTK}")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public GeneralLedgerResponse getGeneralLedger(
            @PathVariable String maTK,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long branchId) {
        return ledgerService.generalLedger(maTK, fromDate, toDate, branchId);
    }
}


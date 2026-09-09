package com.chuanphat.warranty.accounting.controller;

import com.chuanphat.warranty.audit.annotation.Audited;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import com.chuanphat.warranty.accounting.dto.AccountingDebtRowResponse;
import com.chuanphat.warranty.accounting.dto.AccountingResultResponse;
import com.chuanphat.warranty.accounting.dto.BankAccountResponse;
import com.chuanphat.warranty.accounting.dto.CashFlowReportResponse;
import com.chuanphat.warranty.accounting.dto.ChartOfAccountRequest;
import com.chuanphat.warranty.accounting.dto.ChartOfAccountResponse;
import com.chuanphat.warranty.accounting.dto.CreateBankAccountRequest;
import com.chuanphat.warranty.accounting.dto.CreatePaymentRequest;
import com.chuanphat.warranty.accounting.dto.CreateReceiptRequest;
import com.chuanphat.warranty.accounting.dto.DebtAgingRowResponse;
import com.chuanphat.warranty.accounting.dto.DebtReportResponse;
import com.chuanphat.warranty.accounting.dto.ExpenseDtos;
import com.chuanphat.warranty.accounting.dto.FinancialStatementResponse;
import com.chuanphat.warranty.accounting.dto.FixedAssetDtos;
import com.chuanphat.warranty.accounting.dto.GeneralLedgerResponse;
import com.chuanphat.warranty.accounting.dto.JournalEntryRequest;
import com.chuanphat.warranty.accounting.dto.JournalEntryResponse;
import com.chuanphat.warranty.accounting.dto.PaymentVoucherResponse;
import com.chuanphat.warranty.accounting.dto.ProfitLossReportResponse;
import com.chuanphat.warranty.accounting.dto.ReceiptVoucherResponse;
import com.chuanphat.warranty.accounting.dto.RecordPurchaseDebtRequest;
import com.chuanphat.warranty.accounting.dto.RecordSalesPaymentRequest;
// import com.chuanphat.warranty.accounting.dto.TaxInvoiceDtos;
import com.chuanphat.warranty.accounting.dto.TrialBalanceResponse;
import com.chuanphat.warranty.accounting.enums.JournalEntryStatus;
import com.chuanphat.warranty.accounting.service.AccountingLedgerService;
import com.chuanphat.warranty.accounting.service.AccountingService;
import com.chuanphat.warranty.accounting.service.ExpenseService;
import com.chuanphat.warranty.accounting.service.FixedAssetService;
// import com.chuanphat.warranty.accounting.service.TaxInvoiceService;
import com.chuanphat.warranty.common.dto.PageResponse;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/accounting", "/api/v1/accounting"})
@PreAuthorize("hasAnyRole('ADMIN')")
public class AccountingController {
    private final AccountingService accountingService;
    private final AccountingLedgerService ledgerService;
    // private final ;
    private final ExpenseService expenseService;
    private final FixedAssetService fixedAssetService;

    public AccountingController(
            AccountingService accountingService,
            AccountingLedgerService ledgerService,
            
            ExpenseService expenseService,
            FixedAssetService fixedAssetService
    ) {
        this.accountingService = accountingService;
        this.ledgerService = ledgerService;
        // this.taxInvoiceService = taxInvoiceService;
        this.expenseService = expenseService;
        this.fixedAssetService = fixedAssetService;
    }

    // ── Chart of Accounts ──

    @GetMapping({"/accounts", "/chart-of-accounts"})
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public PageResponse<ChartOfAccountResponse> accounts(@RequestParam(required = false) Boolean active, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "100") int pageSize) {
        return ledgerService.accounts(active, page, pageSize);
    }

    @PostMapping({"/accounts", "/chart-of-accounts"})
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ACCOUNTING_CREATE')")
    @Audited(action = AuditAction.UPDATE_ACCOUNT, module = AuditModule.ACCOUNTING, entityType = "ChartOfAccount")
    public ChartOfAccountResponse createAccount(@Valid @RequestBody ChartOfAccountRequest request) {
        return ledgerService.createAccount(request);
    }

    // ── Journal Entries ──

    @PostMapping("/journal-entries")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ACCOUNTING_CREATE')")
    @Audited(action = AuditAction.CREATE_JOURNAL_ENTRY, module = AuditModule.ACCOUNTING, entityType = "JournalEntry")
    public JournalEntryResponse createJournalEntry(@Valid @RequestBody JournalEntryRequest request) {
        return ledgerService.createJournalEntry(request);
    }

    @PutMapping("/journal-entries/{id}")
    @PreAuthorize("hasAuthority('ACCOUNTING_CREATE')")
    @Audited(action = AuditAction.UPDATE_JOURNAL_ENTRY, module = AuditModule.ACCOUNTING, entityType = "JournalEntry")
    public JournalEntryResponse updateJournalEntry(@PathVariable Long id, @Valid @RequestBody JournalEntryRequest request) {
        return ledgerService.updateJournalEntry(id, request);
    }

    @PostMapping("/journal-entries/{id}/reverse")
    @PreAuthorize("hasAuthority('ACCOUNTING_POST')")
    @Audited(action = AuditAction.POST_JOURNAL_ENTRY, module = AuditModule.ACCOUNTING, entityType = "JournalEntry")
    public JournalEntryResponse reverseJournalEntry(@PathVariable Long id) {
        return ledgerService.reverseJournalEntry(id);
    }

    @GetMapping("/journal-entries")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public PageResponse<JournalEntryResponse> journalEntries(
            @RequestParam(required = false) JournalEntryStatus status,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(defaultValue = "entryDate,desc") String sort
    ) {
        return ledgerService.journalEntries(status, fromDate, toDate, branchId, keyword, page, pageSize, sort);
    }

    @PostMapping("/journal-entries/{id}/post")
    @PreAuthorize("hasAuthority('ACCOUNTING_POST')")
    @Audited(action = AuditAction.POST_JOURNAL_ENTRY, module = AuditModule.ACCOUNTING, entityType = "JournalEntry")
    public JournalEntryResponse postJournalEntry(@PathVariable Long id) {
        return ledgerService.postJournalEntry(id);
    }

    @PostMapping("/journal-entries/{id}/cancel")
    @PreAuthorize("hasAuthority('ACCOUNTING_CANCEL')")
    @Audited(action = AuditAction.CANCEL_JOURNAL_ENTRY, module = AuditModule.ACCOUNTING, entityType = "JournalEntry")
    public JournalEntryResponse cancelJournalEntry(@PathVariable Long id) {
        return ledgerService.cancelJournalEntry(id);
    }

    // ── Bank Accounts ──

    @PostMapping("/bank-accounts")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public BankAccountResponse createBankAccount(@Valid @RequestBody CreateBankAccountRequest request) {
        return accountingService.createBankAccount(request);
    }

    @GetMapping("/bank-accounts")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public List<BankAccountResponse> bankAccounts() {
        return accountingService.bankAccounts();
    }

    // ── Receipts & Payments ──

    @PostMapping("/receipts")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('RECEIPT_CREATE')")
    @Audited(action = AuditAction.CREATE_RECEIPT, module = AuditModule.ACCOUNTING, entityType = "Receipt")
    public AccountingResultResponse createReceipt(@Valid @RequestBody CreateReceiptRequest request) {
        return accountingService.createReceipt(request);
    }

    @PostMapping("/payments")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('PAYMENT_CREATE')")
    @Audited(action = AuditAction.CREATE_PAYMENT, module = AuditModule.ACCOUNTING, entityType = "Payment")
    public AccountingResultResponse createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        return accountingService.createPayment(request);
    }

    @PostMapping("/sales-payments")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('RECEIPT_CREATE')")
    public AccountingResultResponse recordPaidSalesOrder(@Valid @RequestBody RecordSalesPaymentRequest request) {
        return accountingService.recordPaidSalesOrder(request);
    }

    @PostMapping("/purchase-debts")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('PAYMENT_CREATE')")
    public AccountingResultResponse recordPurchaseDebt(@Valid @RequestBody RecordPurchaseDebtRequest request) {
        return accountingService.recordPurchaseDebt(request);
    }

    @GetMapping("/receipts")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public PageResponse<ReceiptVoucherResponse> receipts(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int pageSize) {
        return accountingService.receipts(page, pageSize);
    }

    @GetMapping("/receipts/{id}/pdf")
    @PreAuthorize("hasAuthority('ACCOUNTING_EXPORT')")
    public ResponseEntity<byte[]> receiptPdf(@PathVariable Long id) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=receipt-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(accountingService.receiptPdf(id));
    }

    @GetMapping("/payments")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public PageResponse<PaymentVoucherResponse> payments(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int pageSize) {
        return accountingService.payments(page, pageSize);
    }

    @GetMapping("/payments/{id}/pdf")
    @PreAuthorize("hasAuthority('ACCOUNTING_EXPORT')")
    public ResponseEntity<byte[]> paymentPdf(@PathVariable Long id) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=payment-voucher-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(accountingService.paymentPdf(id));
    }

    // ── Debts ──

    @GetMapping("/debts")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public PageResponse<AccountingDebtRowResponse> debts(@RequestParam(required = false) String partyType, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int pageSize) {
        return accountingService.debts(partyType, page, pageSize);
    }

    @GetMapping("/customers/{customerId}/debt")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public DebtReportResponse customerDebt(@PathVariable Long customerId) {
        return accountingService.customerDebt(customerId);
    }

    @GetMapping("/suppliers/{supplierId}/debt")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public DebtReportResponse supplierDebt(@PathVariable Long supplierId) {
        return accountingService.supplierDebt(supplierId);
    }

    // ── Reports ──

    @GetMapping("/reports/cash-flow")
    @PreAuthorize("hasAuthority('ACCOUNTING_REPORT')")
    public CashFlowReportResponse cashFlow(@RequestParam LocalDate fromDate, @RequestParam LocalDate toDate) {
        return accountingService.cashFlow(fromDate, toDate);
    }

    @GetMapping("/reports/customer-debt-aging")
    @PreAuthorize("hasAuthority('ACCOUNTING_REPORT')")
    public List<DebtAgingRowResponse> customerDebtAging(@RequestParam(required = false) LocalDate asOfDate) {
        return accountingService.customerDebtAging(asOfDate == null ? LocalDate.now() : asOfDate);
    }

    @GetMapping("/reports/supplier-debt-aging")
    @PreAuthorize("hasAuthority('ACCOUNTING_REPORT')")
    public List<DebtAgingRowResponse> supplierDebtAging(@RequestParam(required = false) LocalDate asOfDate) {
        return accountingService.supplierDebtAging(asOfDate == null ? LocalDate.now() : asOfDate);
    }

    @GetMapping("/reports/profit-loss")
    @PreAuthorize("hasAuthority('ACCOUNTING_REPORT')")
    public ProfitLossReportResponse profitLoss(@RequestParam LocalDate fromDate, @RequestParam LocalDate toDate) {
        return accountingService.profitLoss(fromDate, toDate);
    }

    @GetMapping("/reports/trial-balance")
    @PreAuthorize("hasAuthority('ACCOUNTING_REPORT')")
    public TrialBalanceResponse trialBalance(
            @RequestParam LocalDate fromDate,
            @RequestParam LocalDate toDate,
            @RequestParam(required = false) Long branchId
    ) {
        return ledgerService.trialBalance(fromDate, toDate, branchId);
    }

    @GetMapping("/reports/balance-sheet")
    @PreAuthorize("hasAuthority('ACCOUNTING_REPORT')")
    public FinancialStatementResponse balanceSheet(@RequestParam LocalDate fromDate, @RequestParam LocalDate toDate) {
        return ledgerService.balanceSheet(fromDate, toDate);
    }

    @GetMapping("/reports/income-statement")
    @PreAuthorize("hasAuthority('ACCOUNTING_REPORT')")
    public FinancialStatementResponse incomeStatement(@RequestParam LocalDate fromDate, @RequestParam LocalDate toDate) {
        return ledgerService.incomeStatement(fromDate, toDate);
    }

    @GetMapping("/reports/cash-flow-ledger")
    @PreAuthorize("hasAuthority('ACCOUNTING_REPORT')")
    public FinancialStatementResponse cashFlowLedger(@RequestParam LocalDate fromDate, @RequestParam LocalDate toDate) {
        return ledgerService.cashFlow(fromDate, toDate);
    }

    @GetMapping("/reports/general-ledger")
    @PreAuthorize("hasAuthority('ACCOUNTING_REPORT')")
    public GeneralLedgerResponse generalLedger(
            @RequestParam String accountCode,
            @RequestParam LocalDate fromDate,
            @RequestParam LocalDate toDate,
            @RequestParam(required = false) Long branchId
    ) {
        return ledgerService.generalLedger(accountCode, fromDate, toDate, branchId);
    }

    @GetMapping("/reports/journal-ledger")
    @PreAuthorize("hasAuthority('ACCOUNTING_REPORT')")
    public PageResponse<JournalEntryResponse> journalLedger(
            @RequestParam LocalDate fromDate,
            @RequestParam LocalDate toDate,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String accountCode,
            @RequestParam(required = false) String referenceType,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int pageSize
    ) {
        return ledgerService.journalLedger(fromDate, toDate, branchId, accountCode, referenceType, keyword, page, pageSize);
    }

    @GetMapping("/reports/detail-debt/receivable")
    @PreAuthorize("hasAuthority('ACCOUNTING_REPORT')")
    public GeneralLedgerResponse detailDebtReceivable(
            @RequestParam Long customerId,
            @RequestParam LocalDate fromDate,
            @RequestParam LocalDate toDate
    ) {
        return ledgerService.detailDebtReceivable(customerId, fromDate, toDate);
    }

    @GetMapping("/reports/detail-debt/payable")
    @PreAuthorize("hasAuthority('ACCOUNTING_REPORT')")
    public GeneralLedgerResponse detailDebtPayable(
            @RequestParam Long supplierId,
            @RequestParam LocalDate fromDate,
            @RequestParam LocalDate toDate
    ) {
        return ledgerService.detailDebtPayable(supplierId, fromDate, toDate);
    }

    // ── Tax Invoices (VAT) ──

    @GetMapping("/tax-invoices/output")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public PageResponse<Object> outputInvoices(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return null; // taxInvoiceService.listOutput(branchId, status, page, pageSize);
    }

    @GetMapping("/tax-invoices/input")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public PageResponse<Object> inputInvoices(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return null; // taxInvoiceService.listInput(branchId, status, page, pageSize);
    }

    /*
    @PostMapping("/tax-invoices/output")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ACCOUNTING_CREATE')")
    public Object createOutputInvoice(@Valid @RequestBody TaxInvoiceDtos.CreateTaxInvoiceRequest request) {
        return taxInvoiceService.createOutputInvoice(request);
    }

    @PostMapping("/tax-invoices/input")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ACCOUNTING_CREATE')")
    public Object createInputInvoice(@Valid @RequestBody TaxInvoiceDtos.CreateTaxInvoiceRequest request) {
        return taxInvoiceService.createInputInvoice(request);
    }

    @PostMapping("/tax-invoices/{id}/issue")
    @PreAuthorize("hasAuthority('ACCOUNTING_POST')")
    public Object issueInvoice(@PathVariable Long id) {
        return taxInvoiceService.issue(id);
    }

    @PostMapping("/tax-invoices/{id}/cancel")
    @PreAuthorize("hasAuthority('ACCOUNTING_CANCEL')")
    public Object cancelInvoice(@PathVariable Long id, @RequestBody TaxInvoiceDtos.CancelInvoiceRequest request) {
        return taxInvoiceService.cancel(id, request.reason());
    }

    @PostMapping("/tax-invoices/{id}/adjust")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ACCOUNTING_CREATE')")
    public Object adjustInvoice(@PathVariable Long id, @RequestBody TaxInvoiceDtos.CreateTaxInvoiceRequest request) {
        return taxInvoiceService.adjust(id, request);
    }

    @GetMapping("/reports/vat-report")
    @PreAuthorize("hasAuthority('ACCOUNTING_REPORT')")
    public TaxInvoiceDtos.VatReportResponse vatReport(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(required = false) Long branchId) {
        return taxInvoiceService.vatReport(year, month, branchId);
    }
    */

    // ── Expenses ──

    @GetMapping("/expenses")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public PageResponse<ExpenseDtos.ExpenseResponse> expenses(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return expenseService.list(branchId, category, page, pageSize);
    }

    @PostMapping("/expenses")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ACCOUNTING_CREATE')")
    public ExpenseDtos.ExpenseResponse createExpense(@Valid @RequestBody ExpenseDtos.CreateExpenseRequest request) {
        return expenseService.create(request);
    }

    @PostMapping("/expenses/{id}/post")
    @PreAuthorize("hasAuthority('ACCOUNTING_POST')")
    public ExpenseDtos.ExpenseResponse postExpense(@PathVariable Long id) {
        return expenseService.post(id);
    }

    @DeleteMapping("/expenses/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('ACCOUNTING_CREATE')")
    public void deleteExpense(@PathVariable Long id) {
        expenseService.delete(id);
    }

    // ── Fixed Assets ──

    @GetMapping("/fixed-assets")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public List<FixedAssetDtos.FixedAssetResponse> fixedAssets(@RequestParam(required = false) Long branchId) {
        return fixedAssetService.list(branchId);
    }

    @GetMapping("/fixed-assets/{id}")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public FixedAssetDtos.FixedAssetResponse getFixedAsset(@PathVariable Long id) {
        return fixedAssetService.get(id);
    }

    @PostMapping("/fixed-assets")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ACCOUNTING_CREATE')")
    public FixedAssetDtos.FixedAssetResponse createFixedAsset(@Valid @RequestBody FixedAssetDtos.CreateFixedAssetRequest request) {
        return fixedAssetService.create(request);
    }

    @PostMapping("/fixed-assets/run-depreciation")
    @PreAuthorize("hasAuthority('ACCOUNTING_POST')")
    public FixedAssetDtos.DepreciationRunResult runDepreciation(
            @RequestParam int year,
            @RequestParam int month) {
        return fixedAssetService.runMonthlyDepreciation(year, month);
    }

    @PostMapping("/fixed-assets/{id}/dispose")
    @PreAuthorize("hasAuthority('ACCOUNTING_CREATE')")
    public FixedAssetDtos.FixedAssetResponse disposeAsset(
            @PathVariable Long id,
            @RequestBody FixedAssetDtos.DisposeRequest request) {
        return fixedAssetService.dispose(id, request.disposalAmount(), request.note());
    }

    @GetMapping("/fixed-assets/{id}/depreciation-history")
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public List<FixedAssetDtos.DepreciationLineResult> depreciationHistory(@PathVariable Long id) {
        return fixedAssetService.depreciationHistory(id);
    }
}


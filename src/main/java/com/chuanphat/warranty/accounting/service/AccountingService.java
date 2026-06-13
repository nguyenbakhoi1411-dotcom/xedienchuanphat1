package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.dto.AccountingResultResponse;
import com.chuanphat.warranty.accounting.dto.AccountingDebtRowResponse;
import com.chuanphat.warranty.accounting.dto.BankAccountResponse;
import com.chuanphat.warranty.accounting.dto.CashFlowReportResponse;
import com.chuanphat.warranty.accounting.dto.CreateBankAccountRequest;
import com.chuanphat.warranty.accounting.dto.CreatePaymentRequest;
import com.chuanphat.warranty.accounting.dto.CreateReceiptRequest;
import com.chuanphat.warranty.accounting.dto.DebtAgingRowResponse;
import com.chuanphat.warranty.accounting.dto.DebtLineResponse;
import com.chuanphat.warranty.accounting.dto.DebtReportResponse;
import com.chuanphat.warranty.accounting.dto.PaymentVoucherResponse;
import com.chuanphat.warranty.accounting.dto.ProfitLossReportResponse;
import com.chuanphat.warranty.accounting.dto.ReceiptVoucherResponse;
import com.chuanphat.warranty.accounting.dto.RecordPurchaseDebtRequest;
import com.chuanphat.warranty.accounting.dto.RecordSalesPaymentRequest;
import com.chuanphat.warranty.accounting.entity.AccountingTransaction;
import com.chuanphat.warranty.accounting.entity.BankAccount;
import com.chuanphat.warranty.accounting.entity.CashBook;
import com.chuanphat.warranty.accounting.entity.Payable;
import com.chuanphat.warranty.accounting.entity.Receivable;
import com.chuanphat.warranty.accounting.enums.AccountingSourceType;
import com.chuanphat.warranty.accounting.enums.AccountingTransactionType;
import com.chuanphat.warranty.accounting.enums.CashBookType;
import com.chuanphat.warranty.accounting.enums.DebtStatus;
import com.chuanphat.warranty.accounting.enums.PayableType;
import com.chuanphat.warranty.accounting.enums.PaymentMethod;
import com.chuanphat.warranty.accounting.enums.ReceivableType;
import com.chuanphat.warranty.accounting.repository.AccountingTransactionRepository;
import com.chuanphat.warranty.accounting.repository.BankAccountRepository;
import com.chuanphat.warranty.accounting.repository.CashBookRepository;
import com.chuanphat.warranty.accounting.repository.PayableRepository;
import com.chuanphat.warranty.accounting.repository.ReceivableRepository;
import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.repository.CustomerRepository;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import com.chuanphat.warranty.reports.ExportDocumentService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountingService {
    private final AccountingTransactionRepository transactionRepository;
    private final CashBookRepository cashBookRepository;
    private final BankAccountRepository bankAccountRepository;
    private final ReceivableRepository receivableRepository;
    private final PayableRepository payableRepository;
    private final AccountingLedgerService ledgerService;
    private final CustomerRepository customerRepository;
    private final BranchSecurity branchSecurity;
    private final ExportDocumentService exportDocumentService;
    private final AccountingPeriodService accountingPeriodService;

    public AccountingService(
            AccountingTransactionRepository transactionRepository,
            CashBookRepository cashBookRepository,
            BankAccountRepository bankAccountRepository,
            ReceivableRepository receivableRepository,
            PayableRepository payableRepository,
            AccountingLedgerService ledgerService,
            CustomerRepository customerRepository,
            BranchSecurity branchSecurity,
            ExportDocumentService exportDocumentService,
            AccountingPeriodService accountingPeriodService
    ) {
        this.transactionRepository = transactionRepository;
        this.cashBookRepository = cashBookRepository;
        this.bankAccountRepository = bankAccountRepository;
        this.receivableRepository = receivableRepository;
        this.payableRepository = payableRepository;
        this.ledgerService = ledgerService;
        this.customerRepository = customerRepository;
        this.branchSecurity = branchSecurity;
        this.exportDocumentService = exportDocumentService;
        this.accountingPeriodService = accountingPeriodService;
    }

    @Transactional
    public BankAccountResponse createBankAccount(CreateBankAccountRequest request) {
        bankAccountRepository.findByAccountNumber(request.accountNumber()).ifPresent(account -> {
            throw new BusinessException("Bank account already exists: " + request.accountNumber());
        });

        BankAccount account = new BankAccount();
        account.setBankName(request.bankName());
        account.setAccountNumber(request.accountNumber());
        account.setAccountHolder(request.accountHolder());
        account.setCurrentBalance(request.openingBalance());
        return BankAccountResponse.from(bankAccountRepository.save(account));
    }

    @Transactional
    public AccountingResultResponse recordPaidSalesOrder(RecordSalesPaymentRequest request) {
        requireCustomerBranch(request.customerId());
        assertPeriodNotLocked(request.saleDate(), request.customerId());
        validatePaidNotGreaterThanTotal(request.paidAmount(), request.totalAmount());
        ensureSalesOrderNotRecorded(request.salesOrderNo());

        saveTransaction(
                AccountingTransactionType.SALES_REVENUE,
                AccountingSourceType.SALES_ORDER,
                request.salesOrderNo(),
                request.saleDate(),
                request.totalAmount(),
                null,
                request.description()
        );

        if (request.costAmount().compareTo(BigDecimal.ZERO) > 0) {
            saveTransaction(
                    AccountingTransactionType.COST_OF_GOODS_SOLD,
                    AccountingSourceType.SALES_ORDER,
                    request.salesOrderNo(),
                    request.saleDate(),
                    BigDecimal.ZERO,
                    request.costAmount(),
                    "Cost of goods sold for " + request.salesOrderNo()
            );
        }

        saveReceivable(
                request.customerId(),
                request.customerName(),
                ReceivableType.SALE,
                request.saleDate(),
                request.totalAmount(),
                BigDecimal.ZERO,
                AccountingSourceType.SALES_ORDER,
                request.salesOrderNo(),
                "Receivable from sales order " + request.salesOrderNo()
        );

        if (request.paidAmount().compareTo(BigDecimal.ZERO) > 0) {
            receiveMoney(
                    request.paymentMethod(),
                    request.bankAccountId(),
                    request.saleDate(),
                    request.paidAmount(),
                    AccountingSourceType.SALES_ORDER,
                    request.salesOrderNo(),
                    "Paid sales order " + request.salesOrderNo()
            );
            saveReceivable(
                    request.customerId(),
                    request.customerName(),
                    ReceivableType.RECEIPT,
                    request.saleDate(),
                    BigDecimal.ZERO,
                    request.paidAmount(),
                    AccountingSourceType.SALES_ORDER,
                    request.salesOrderNo(),
                    "Customer paid sales order " + request.salesOrderNo()
            );
        }

        BigDecimal remainingDebt = request.totalAmount().subtract(request.paidAmount());
        ledgerService.postSalesOrder(
                request.salesOrderNo(),
                request.saleDate(),
                request.totalAmount(),
                request.paidAmount(),
                request.costAmount(),
                request.paymentMethod(),
                request.bankAccountId(),
                request.description()
        );

        return new AccountingResultResponse(
                request.salesOrderNo(),
                request.totalAmount(),
                request.paidAmount(),
                remainingDebt,
                "Sales accounting recorded"
        );
    }

    @Transactional
    public AccountingResultResponse createReceipt(CreateReceiptRequest request) {
        requireCustomerBranch(request.customerId());
        assertPeriodNotLocked(request.receiptDate(), request.customerId());
        BigDecimal currentDebt = receivableRepository.balanceByCustomerId(request.customerId());
        if (request.amount().compareTo(currentDebt) > 0) {
            throw new BusinessException("Receipt exceeds customer remaining debt");
        }

        receiveMoney(
                request.paymentMethod(),
                request.bankAccountId(),
                request.receiptDate(),
                request.amount(),
                AccountingSourceType.RECEIPT_VOUCHER,
                request.voucherNo(),
                request.reason()
        );
        saveTransaction(
                AccountingTransactionType.RECEIPT,
                AccountingSourceType.RECEIPT_VOUCHER,
                request.voucherNo(),
                request.receiptDate(),
                request.amount(),
                null,
                request.reason()
        );
        saveReceivable(
                request.customerId(),
                request.customerName(),
                ReceivableType.RECEIPT,
                request.receiptDate(),
                BigDecimal.ZERO,
                request.amount(),
                AccountingSourceType.RECEIPT_VOUCHER,
                request.voucherNo(),
                request.reason()
        );
        ledgerService.postReceipt(request.voucherNo(), request.receiptDate(), request.amount(), request.paymentMethod(), request.reason());

        BigDecimal remainingDebt = currentDebt.subtract(request.amount());
        return new AccountingResultResponse(request.voucherNo(), request.amount(), request.amount(), remainingDebt, "Receipt posted");
    }

    @Transactional
    public AccountingResultResponse createPayment(CreatePaymentRequest request) {
        assertPeriodNotLocked(request.paymentDate(), null);
        BigDecimal currentDebt = payableRepository.balanceBySupplierId(request.supplierId());
        if (request.amount().compareTo(currentDebt) > 0) {
            throw new BusinessException("Payment exceeds supplier remaining debt");
        }

        payMoney(
                request.paymentMethod(),
                request.bankAccountId(),
                request.paymentDate(),
                request.amount(),
                AccountingSourceType.PAYMENT_VOUCHER,
                request.voucherNo(),
                request.reason()
        );
        saveTransaction(
                AccountingTransactionType.PAYMENT,
                AccountingSourceType.PAYMENT_VOUCHER,
                request.voucherNo(),
                request.paymentDate(),
                request.amount(),
                null,
                request.reason()
        );
        savePayable(
                request.supplierId(),
                request.supplierName(),
                PayableType.PAYMENT,
                request.paymentDate(),
                request.amount(),
                BigDecimal.ZERO,
                AccountingSourceType.PAYMENT_VOUCHER,
                request.voucherNo(),
                request.reason()
        );
        ledgerService.postPayment(request.voucherNo(), request.paymentDate(), request.amount(), request.paymentMethod(), request.reason());

        BigDecimal remainingDebt = currentDebt.subtract(request.amount());
        return new AccountingResultResponse(request.voucherNo(), request.amount(), request.amount(), remainingDebt, "Payment posted");
    }

    @Transactional
    public AccountingResultResponse recordSalesRefund(
            String returnNo,
            LocalDate returnDate,
            Long customerId,
            String customerName,
            BigDecimal refundAmount,
            PaymentMethod paymentMethod,
            Long bankAccountId,
            String description
    ) {
        assertPeriodNotLocked(returnDate, customerId);
        if (refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("refundAmount must be greater than zero");
        }
        payMoney(
                paymentMethod,
                bankAccountId,
                returnDate,
                refundAmount,
                AccountingSourceType.SALES_RETURN,
                returnNo,
                description
        );
        saveTransaction(
                AccountingTransactionType.REFUND,
                AccountingSourceType.SALES_RETURN,
                returnNo,
                returnDate,
                refundAmount,
                null,
                description
        );
        saveReceivable(
                customerId,
                customerName,
                ReceivableType.RETURN,
                returnDate,
                BigDecimal.ZERO,
                refundAmount,
                AccountingSourceType.SALES_RETURN,
                returnNo,
                description
        );
        ledgerService.postSalesReturn(returnNo, returnDate, refundAmount, paymentMethod, description);
        return new AccountingResultResponse(returnNo, refundAmount, refundAmount, receivableRepository.balanceByCustomerId(customerId), "Sales return refund posted");
    }

    @Transactional
    public AccountingResultResponse recordPurchaseDebt(RecordPurchaseDebtRequest request) {
        assertPeriodNotLocked(request.purchaseDate(), null);
        saveTransaction(
                AccountingTransactionType.PAYABLE,
                AccountingSourceType.PURCHASE_ORDER,
                request.purchaseOrderNo(),
                request.purchaseDate(),
                request.totalAmount(),
                null,
                request.description()
        );
        savePayable(
                request.supplierId(),
                request.supplierName(),
                PayableType.PURCHASE,
                request.purchaseDate(),
                BigDecimal.ZERO,
                request.totalAmount(),
                AccountingSourceType.PURCHASE_ORDER,
                request.purchaseOrderNo(),
                request.description()
        );
        ledgerService.postPurchaseOrder(
                request.purchaseOrderNo(),
                request.purchaseDate(),
                request.totalAmount(),
                BigDecimal.ZERO,
                PaymentMethod.CASH,
                request.description()
        );

        return new AccountingResultResponse(
                request.purchaseOrderNo(),
                request.totalAmount(),
                BigDecimal.ZERO,
                payableRepository.balanceBySupplierId(request.supplierId()),
                "Purchase payable recorded"
        );
    }

    @Transactional
    public AccountingResultResponse recordPurchaseOrder(
            String purchaseOrderNo,
            LocalDate purchaseDate,
            Long supplierId,
            String supplierName,
            BigDecimal totalAmount,
            BigDecimal paidAmount,
            String description
    ) {
        assertPeriodNotLocked(purchaseDate, null);
        BigDecimal remainingDebt = totalAmount.subtract(paidAmount);
        if (remainingDebt.compareTo(BigDecimal.ZERO) > 0) {
            saveTransaction(
                    AccountingTransactionType.PAYABLE,
                    AccountingSourceType.PURCHASE_ORDER,
                    purchaseOrderNo,
                    purchaseDate,
                    remainingDebt,
                    null,
                    description
            );
            savePayable(
                    supplierId,
                    supplierName,
                    PayableType.PURCHASE,
                    purchaseDate,
                    BigDecimal.ZERO,
                    remainingDebt,
                    AccountingSourceType.PURCHASE_ORDER,
                    purchaseOrderNo,
                    description
            );
        }
        ledgerService.postPurchaseOrder(
                purchaseOrderNo,
                purchaseDate,
                totalAmount,
                paidAmount,
                PaymentMethod.CASH,
                description
        );
        return new AccountingResultResponse(purchaseOrderNo, totalAmount, paidAmount, remainingDebt, "Purchase accounting recorded");
    }

    @Transactional(readOnly = true)
    public List<BankAccountResponse> bankAccounts() {
        return bankAccountRepository.findAll().stream()
                .filter(BankAccount::isActive)
                .map(BankAccountResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<ReceiptVoucherResponse> receipts(int page, int pageSize) {
        return PageResponse.from(cashBookRepository
                .findBySourceType(AccountingSourceType.RECEIPT_VOUCHER, PageRequest.of(page, pageSize))
                .map(ReceiptVoucherResponse::from));
    }

    @Transactional(readOnly = true)
    public PageResponse<PaymentVoucherResponse> payments(int page, int pageSize) {
        return PageResponse.from(cashBookRepository
                .findBySourceType(AccountingSourceType.PAYMENT_VOUCHER, PageRequest.of(page, pageSize))
                .map(PaymentVoucherResponse::from));
    }

    @Transactional(readOnly = true)
    public byte[] receiptPdf(Long id) {
        CashBook cashBook = cashBookRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Receipt not found: " + id));
        return voucherPdf("Phieu thu", cashBook, cashBook.getAmountIn());
    }

    @Transactional(readOnly = true)
    public byte[] paymentPdf(Long id) {
        CashBook cashBook = cashBookRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Payment not found: " + id));
        return voucherPdf("Phieu chi", cashBook, cashBook.getAmountOut());
    }

    @Transactional(readOnly = true)
    public PageResponse<AccountingDebtRowResponse> debts(String partyType, int page, int pageSize) {
        List<AccountingDebtRowResponse> rows = new ArrayList<>();
        if (partyType == null || partyType.equals("CUSTOMER")) {
            receivableRepository.findAll().forEach(item -> rows.add(new AccountingDebtRowResponse(
                    item.getId(),
                    "CUSTOMER",
                    item.getCustomerName(),
                    "",
                    BigDecimal.ZERO,
                    item.getDebitAmount(),
                    item.getCreditAmount(),
                    receivableRepository.balanceByCustomerId(item.getCustomerId())
            )));
        }
        if (partyType == null || partyType.equals("SUPPLIER")) {
            payableRepository.findAll().forEach(item -> rows.add(new AccountingDebtRowResponse(
                    item.getId(),
                    "SUPPLIER",
                    item.getSupplierName(),
                    "",
                    BigDecimal.ZERO,
                    item.getDebitAmount(),
                    item.getCreditAmount(),
                    payableRepository.balanceBySupplierId(item.getSupplierId())
            )));
        }
        int start = Math.min(page * pageSize, rows.size());
        int end = Math.min(start + pageSize, rows.size());
        return PageResponse.from(new PageImpl<>(rows.subList(start, end), PageRequest.of(page, pageSize), rows.size()));
    }

    @Transactional(readOnly = true)
    public CashFlowReportResponse cashFlow(LocalDate fromDate, LocalDate toDate) {
        validateDateRange(fromDate, toDate);
        BigDecimal cashIn = cashBookRepository.sumCashIn(fromDate, toDate);
        BigDecimal cashOut = cashBookRepository.sumCashOut(fromDate, toDate);
        return new CashFlowReportResponse(fromDate, toDate, cashIn, cashOut, cashIn.subtract(cashOut));
    }

    @Transactional(readOnly = true)
    public DebtReportResponse customerDebt(Long customerId) {
        requireCustomerBranch(customerId);
        BigDecimal balance = receivableRepository.balanceByCustomerId(customerId);
        return new DebtReportResponse(
                customerId,
                "CUSTOMER",
                balance,
                receivableRepository.findByCustomerIdOrderByTransactionDateDescIdDesc(customerId).stream()
                        .map(item -> new DebtLineResponse(
                                item.getId(),
                                item.getTransactionDate(),
                                item.getType().name(),
                                item.getDebitAmount(),
                                item.getCreditAmount(),
                                item.getSourceNo(),
                                item.getDescription()
                        ))
                        .toList()
        );
    }

    @Transactional(readOnly = true)
    public DebtReportResponse supplierDebt(Long supplierId) {
        BigDecimal balance = payableRepository.balanceBySupplierId(supplierId);
        return new DebtReportResponse(
                supplierId,
                "SUPPLIER",
                balance,
                payableRepository.findBySupplierIdOrderByTransactionDateDescIdDesc(supplierId).stream()
                        .map(item -> new DebtLineResponse(
                                item.getId(),
                                item.getTransactionDate(),
                                item.getType().name(),
                                item.getDebitAmount(),
                                item.getCreditAmount(),
                                item.getSourceNo(),
                                item.getDescription()
                        ))
                        .toList()
        );
    }

    @Transactional(readOnly = true)
    public ProfitLossReportResponse profitLoss(LocalDate fromDate, LocalDate toDate) {
        validateDateRange(fromDate, toDate);
        BigDecimal revenue = transactionRepository.sumAmountByTypeAndDateRange(
                AccountingTransactionType.SALES_REVENUE,
                fromDate,
                toDate
        );
        BigDecimal costOfGoodsSold = transactionRepository.sumCostAmountByTypeAndDateRange(
                AccountingTransactionType.COST_OF_GOODS_SOLD,
                fromDate,
                toDate
        );
        BigDecimal expenses = BigDecimal.ZERO;
        BigDecimal grossProfit = revenue.subtract(costOfGoodsSold);
        return new ProfitLossReportResponse(
                fromDate,
                toDate,
                revenue,
                costOfGoodsSold,
                grossProfit,
                expenses,
                grossProfit.subtract(expenses)
        );
    }

    @Transactional(readOnly = true)
    public List<DebtAgingRowResponse> customerDebtAging(LocalDate asOfDate) {
        Map<Long, AgingAccumulator> rows = new LinkedHashMap<>();
        for (Receivable item : receivableRepository.findAll()) {
            BigDecimal balanceImpact = item.getDebitAmount().subtract(item.getCreditAmount());
            if (balanceImpact.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            AgingAccumulator row = rows.computeIfAbsent(item.getCustomerId(), id -> new AgingAccumulator("CUSTOMER", item.getCustomerId(), item.getCustomerName()));
            row.add(balanceImpact, ageDays(item.getDueDate() == null ? item.getTransactionDate() : item.getDueDate(), asOfDate));
        }
        return rows.values().stream().map(AgingAccumulator::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<DebtAgingRowResponse> supplierDebtAging(LocalDate asOfDate) {
        Map<Long, AgingAccumulator> rows = new LinkedHashMap<>();
        for (Payable item : payableRepository.findAll()) {
            BigDecimal balanceImpact = item.getCreditAmount().subtract(item.getDebitAmount());
            if (balanceImpact.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            AgingAccumulator row = rows.computeIfAbsent(item.getSupplierId(), id -> new AgingAccumulator("SUPPLIER", item.getSupplierId(), item.getSupplierName()));
            row.add(balanceImpact, ageDays(item.getDueDate() == null ? item.getTransactionDate() : item.getDueDate(), asOfDate));
        }
        return rows.values().stream().map(AgingAccumulator::toResponse).toList();
    }

    private void receiveMoney(
            PaymentMethod paymentMethod,
            Long bankAccountId,
            LocalDate date,
            BigDecimal amount,
            AccountingSourceType sourceType,
            String sourceNo,
            String description
    ) {
        CashBook cashBook = new CashBook();
        cashBook.setTransactionDate(date);
        cashBook.setAmountIn(amount);
        cashBook.setAmountOut(BigDecimal.ZERO);
        cashBook.setSourceType(sourceType);
        cashBook.setSourceNo(sourceNo);
        cashBook.setDescription(description);

        if (isBankMoney(paymentMethod, bankAccountId)) {
            BankAccount bankAccount = getBankAccount(bankAccountId);
            bankAccount.setCurrentBalance(bankAccount.getCurrentBalance().add(amount));
            cashBook.setType(CashBookType.BANK_IN);
            cashBook.setBankAccount(bankAccount);
            cashBook.setBalanceAfter(bankAccount.getCurrentBalance());
        } else {
            BigDecimal cashBalance = currentCashBalance().add(amount);
            cashBook.setType(CashBookType.CASH_IN);
            cashBook.setBalanceAfter(cashBalance);
        }
        cashBookRepository.save(cashBook);
    }

    private void payMoney(
            PaymentMethod paymentMethod,
            Long bankAccountId,
            LocalDate date,
            BigDecimal amount,
            AccountingSourceType sourceType,
            String sourceNo,
            String description
    ) {
        CashBook cashBook = new CashBook();
        cashBook.setTransactionDate(date);
        cashBook.setAmountIn(BigDecimal.ZERO);
        cashBook.setAmountOut(amount);
        cashBook.setSourceType(sourceType);
        cashBook.setSourceNo(sourceNo);
        cashBook.setDescription(description);

        if (isBankMoney(paymentMethod, bankAccountId)) {
            BankAccount bankAccount = getBankAccount(bankAccountId);
            if (bankAccount.getCurrentBalance().compareTo(amount) < 0) {
                throw new BusinessException("Bank balance is not enough");
            }
            bankAccount.setCurrentBalance(bankAccount.getCurrentBalance().subtract(amount));
            cashBook.setType(CashBookType.BANK_OUT);
            cashBook.setBankAccount(bankAccount);
            cashBook.setBalanceAfter(bankAccount.getCurrentBalance());
        } else {
            BigDecimal cashBalance = currentCashBalance();
            if (cashBalance.compareTo(amount) < 0) {
                throw new BusinessException("Cash balance is not enough");
            }
            cashBalance = cashBalance.subtract(amount);
            cashBook.setType(CashBookType.CASH_OUT);
            cashBook.setBalanceAfter(cashBalance);
        }
        cashBookRepository.save(cashBook);
    }

    private BigDecimal currentCashBalance() {
        BigDecimal balance = cashBookRepository.cashBalance(CashBookType.CASH_IN, CashBookType.CASH_OUT);
        return balance == null ? BigDecimal.ZERO : balance;
    }

    private boolean isBankMoney(PaymentMethod paymentMethod, Long bankAccountId) {
        return (paymentMethod == PaymentMethod.BANK_TRANSFER || paymentMethod == PaymentMethod.INSTALLMENT) && bankAccountId != null;
    }

    private BankAccount getBankAccount(Long bankAccountId) {
        if (bankAccountId == null) {
            throw new BusinessException("bankAccountId is required for bank transfer");
        }
        return bankAccountRepository.findById(bankAccountId)
                .orElseThrow(() -> new NotFoundException("Bank account not found: " + bankAccountId));
    }

    private void saveTransaction(
            AccountingTransactionType type,
            AccountingSourceType sourceType,
            String sourceNo,
            LocalDate date,
            BigDecimal amount,
            BigDecimal costAmount,
            String description
    ) {
        AccountingTransaction transaction = new AccountingTransaction();
        transaction.setType(type);
        transaction.setSourceType(sourceType);
        transaction.setSourceNo(sourceNo);
        transaction.setTransactionDate(date);
        transaction.setAmount(amount);
        transaction.setCostAmount(costAmount);
        transaction.setDescription(description);
        transactionRepository.save(transaction);
    }

    private void saveReceivable(
            Long customerId,
            String customerName,
            ReceivableType type,
            LocalDate date,
            BigDecimal debitAmount,
            BigDecimal creditAmount,
            AccountingSourceType sourceType,
            String sourceNo,
            String description
    ) {
        Receivable receivable = new Receivable();
        receivable.setCustomerId(customerId);
        receivable.setCustomerName(customerName);
        receivable.setType(type);
        receivable.setTransactionDate(date);
        receivable.setDebitAmount(debitAmount);
        receivable.setCreditAmount(creditAmount);
        receivable.setSourceType(sourceType);
        receivable.setSourceNo(sourceNo);
        receivable.setInvoiceNo(sourceNo);
        receivable.setDueDate(date.plusDays(30));
        receivable.setStatus(debitAmount.compareTo(BigDecimal.ZERO) > 0 ? DebtStatus.UNPAID : DebtStatus.PAID);
        receivable.setDescription(description);
        receivableRepository.save(receivable);
    }

    private void savePayable(
            Long supplierId,
            String supplierName,
            PayableType type,
            LocalDate date,
            BigDecimal debitAmount,
            BigDecimal creditAmount,
            AccountingSourceType sourceType,
            String sourceNo,
            String description
    ) {
        Payable payable = new Payable();
        payable.setSupplierId(supplierId);
        payable.setSupplierName(supplierName);
        payable.setType(type);
        payable.setTransactionDate(date);
        payable.setDebitAmount(debitAmount);
        payable.setCreditAmount(creditAmount);
        payable.setSourceType(sourceType);
        payable.setSourceNo(sourceNo);
        payable.setInvoiceNo(sourceNo);
        payable.setDueDate(date.plusDays(30));
        payable.setStatus(creditAmount.compareTo(BigDecimal.ZERO) > 0 ? DebtStatus.UNPAID : DebtStatus.PAID);
        payable.setDescription(description);
        payableRepository.save(payable);
    }

    private void ensureSalesOrderNotRecorded(String salesOrderNo) {
        if (transactionRepository.existsBySourceNoAndType(salesOrderNo, AccountingTransactionType.SALES_REVENUE)) {
            throw new BusinessException("Sales order already recorded: " + salesOrderNo);
        }
    }

    private void validatePaidNotGreaterThanTotal(BigDecimal paidAmount, BigDecimal totalAmount) {
        if (paidAmount.compareTo(totalAmount) > 0) {
            throw new BusinessException("paidAmount cannot be greater than totalAmount");
        }
    }

    private void validateDateRange(LocalDate fromDate, LocalDate toDate) {
        if (toDate.isBefore(fromDate)) {
            throw new BusinessException("toDate must be on or after fromDate");
        }
    }

    private void requireCustomerBranch(Long customerId) {
        customerRepository.findById(customerId).ifPresent(customer -> branchSecurity.requireBranchAccess(customer.getBranchId()));
    }

    private void assertPeriodNotLocked(LocalDate date, Long customerId) {
        Long branchId = null;
        if (customerId != null) {
            branchId = customerRepository.findById(customerId)
                    .map(com.chuanphat.warranty.core.entity.Customer::getBranchId)
                    .orElse(null);
        }
        if (branchId == null) {
            try {
                branchId = branchSecurity.scopedBranchId(null);
            } catch (Exception e) {
                // Background task or system context
            }
        }
        accountingPeriodService.assertPeriodNotLocked(date, branchId);
    }

    private long ageDays(LocalDate dueDate, LocalDate asOfDate) {
        return Math.max(0, java.time.temporal.ChronoUnit.DAYS.between(dueDate, asOfDate));
    }

    private byte[] voucherPdf(String title, CashBook cashBook, BigDecimal amount) {
        return exportDocumentService.businessPdf(new ExportDocumentService.BusinessDocument(
                title,
                cashBook.getSourceNo(),
                cashBook.getTransactionDate().toString(),
                "",
                cashBook.getBankAccount() == null ? "Tien mat" : cashBook.getBankAccount().getBankName(),
                cashBook.getDescription(),
                List.of("Noi dung", "Phuong thuc", "So tien"),
                List.of(List.of(
                        cashBook.getDescription() == null ? title : cashBook.getDescription(),
                        cashBook.getBankAccount() == null ? "Tien mat" : "Chuyen khoan",
                        amount.toPlainString()
                )),
                amount
        ));
    }

    /**
     * Đảo doanh thu + giá vốn khi trả hàng bán.
     * Gọi từ SalesService.createReturn() — có kiểm tra idempotency qua returnNo+"-REV".
     */
    @Transactional
    public void recordSalesReturnReversal(
            String returnNo,
            LocalDate returnDate,
            Long customerId,
            String customerName,
            BigDecimal returnAmount,
            BigDecimal costAmount,
            String description
    ) {
        assertPeriodNotLocked(returnDate, customerId);
        if (returnAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("returnAmount must be greater than zero");
        }
        // Idempotency: kiểm tra đã ghi chưa
        if (transactionRepository.existsBySourceNoAndType(returnNo + "-REV", AccountingTransactionType.REFUND)) {
            return;
        }
        saveTransaction(
                AccountingTransactionType.REFUND,
                AccountingSourceType.SALES_RETURN,
                returnNo + "-REV",
                returnDate,
                returnAmount,
                costAmount,
                description
        );
        saveReceivable(
                customerId,
                customerName,
                ReceivableType.RETURN,
                returnDate,
                BigDecimal.ZERO,
                returnAmount,
                AccountingSourceType.SALES_RETURN,
                returnNo + "-REV",
                description
        );
        ledgerService.postSalesReturnReversal(returnNo, returnDate, returnAmount, costAmount, description);
    }

    /**
     * Ghi chi phí bảo hành (xe trong thời hạn bảo hành).
     */
    @Transactional
    public void recordWarrantyCost(String ticketNo, LocalDate date, BigDecimal amount, String description) {
        assertPeriodNotLocked(date, null);
        if (transactionRepository.existsBySourceNoAndType(ticketNo + "-WC", AccountingTransactionType.PAYABLE)) {
            return;
        }
        saveTransaction(
                AccountingTransactionType.PAYABLE,
                AccountingSourceType.SERVICE_TICKET,
                ticketNo + "-WC",
                date,
                amount,
                null,
                description
        );
        ledgerService.postWarrantyCost(ticketNo, date, amount, description);
    }

    /**
     * Ghi doanh thu dịch vụ sửa chữa có phí.
     */
    @Transactional
    public void recordServiceRevenue(
            String ticketNo,
            LocalDate date,
            Long customerId,
            String customerName,
            BigDecimal amount,
            String description
    ) {
        assertPeriodNotLocked(date, customerId);
        if (transactionRepository.existsBySourceNoAndType(ticketNo, AccountingTransactionType.SALES_REVENUE)) {
            return;
        }
        saveTransaction(
                AccountingTransactionType.SALES_REVENUE,
                AccountingSourceType.SERVICE_TICKET,
                ticketNo,
                date,
                amount,
                null,
                description
        );
        saveReceivable(
                customerId,
                customerName,
                ReceivableType.SALE,
                date,
                amount,
                BigDecimal.ZERO,
                AccountingSourceType.SERVICE_TICKET,
                ticketNo,
                description
        );
        ledgerService.postServiceRevenue(ticketNo, date, amount, description);
    }

    @Transactional
    public void recordSalaryExpense(String payrollCode, LocalDate date, BigDecimal amount, String description) {
        assertPeriodNotLocked(date, null);
        if (transactionRepository.existsBySourceNoAndType(payrollCode, AccountingTransactionType.PAYABLE)) {
            return;
        }
        saveTransaction(
                AccountingTransactionType.PAYABLE,
                AccountingSourceType.MANUAL,
                payrollCode,
                date,
                amount,
                null,
                description
        );
    }

    /**
     * Ghi nhận tiền đặt cọc từ khách.
     * Nợ TK tiền mặt/ngân hàng / Có TK người mua trả tiền trước.
     */
    @Transactional
    public void recordDepositReceived(
            String depositCode,
            LocalDate date,
            Long customerId,
            String customerName,
            BigDecimal amount,
            PaymentMethod paymentMethod,
            Long bankAccountId,
            String description
    ) {
        assertPeriodNotLocked(date, customerId);
        if (transactionRepository.existsBySourceNoAndType(depositCode, AccountingTransactionType.RECEIPT)) {
            return;
        }
        receiveMoney(paymentMethod, bankAccountId, date, amount, AccountingSourceType.DEPOSIT, depositCode, description);
        saveTransaction(
                AccountingTransactionType.RECEIPT,
                AccountingSourceType.DEPOSIT,
                depositCode,
                date,
                amount,
                null,
                description
        );
        saveReceivable(
                customerId,
                customerName,
                ReceivableType.RECEIPT,
                date,
                BigDecimal.ZERO,
                amount,
                AccountingSourceType.DEPOSIT,
                depositCode,
                description
        );
        ledgerService.postDepositReceived(depositCode, date, amount, paymentMethod, description);
    }

    /**
     * Bù trừ cọc khi convert deposit → sales order.
     * Gọi từ DepositService.convertToOrder().
     */
    @Transactional
    public void recordDepositConverted(
            String depositCode,
            LocalDate date,
            Long customerId,
            String customerName,
            BigDecimal amount,
            String orderNo,
            String description
    ) {
        assertPeriodNotLocked(date, customerId);
        // Ghi bù trừ: giảm TK tạm ứng, tăng công nợ đơn hàng
        saveReceivable(
                customerId,
                customerName,
                ReceivableType.RECEIPT,
                date,
                amount,
                BigDecimal.ZERO,
                AccountingSourceType.DEPOSIT,
                depositCode + "-CONV",
                "Convert deposit " + depositCode + " to order " + orderNo
        );
    }

    private static class AgingAccumulator {
        private final String partyType;
        private final Long partyId;
        private final String partyName;
        private BigDecimal bucket0To30 = BigDecimal.ZERO;
        private BigDecimal bucket31To60 = BigDecimal.ZERO;
        private BigDecimal bucket61To90 = BigDecimal.ZERO;
        private BigDecimal bucketOver90 = BigDecimal.ZERO;

        private AgingAccumulator(String partyType, Long partyId, String partyName) {
            this.partyType = partyType;
            this.partyId = partyId;
            this.partyName = partyName;
        }

        private void add(BigDecimal amount, long ageDays) {
            if (ageDays <= 30) {
                bucket0To30 = bucket0To30.add(amount);
            } else if (ageDays <= 60) {
                bucket31To60 = bucket31To60.add(amount);
            } else if (ageDays <= 90) {
                bucket61To90 = bucket61To90.add(amount);
            } else {
                bucketOver90 = bucketOver90.add(amount);
            }
        }

        private DebtAgingRowResponse toResponse() {
            BigDecimal total = bucket0To30.add(bucket31To60).add(bucket61To90).add(bucketOver90);
            return new DebtAgingRowResponse(partyType, partyId, partyName, bucket0To30, bucket31To60, bucket61To90, bucketOver90, total);
        }
    }
}

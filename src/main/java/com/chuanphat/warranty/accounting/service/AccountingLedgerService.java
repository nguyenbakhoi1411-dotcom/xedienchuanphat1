package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.dto.ChartOfAccountRequest;
import com.chuanphat.warranty.accounting.dto.ChartOfAccountResponse;
import com.chuanphat.warranty.accounting.dto.FinancialStatementResponse;
import com.chuanphat.warranty.accounting.dto.GeneralLedgerLineResponse;
import com.chuanphat.warranty.accounting.dto.GeneralLedgerResponse;
import com.chuanphat.warranty.accounting.dto.JournalEntryLineRequest;
import com.chuanphat.warranty.accounting.dto.JournalEntryRequest;
import com.chuanphat.warranty.accounting.dto.JournalEntryResponse;
import com.chuanphat.warranty.accounting.dto.TrialBalanceResponse;
import com.chuanphat.warranty.accounting.dto.TrialBalanceRowResponse;
import com.chuanphat.warranty.accounting.dto.LedgerReportRow;
import com.chuanphat.warranty.accounting.entity.ChartOfAccount;
import com.chuanphat.warranty.accounting.entity.JournalEntry;
import com.chuanphat.warranty.accounting.entity.JournalEntryLine;
import com.chuanphat.warranty.accounting.enums.AccountType;
import com.chuanphat.warranty.accounting.enums.JournalEntryStatus;
import com.chuanphat.warranty.accounting.enums.JournalReferenceType;
import com.chuanphat.warranty.accounting.enums.PaymentMethod;
import com.chuanphat.warranty.accounting.repository.ChartOfAccountRepository;
import com.chuanphat.warranty.accounting.repository.JournalEntryLineRepository;
import com.chuanphat.warranty.accounting.repository.JournalEntryRepository;
import com.chuanphat.warranty.common.dto.PageRequestFactory;
import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountingLedgerService {
    private static final String CASH = "111";
    private static final String BANK = "112";
    private static final String RECEIVABLE = "131";
    private static final String VAT_INPUT = "1331";
    private static final String VAT_OUTPUT = "3331";
    private static final String INVENTORY = "156";
    private static final String PAYABLE = "331";
    private static final String REVENUE = "511";
    private static final String COGS = "632";

    private final ChartOfAccountRepository accountRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final JournalEntryLineRepository lineRepository;
    private final AccountingPeriodService accountingPeriodService;
    private final BranchSecurity branchSecurity;

    public AccountingLedgerService(
            ChartOfAccountRepository accountRepository,
            JournalEntryRepository journalEntryRepository,
            JournalEntryLineRepository lineRepository,
            AccountingPeriodService accountingPeriodService,
            BranchSecurity branchSecurity
    ) {
        this.accountRepository = accountRepository;
        this.journalEntryRepository = journalEntryRepository;
        this.lineRepository = lineRepository;
        this.accountingPeriodService = accountingPeriodService;
        this.branchSecurity = branchSecurity;
    }

    @Transactional(readOnly = true)
    public PageResponse<ChartOfAccountResponse> accounts(Boolean active, int page, int pageSize) {
        PageRequest pageRequest = PageRequest.of(page, pageSize);
        org.springframework.data.domain.Page<ChartOfAccount> accountsPage = active == null 
                ? accountRepository.findAll(pageRequest) 
                : accountRepository.findByActive(active, pageRequest);
        java.util.Set<Long> parentIds = accountRepository.findAllParentAccountIds();
        return PageResponse.from(accountsPage.map(account -> ChartOfAccountResponse.from(account, parentIds)));
    }

    @Transactional
    public ChartOfAccountResponse createAccount(ChartOfAccountRequest request) {
        if (accountRepository.existsByAccountCode(request.accountCode())) {
            throw new BusinessException("Account code already exists: " + request.accountCode());
        }
        ChartOfAccount account = new ChartOfAccount();
        apply(account, request);
        return ChartOfAccountResponse.from(accountRepository.save(account));
    }

    @Transactional
    public ChartOfAccountResponse updateAccount(Long id, ChartOfAccountRequest request) {
        ChartOfAccount account = accountRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Account not found: " + id));
        if (!account.getAccountCode().equals(request.accountCode()) && accountRepository.existsByAccountCode(request.accountCode())) {
            throw new BusinessException("Account code already exists: " + request.accountCode());
        }
        apply(account, request);
        return ChartOfAccountResponse.from(accountRepository.save(account));
    }

    @Transactional(readOnly = true)
    public PageResponse<JournalEntryResponse> journalEntries(JournalEntryStatus status, LocalDate fromDate, LocalDate toDate, Long branchId, String keyword, int page, int pageSize, String sort) {
        PageRequest pageRequest = PageRequestFactory.of(page, pageSize, sort, Map.of(
                "entryDate", "entryDate",
                "createdAt", "createdAt",
                "status", "status",
                "entryCode", "entryCode",
                "totalDebit", "totalDebit"
        ), "entryDate,desc");
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        String q = keyword == null || keyword.isBlank() ? null : keyword.trim();
        return PageResponse.from(journalEntryRepository.search(scopedBranchId, status, fromDate, toDate, q, pageRequest).map(entry -> {
            Long periodId = accountingPeriodService.findPeriodIdByDate(entry.getEntryDate(), entry.getBranchId());
            return JournalEntryResponse.summary(entry, periodId);
        }));
    }

    private void assertPeriodNotLocked(LocalDate date) {
        Long branchId = null;
        try {
            branchId = branchSecurity.scopedBranchId(null);
        } catch (Exception e) {
            // Unauthenticated or system job
        }
        accountingPeriodService.assertPeriodNotLocked(date, branchId);
    }

    @Transactional
    public JournalEntryResponse createJournalEntry(JournalEntryRequest request) {
        assertPeriodNotLocked(request.entryDate());
        JournalEntry entry = buildJournalEntry(request, currentUsername());
        
        // Generate entry code if not provided
        if (entry.getEntryCode() == null || entry.getEntryCode().isBlank()) {
            String prefix = "PK" + request.entryDate().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
            List<String> lastCodes = journalEntryRepository.findEntryCodesByPrefix(prefix, PageRequest.of(0, 1));
            int nextNum = 1;
            if (!lastCodes.isEmpty()) {
                String lastNo = lastCodes.get(0);
                try {
                    String suffix = lastNo.substring(lastNo.length() - 4);
                    nextNum = Integer.parseInt(suffix) + 1;
                } catch (Exception e) {
                    // ignore
                }
            }
            entry.setEntryCode(prefix + String.format("%04d", nextNum));
        }

        // Set branchId from security context
        if (entry.getBranchId() == null) {
            try {
                entry.setBranchId(branchSecurity.scopedBranchId(null));
            } catch (Exception e) {
                // system context
            }
        }
        for (JournalEntryLine line : entry.getLines()) {
            if (line.getBranchId() == null) {
                line.setBranchId(entry.getBranchId());
            }
        }

        JournalEntry saved = journalEntryRepository.save(entry);
        Long periodId = accountingPeriodService.findPeriodIdByDate(saved.getEntryDate(), saved.getBranchId());
        return JournalEntryResponse.from(saved, periodId);
    }

    @Transactional
    public JournalEntryResponse updateJournalEntry(Long id, JournalEntryRequest request) {
        JournalEntry entry = journalEntryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Journal entry not found: " + id));
        if (entry.getStatus() != JournalEntryStatus.DRAFT) {
            throw new BusinessException("Only DRAFT journal entries can be updated");
        }
        assertPeriodNotLocked(entry.getEntryDate());
        assertPeriodNotLocked(request.entryDate());

        entry.setEntryDate(request.entryDate());
        entry.setReferenceType(request.referenceType());
        entry.setReferenceId(request.referenceId());
        entry.setDescription(request.description());

        entry.getLines().clear();
        for (JournalEntryLineRequest lineRequest : request.lines()) {
            JournalEntryLine line = new JournalEntryLine();
            line.setAccount(accountByCode(lineRequest.accountCode()));
            line.setDebitAmount(nullToZero(lineRequest.debitAmount()));
            line.setCreditAmount(nullToZero(lineRequest.creditAmount()));
            line.setDescription(lineRequest.description());
            line.setCustomerId(lineRequest.customerId());
            line.setSupplierId(lineRequest.supplierId());
            line.setCostCenterId(lineRequest.costCenterId());
            entry.addLine(line);
        }

        recalculateAndValidate(entry);
        
        // Set branchId from security context
        if (entry.getBranchId() == null) {
            try {
                entry.setBranchId(branchSecurity.scopedBranchId(null));
            } catch (Exception e) {
                // system context
            }
        }
        for (JournalEntryLine line : entry.getLines()) {
            if (line.getBranchId() == null) {
                line.setBranchId(entry.getBranchId());
            }
        }

        JournalEntry saved = journalEntryRepository.save(entry);
        Long periodId = accountingPeriodService.findPeriodIdByDate(saved.getEntryDate(), saved.getBranchId());
        return JournalEntryResponse.from(saved, periodId);
    }

    @Transactional
    public JournalEntryResponse reverseJournalEntry(Long id) {
        return reverseJournalEntry(id, currentUsername());
    }

    @Transactional
    public JournalEntryResponse reverseJournalEntry(Long id, String operator) {
        JournalEntry original = journalEntryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Journal entry not found: " + id));
        if (original.getStatus() != JournalEntryStatus.POSTED) {
            throw new BusinessException("Only posted journal entries can be reversed");
        }
        assertPeriodNotLocked(LocalDate.now());

        List<JournalEntryLineRequest> reversedLines = new ArrayList<>();
        for (JournalEntryLine line : original.getLines()) {
            reversedLines.add(new JournalEntryLineRequest(
                    line.getAccount().getAccountCode(),
                    line.getCreditAmount(),
                    line.getDebitAmount(),
                    "Đảo ngược bút toán " + original.getEntryCode() + ": " + line.getDescription(),
                    line.getCustomerId(),
                    line.getSupplierId(),
                    line.getCostCenterId()
            ));
        }

        JournalEntryRequest revRequest = new JournalEntryRequest(
                LocalDate.now(),
                original.getReferenceType(),
                original.getEntryCode() + "-REV",
                "Đảo ngược bút toán " + original.getEntryCode() + ": " + original.getDescription(),
                reversedLines
        );

        JournalEntryResponse response = createJournalEntry(revRequest);
        return postJournalEntry(response.id());
    }

    @Transactional
    public JournalEntryResponse postJournalEntry(Long id) {
        JournalEntry entry = journalEntryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Journal entry not found: " + id));
        assertPeriodNotLocked(entry.getEntryDate());
        post(entry, currentUsername());
        JournalEntry saved = journalEntryRepository.save(entry);
        Long periodId = accountingPeriodService.findPeriodIdByDate(saved.getEntryDate(), saved.getBranchId());
        return JournalEntryResponse.from(saved, periodId);
    }

    @Transactional
    public JournalEntryResponse cancelJournalEntry(Long id) {
        JournalEntry entry = journalEntryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Journal entry not found: " + id));
        assertPeriodNotLocked(entry.getEntryDate());
        if (entry.getStatus() == JournalEntryStatus.POSTED) {
            throw new BusinessException("Posted journal entries cannot be edited; create an adjustment entry");
        }
        entry.setStatus(JournalEntryStatus.CANCELLED);
        JournalEntry saved = journalEntryRepository.save(entry);
        Long periodId = accountingPeriodService.findPeriodIdByDate(saved.getEntryDate(), saved.getBranchId());
        return JournalEntryResponse.from(saved, periodId);
    }

    @Transactional
    public void postSalesOrder(String salesOrderNo, LocalDate saleDate, BigDecimal totalAmount, BigDecimal paidAmount, BigDecimal costAmount, PaymentMethod paymentMethod, Long bankAccountId, String description) {
        postIfAbsent(JournalReferenceType.SALES_ORDER, salesOrderNo, new JournalEntryRequest(
                saleDate,
                JournalReferenceType.SALES_ORDER,
                salesOrderNo,
                description,
                salesLines(totalAmount, paidAmount, costAmount, paymentMethod)
        ));
    }

    @Transactional
    public void postPurchaseOrder(String purchaseOrderNo, LocalDate purchaseDate, BigDecimal inventoryAmount, BigDecimal paidAmount, PaymentMethod paymentMethod, String description) {
        List<JournalEntryLineRequest> lines = new ArrayList<>();
        addDebit(lines, INVENTORY, inventoryAmount, "Inventory received");
        BigDecimal payableAmount = inventoryAmount.subtract(paidAmount);
        if (paidAmount.compareTo(BigDecimal.ZERO) > 0) {
            addCredit(lines, paymentMethod == PaymentMethod.BANK_TRANSFER ? BANK : CASH, paidAmount, "Purchase paid");
        }
        if (payableAmount.compareTo(BigDecimal.ZERO) > 0) {
            addCredit(lines, PAYABLE, payableAmount, "Supplier payable");
        }
        postIfAbsent(JournalReferenceType.PURCHASE_ORDER, purchaseOrderNo, new JournalEntryRequest(
                purchaseDate,
                JournalReferenceType.PURCHASE_ORDER,
                purchaseOrderNo,
                description,
                lines
        ));
    }

    @Transactional
    public void postInventoryAdjustment(String transactionNo, LocalDate date, BigDecimal amount, boolean isIncrease, String reason, String specificAccount) {
        List<JournalEntryLineRequest> lines = new ArrayList<>();
        String counterAccount = specificAccount == null || specificAccount.isBlank() ? "6318" : specificAccount;
        if (isIncrease) {
            addDebit(lines, INVENTORY, amount, reason);
            addCredit(lines, counterAccount, amount, reason);
        } else {
            addDebit(lines, counterAccount, amount, reason);
            addCredit(lines, INVENTORY, amount, reason);
        }
        postIfAbsent(JournalReferenceType.ADJUSTMENT, transactionNo, new JournalEntryRequest(
                date,
                JournalReferenceType.ADJUSTMENT,
                transactionNo,
                reason,
                lines
        ));
    }

    @Transactional
    public void postReceipt(String voucherNo, LocalDate receiptDate, BigDecimal amount, PaymentMethod paymentMethod, String description) {
        postIfAbsent(JournalReferenceType.RECEIPT_VOUCHER, voucherNo, new JournalEntryRequest(
                receiptDate,
                JournalReferenceType.RECEIPT_VOUCHER,
                voucherNo,
                description,
                List.of(
                        new JournalEntryLineRequest(isBankPayment(paymentMethod) ? BANK : CASH, amount, BigDecimal.ZERO, "Money received"),
                        new JournalEntryLineRequest(RECEIVABLE, BigDecimal.ZERO, amount, "Reduce customer receivable")
                )
        ));
    }

    @Transactional
    public void postSalesReturn(String returnNo, LocalDate returnDate, BigDecimal refundAmount, PaymentMethod refundMethod, String description) {
        postIfAbsent(JournalReferenceType.SALES_RETURN, returnNo, new JournalEntryRequest(
                returnDate,
                JournalReferenceType.SALES_RETURN,
                returnNo,
                description,
                List.of(
                        new JournalEntryLineRequest(REVENUE, refundAmount, BigDecimal.ZERO, "Reverse sales revenue"),
                        new JournalEntryLineRequest(isBankPayment(refundMethod) ? BANK : CASH, BigDecimal.ZERO, refundAmount, "Refund customer")
                )
        ));
    }

    /**
     * Đảo bút toán doanh thu + giá vốn khi trả hàng bán.
     * Gọi từ SalesService.createReturn() sau khi tạo SalesReturn.
     */
    @Transactional
    public void postSalesReturnReversal(String returnNo, LocalDate returnDate,
                                        BigDecimal returnAmount, BigDecimal costAmount, String description) {
        List<JournalEntryLineRequest> lines = new ArrayList<>();
        // Đảo doanh thu: Nợ 511 / Có 131 (giảm phải thu)
        addDebit(lines, REVENUE, returnAmount, "Reverse sales revenue - " + returnNo);
        addCredit(lines, RECEIVABLE, returnAmount, "Reduce customer receivable");
        // Đảo giá vốn: Nợ 156 / Có 632 (nhập lại hàng vào kho)
        if (costAmount != null && costAmount.compareTo(BigDecimal.ZERO) > 0) {
            addDebit(lines, INVENTORY, costAmount, "Inventory returned");
            addCredit(lines, COGS, costAmount, "Reverse cost of goods sold");
        }
        postIfAbsent(JournalReferenceType.SALES_RETURN, returnNo + "-REV", new JournalEntryRequest(
                returnDate,
                JournalReferenceType.SALES_RETURN,
                returnNo + "-REV",
                description,
                lines
        ));
    }

    /**
     * Ghi chi phí bảo hành (xe trong thời hạn bảo hành).
     * Nợ TK chi phí bảo hành (642) / Có TK phải trả nội bộ (336).
     */
    @Transactional
    public void postWarrantyCost(String ticketNo, LocalDate date, BigDecimal amount, String description) {
        postIfAbsent(JournalReferenceType.SERVICE_TICKET, ticketNo + "-WC", new JournalEntryRequest(
                date,
                JournalReferenceType.SERVICE_TICKET,
                ticketNo + "-WC",
                description,
                List.of(
                        new JournalEntryLineRequest("642", amount, BigDecimal.ZERO, "Warranty service cost"),
                        new JournalEntryLineRequest("336", BigDecimal.ZERO, amount, "Internal warranty payable")
                )
        ));
    }

    /**
     * Ghi doanh thu dịch vụ sửa chữa có phí.
     * Nợ TK phải thu (131) / Có TK doanh thu dịch vụ (511).
     */
    @Transactional
    public void postServiceRevenue(String ticketNo, LocalDate date, BigDecimal amount, String description) {
        postIfAbsent(JournalReferenceType.SERVICE_TICKET, ticketNo, new JournalEntryRequest(
                date,
                JournalReferenceType.SERVICE_TICKET,
                ticketNo,
                description,
                List.of(
                        new JournalEntryLineRequest(RECEIVABLE, amount, BigDecimal.ZERO, "Service fee receivable"),
                        new JournalEntryLineRequest(REVENUE, BigDecimal.ZERO, amount, "Service revenue")
                )
        ));
    }

    /**
     * Ghi nhận tiền đặt cọc.
     * Nợ TK tiền mặt/ngân hàng (111/112) / Có TK người mua trả tiền trước (131).
     */
    @Transactional
    public void postDepositReceived(String depositCode, LocalDate date, BigDecimal amount,
                                    PaymentMethod paymentMethod, String description) {
        postIfAbsent(JournalReferenceType.DEPOSIT, depositCode, new JournalEntryRequest(
                date,
                JournalReferenceType.DEPOSIT,
                depositCode,
                description,
                List.of(
                        new JournalEntryLineRequest(isBankPayment(paymentMethod) ? BANK : CASH, amount, BigDecimal.ZERO, "Deposit received"),
                        new JournalEntryLineRequest(RECEIVABLE, BigDecimal.ZERO, amount, "Customer advance deposit")
                )
        ));
    }


    @Transactional
    public void postPayment(String voucherNo, LocalDate paymentDate, BigDecimal amount, PaymentMethod paymentMethod, String description) {
        postIfAbsent(JournalReferenceType.PAYMENT_VOUCHER, voucherNo, new JournalEntryRequest(
                paymentDate,
                JournalReferenceType.PAYMENT_VOUCHER,
                voucherNo,
                description,
                List.of(
                        new JournalEntryLineRequest(PAYABLE, amount, BigDecimal.ZERO, "Reduce supplier payable"),
                        new JournalEntryLineRequest(isBankPayment(paymentMethod) ? BANK : CASH, BigDecimal.ZERO, amount, "Money paid")
                )
        ));
    }

    @Transactional(readOnly = true)
    public FinancialStatementResponse trialBalance(LocalDate fromDate, LocalDate toDate) {
        return statement(fromDate, toDate, AccountType.ASSET, AccountType.LIABILITY, AccountType.EQUITY, AccountType.REVENUE, AccountType.EXPENSE, AccountType.COST_OF_GOODS_SOLD);
    }

    @Transactional(readOnly = true)
    public TrialBalanceResponse trialBalance(LocalDate fromDate, LocalDate toDate, Long branchId) {
        List<ChartOfAccount> accounts = accountRepository.findAll();
        java.util.Set<Long> parentIds = accountRepository.findAllParentAccountIds();
        
        List<Object[]> opList = lineRepository.aggregateOpeningBalances(branchId, fromDate);
        Map<String, BigDecimal[]> opMap = new java.util.HashMap<>();
        for (Object[] row : opList) {
            String code = (String) row[0];
            BigDecimal debitSum = (BigDecimal) row[1];
            BigDecimal creditSum = (BigDecimal) row[2];
            opMap.put(code, new BigDecimal[]{debitSum != null ? debitSum : BigDecimal.ZERO, creditSum != null ? creditSum : BigDecimal.ZERO});
        }
        
        List<Object[]> prList = lineRepository.aggregatePeriodTransactions(branchId, fromDate, toDate);
        Map<String, BigDecimal[]> prMap = new java.util.HashMap<>();
        for (Object[] row : prList) {
            String code = (String) row[0];
            BigDecimal debitSum = (BigDecimal) row[1];
            BigDecimal creditSum = (BigDecimal) row[2];
            prMap.put(code, new BigDecimal[]{debitSum != null ? debitSum : BigDecimal.ZERO, creditSum != null ? creditSum : BigDecimal.ZERO});
        }
        
        Map<String, MutableTBRow> rowMap = new LinkedHashMap<>();
        for (ChartOfAccount account : accounts) {
            MutableTBRow row = new MutableTBRow();
            row.accountCode = account.getAccountCode();
            row.accountName = account.getAccountName();
            row.parentCode = account.getParentAccount() == null ? null : account.getParentAccount().getAccountCode();
            row.level = calculateLevelForAccount(account);
            row.hasChildren = parentIds.contains(account.getId());
            
            BigDecimal[] op = opMap.getOrDefault(account.getAccountCode(), new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            BigDecimal[] pr = prMap.getOrDefault(account.getAccountCode(), new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            
            row.openingDebit = op[0];
            row.openingCredit = op[1];
            row.periodDebit = pr[0];
            row.periodCredit = pr[1];
            rowMap.put(account.getAccountCode(), row);
        }
        
        List<MutableTBRow> sortedRows = new ArrayList<>(rowMap.values());
        sortedRows.sort((r1, r2) -> Integer.compare(r2.level, r1.level));
        
        for (MutableTBRow child : sortedRows) {
            if (child.parentCode != null) {
                MutableTBRow parent = rowMap.get(child.parentCode);
                if (parent != null) {
                    parent.openingDebit = parent.openingDebit.add(child.openingDebit);
                    parent.openingCredit = parent.openingCredit.add(child.openingCredit);
                    parent.periodDebit = parent.periodDebit.add(child.periodDebit);
                    parent.periodCredit = parent.periodCredit.add(child.periodCredit);
                }
            }
        }
        
        List<TrialBalanceRowResponse> finalRows = new ArrayList<>();
        BigDecimal totalOpeningDebit = BigDecimal.ZERO;
        BigDecimal totalOpeningCredit = BigDecimal.ZERO;
        BigDecimal totalPeriodDebit = BigDecimal.ZERO;
        BigDecimal totalPeriodCredit = BigDecimal.ZERO;
        BigDecimal totalClosingDebit = BigDecimal.ZERO;
        BigDecimal totalClosingCredit = BigDecimal.ZERO;
        
        for (MutableTBRow row : rowMap.values()) {
            ChartOfAccount account = accountByCode(row.accountCode);
            boolean isDebitNormal = account.getAccountType() == AccountType.ASSET || 
                                    account.getAccountType() == AccountType.EXPENSE || 
                                    account.getAccountType() == AccountType.COST_OF_GOODS_SOLD;
            
            BigDecimal closingDebit;
            BigDecimal closingCredit;
            
            BigDecimal netOp = row.openingDebit.subtract(row.openingCredit);
            if (isDebitNormal) {
                if (netOp.compareTo(BigDecimal.ZERO) >= 0) {
                    row.openingDebit = netOp;
                    row.openingCredit = BigDecimal.ZERO;
                } else {
                    row.openingDebit = BigDecimal.ZERO;
                    row.openingCredit = netOp.negate();
                }
            } else {
                if (netOp.compareTo(BigDecimal.ZERO) <= 0) {
                    row.openingCredit = netOp.negate();
                    row.openingDebit = BigDecimal.ZERO;
                } else {
                    row.openingCredit = BigDecimal.ZERO;
                    row.openingDebit = netOp;
                }
            }

            if (isDebitNormal) {
                BigDecimal diff = row.openingDebit.subtract(row.openingCredit).add(row.periodDebit).subtract(row.periodCredit);
                if (diff.compareTo(BigDecimal.ZERO) >= 0) {
                    closingDebit = diff;
                    closingCredit = BigDecimal.ZERO;
                } else {
                    closingDebit = BigDecimal.ZERO;
                    closingCredit = diff.negate();
                }
            } else {
                BigDecimal diff = row.openingCredit.subtract(row.openingDebit).add(row.periodCredit).subtract(row.periodDebit);
                if (diff.compareTo(BigDecimal.ZERO) >= 0) {
                    closingDebit = BigDecimal.ZERO;
                    closingCredit = diff;
                } else {
                    closingDebit = diff.negate();
                    closingCredit = BigDecimal.ZERO;
                }
            }
            
            finalRows.add(new TrialBalanceRowResponse(
                    row.accountCode,
                    row.accountName,
                    row.level,
                    row.openingDebit,
                    row.openingCredit,
                    row.periodDebit,
                    row.periodCredit,
                    closingDebit,
                    closingCredit,
                    row.hasChildren
            ));
            
            if (row.level == 1) {
                totalOpeningDebit = totalOpeningDebit.add(row.openingDebit);
                totalOpeningCredit = totalOpeningCredit.add(row.openingCredit);
                totalPeriodDebit = totalPeriodDebit.add(row.periodDebit);
                totalPeriodCredit = totalPeriodCredit.add(row.periodCredit);
                totalClosingDebit = totalClosingDebit.add(closingDebit);
                totalClosingCredit = totalClosingCredit.add(closingCredit);
            }
        }
        
        return new TrialBalanceResponse(
                fromDate, toDate, finalRows,
                totalOpeningDebit, totalOpeningCredit,
                totalPeriodDebit, totalPeriodCredit,
                totalClosingDebit, totalClosingCredit
        );
    }

    private static int calculateLevelForAccount(ChartOfAccount account) {
        int level = 1;
        ChartOfAccount parent = account.getParentAccount();
        while (parent != null) {
            level++;
            parent = parent.getParentAccount();
        }
        return level;
    }

    private static class MutableTBRow {
        String accountCode;
        String accountName;
        String parentCode;
        int level;
        boolean hasChildren;
        BigDecimal openingDebit = BigDecimal.ZERO;
        BigDecimal openingCredit = BigDecimal.ZERO;
        BigDecimal periodDebit = BigDecimal.ZERO;
        BigDecimal periodCredit = BigDecimal.ZERO;
    }

    @Transactional(readOnly = true)
    public FinancialStatementResponse balanceSheet(LocalDate fromDate, LocalDate toDate) {
        return statement(fromDate, toDate, AccountType.ASSET, AccountType.LIABILITY, AccountType.EQUITY);
    }

    @Transactional(readOnly = true)
    public FinancialStatementResponse incomeStatement(LocalDate fromDate, LocalDate toDate) {
        return statement(fromDate, toDate, AccountType.REVENUE, AccountType.EXPENSE, AccountType.COST_OF_GOODS_SOLD);
    }

    @Transactional(readOnly = true)
    public FinancialStatementResponse cashFlow(LocalDate fromDate, LocalDate toDate) {
        return statementForAccounts(fromDate, toDate, CASH, BANK);
    }

    @Transactional(readOnly = true)
    public GeneralLedgerResponse generalLedger(String accountCode, LocalDate fromDate, LocalDate toDate) {
        return generalLedger(accountCode, fromDate, toDate, null);
    }

    @Transactional(readOnly = true)
    public GeneralLedgerResponse generalLedger(String accountCode, LocalDate fromDate, LocalDate toDate, Long branchId) {
        ChartOfAccount account = accountByCode(accountCode);
        BigDecimal openingBalance = lineRepository.getOpeningBalance(accountCode, branchId, fromDate);
        BigDecimal runningBalance = openingBalance;
        List<GeneralLedgerLineResponse> rows = new ArrayList<>();
        List<JournalEntryLine> lines = lineRepository.generalLedgerForBranch(accountCode, branchId, fromDate, toDate, JournalEntryStatus.POSTED);
        for (JournalEntryLine line : lines) {
            runningBalance = runningBalance.add(line.getDebitAmount()).subtract(line.getCreditAmount());
            rows.add(new GeneralLedgerLineResponse(
                    line.getJournalEntry().getEntryDate(),
                    line.getJournalEntry().getId(),
                    line.getJournalEntry().getEntryCode(),
                    line.getJournalEntry().getReferenceType().name(),
                    line.getJournalEntry().getReferenceId(),
                    line.getDescription(),
                    findCounterAccount(line),
                    line.getDebitAmount(),
                    line.getCreditAmount(),
                    runningBalance
            ));
        }
        return new GeneralLedgerResponse(account.getAccountCode(), account.getAccountName(), fromDate, toDate, openingBalance, runningBalance, rows);
    }

    public static String findCounterAccount(JournalEntryLine line) {
        if (line.getJournalEntry() == null || line.getJournalEntry().getLines() == null) return "";
        List<JournalEntryLine> siblings = line.getJournalEntry().getLines();
        if (siblings.size() <= 1) return "";
        boolean isDebit = line.getDebitAmount().compareTo(BigDecimal.ZERO) > 0;
        List<String> counters = siblings.stream()
                .filter(s -> s != line)
                .filter(s -> isDebit ? s.getCreditAmount().compareTo(BigDecimal.ZERO) > 0 : s.getDebitAmount().compareTo(BigDecimal.ZERO) > 0)
                .map(s -> s.getAccount().getAccountCode())
                .distinct()
                .toList();
        if (counters.isEmpty()) return "";
        return String.join(",", counters);
    }

    private void apply(ChartOfAccount account, ChartOfAccountRequest request) {
        account.setAccountCode(request.accountCode());
        account.setAccountName(request.accountName());
        account.setAccountType(request.accountType());
        account.setParentAccount(request.parentAccountId() == null ? null : accountRepository.findById(request.parentAccountId())
                .orElseThrow(() -> new NotFoundException("Parent account not found: " + request.parentAccountId())));
        account.setActive(request.active() == null || request.active());
        account.setDescription(request.description());
    }

    private JournalEntry buildJournalEntry(JournalEntryRequest request, String createdBy) {
        JournalEntry entry = new JournalEntry();
        entry.setEntryDate(request.entryDate());
        entry.setAccountingYear(request.entryDate().getYear());
        entry.setAccountingMonth(request.entryDate().getMonthValue());
        entry.setReferenceType(request.referenceType());
        entry.setReferenceId(request.referenceId());
        entry.setDescription(request.description());
        entry.setCreatedBy(createdBy);
        for (JournalEntryLineRequest lineRequest : request.lines()) {
            JournalEntryLine line = new JournalEntryLine();
            line.setAccount(accountByCode(lineRequest.accountCode()));
            line.setDebitAmount(nullToZero(lineRequest.debitAmount()));
            line.setCreditAmount(nullToZero(lineRequest.creditAmount()));
            line.setDescription(lineRequest.description());
            line.setCustomerId(lineRequest.customerId());
            line.setSupplierId(lineRequest.supplierId());
            line.setCostCenterId(lineRequest.costCenterId());
            entry.addLine(line);
        }
        recalculateAndValidate(entry);
        return entry;
    }

    private void postIfAbsent(JournalReferenceType referenceType, String referenceId, JournalEntryRequest request) {
        boolean posted = journalEntryRepository.findByReferenceTypeAndReferenceIdAndStatus(referenceType, referenceId, JournalEntryStatus.POSTED).isPresent();
        if (posted) {
            return;
        }
        JournalEntry entry = buildJournalEntry(request, "system");
        post(entry, "system");
        journalEntryRepository.save(entry);
    }

    private void post(JournalEntry entry, String postedBy) {
        if (entry.getStatus() == JournalEntryStatus.CANCELLED) {
            throw new BusinessException("Cancelled journal entry cannot be posted");
        }
        recalculateAndValidate(entry);
        entry.setStatus(JournalEntryStatus.POSTED);
        entry.setPostedBy(postedBy);
        entry.setPostedAt(OffsetDateTime.now());
    }

    private void recalculateAndValidate(JournalEntry entry) {
        BigDecimal totalDebit = entry.getLines().stream().map(JournalEntryLine::getDebitAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCredit = entry.getLines().stream().map(JournalEntryLine::getCreditAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (totalDebit.compareTo(BigDecimal.ZERO) <= 0 || totalCredit.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Journal entry must have debit and credit amounts");
        }
        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new BusinessException("Journal entry is not balanced");
        }
        for (JournalEntryLine line : entry.getLines()) {
            if (line.getDebitAmount().compareTo(BigDecimal.ZERO) > 0 && line.getCreditAmount().compareTo(BigDecimal.ZERO) > 0) {
                throw new BusinessException("A journal line cannot have both debit and credit amounts");
            }
        }
        entry.setTotalDebit(totalDebit);
        entry.setTotalCredit(totalCredit);
    }

    private List<JournalEntryLineRequest> salesLines(BigDecimal totalAmount, BigDecimal paidAmount, BigDecimal costAmount, PaymentMethod paymentMethod) {
        List<JournalEntryLineRequest> lines = new ArrayList<>();
        BigDecimal receivableAmount = totalAmount.subtract(paidAmount);
        if (paidAmount.compareTo(BigDecimal.ZERO) > 0) {
            addDebit(lines, isBankPayment(paymentMethod) ? BANK : CASH, paidAmount, "Sales payment");
        }
        if (receivableAmount.compareTo(BigDecimal.ZERO) > 0) {
            addDebit(lines, RECEIVABLE, receivableAmount, "Customer receivable");
        }
        addCredit(lines, REVENUE, totalAmount, "Sales revenue");
        if (costAmount.compareTo(BigDecimal.ZERO) > 0) {
            addDebit(lines, COGS, costAmount, "Cost of goods sold");
            addCredit(lines, INVENTORY, costAmount, "Inventory issued");
        }
        return lines;
    }

    private FinancialStatementResponse statement(LocalDate fromDate, LocalDate toDate, AccountType... accountTypes) {
        List<AccountType> allowedTypes = List.of(accountTypes);
        List<LedgerReportRow> rows = aggregate(fromDate, toDate).values().stream()
                .filter(row -> allowedTypes.contains(AccountType.valueOf(row.accountType())))
                .toList();
        return response(fromDate, toDate, rows);
    }

    private FinancialStatementResponse statementForAccounts(LocalDate fromDate, LocalDate toDate, String... accountCodes) {
        List<String> allowedCodes = List.of(accountCodes);
        List<LedgerReportRow> rows = aggregate(fromDate, toDate).values().stream()
                .filter(row -> allowedCodes.contains(row.accountCode()))
                .toList();
        return response(fromDate, toDate, rows);
    }

    private Map<String, LedgerReportRow> aggregate(LocalDate fromDate, LocalDate toDate) {
        Map<String, LedgerReportRow> rows = new LinkedHashMap<>();
        for (JournalEntryLine line : lineRepository.postedLinesBetween(fromDate, toDate, JournalEntryStatus.POSTED)) {
            ChartOfAccount account = line.getAccount();
            LedgerReportRow current = rows.getOrDefault(account.getAccountCode(), new LedgerReportRow(
                    account.getAccountCode(),
                    account.getAccountName(),
                    account.getAccountType().name(),
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO
            ));
            BigDecimal debit = current.debitAmount().add(line.getDebitAmount());
            BigDecimal credit = current.creditAmount().add(line.getCreditAmount());
            rows.put(account.getAccountCode(), new LedgerReportRow(
                    current.accountCode(),
                    current.accountName(),
                    current.accountType(),
                    debit,
                    credit,
                    debit.subtract(credit)
            ));
        }
        return rows;
    }

    private FinancialStatementResponse response(LocalDate fromDate, LocalDate toDate, List<LedgerReportRow> rows) {
        BigDecimal totalDebit = rows.stream().map(LedgerReportRow::debitAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCredit = rows.stream().map(LedgerReportRow::creditAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new FinancialStatementResponse(fromDate, toDate, rows, totalDebit, totalCredit);
    }

    private ChartOfAccount accountByCode(String accountCode) {
        ChartOfAccount account = accountRepository.findByAccountCode(accountCode)
                .orElseThrow(() -> new NotFoundException("Accounting account not found: " + accountCode));
        if (!account.isActive()) {
            throw new BusinessException("Accounting account is inactive: " + accountCode);
        }
        return account;
    }

    private void addDebit(List<JournalEntryLineRequest> lines, String accountCode, BigDecimal amount, String description) {
        if (amount.compareTo(BigDecimal.ZERO) > 0) {
            lines.add(new JournalEntryLineRequest(accountCode, amount, BigDecimal.ZERO, description));
        }
    }

    private void addCredit(List<JournalEntryLineRequest> lines, String accountCode, BigDecimal amount, String description) {
        if (amount.compareTo(BigDecimal.ZERO) > 0) {
            lines.add(new JournalEntryLineRequest(accountCode, BigDecimal.ZERO, amount, description));
        }
    }

    private boolean isBankPayment(PaymentMethod paymentMethod) {
        return paymentMethod == PaymentMethod.BANK_TRANSFER || paymentMethod == PaymentMethod.INSTALLMENT;
    }

    private BigDecimal nullToZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String currentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return "system";
        }
        return authentication.getName();
    }

    // ────────────────────────────────────────────────────────────────────────
    // Ghi chi phí vận hành
    // Nợ [accountCode] / Có [contraAccount]
    // ────────────────────────────────────────────────────────────────────────

    /**
     * @return journalEntryId của bút toán được tạo
     */
    @Transactional
    public long postExpense(String expenseCode, LocalDate date, BigDecimal amount,
                            String debitAccountCode, String creditAccountCode,
                            Long branchId, String description, String operator) {
        accountingPeriodService.assertPeriodNotLocked(date, null);
        List<JournalEntryLineRequest> lines = new ArrayList<>();
        addDebit(lines, debitAccountCode, amount, description);
        addCredit(lines, creditAccountCode, amount, description);

        JournalEntryRequest request = new JournalEntryRequest(
                date,
                JournalReferenceType.EXPENSE,
                expenseCode,
                description,
                lines
        );
        JournalEntryResponse response = createAndPost(request, operator);
        return response.id();
    }

    // ────────────────────────────────────────────────────────────────────────
    // Khấu hao TSCĐ
    // Nợ [expenseAccount] / Có [depreciationAccount]
    // ────────────────────────────────────────────────────────────────────────

    /**
     * @return journalEntryId của bút toán được tạo
     */
    @Transactional
    public long postFixedAssetDepreciation(String assetCode, LocalDate date, BigDecimal amount,
                                           String debitAccountCode, String creditAccountCode,
                                           Long branchId, String description, String operator) {
        accountingPeriodService.assertPeriodNotLocked(date, null);
        List<JournalEntryLineRequest> lines = new ArrayList<>();
        addDebit(lines, debitAccountCode, amount, description);
        addCredit(lines, creditAccountCode, amount, description);

        JournalEntryRequest request = new JournalEntryRequest(
                date,
                JournalReferenceType.DEPRECIATION,
                assetCode,
                description,
                lines
        );
        JournalEntryResponse response = createAndPost(request, operator);
        return response.id();
    }

    // ────────────────────────────────────────────────────────────────────────
    // Bán hàng có VAT
    // Nợ 111/112/131 (totalIncVat) / Có 511 (taxBase) + Có 3331 (vatAmount)
    // ────────────────────────────────────────────────────────────────────────

    @Transactional
    public void postSalesOrderWithVat(String orderNo, LocalDate date,
                                      Long customerId, String customerName,
                                      BigDecimal taxBase, BigDecimal vatAmount,
                                      PaymentMethod paymentMethod, String operator) {
        accountingPeriodService.assertPeriodNotLocked(date, null);
        BigDecimal total = taxBase.add(nullToZero(vatAmount));
        String debitAcc = isBankPayment(paymentMethod) ? BANK : (paymentMethod == PaymentMethod.CARD ? RECEIVABLE : CASH);

        List<JournalEntryLineRequest> lines = new ArrayList<>();
        addDebit(lines, debitAcc, total, "Thu tien ban hang " + orderNo);
        addCredit(lines, REVENUE, taxBase, "Doanh thu ban hang " + orderNo);
        if (vatAmount != null && vatAmount.compareTo(BigDecimal.ZERO) > 0) {
            addCredit(lines, VAT_OUTPUT, vatAmount, "VAT dau ra " + orderNo);
        }

        JournalEntryRequest request = new JournalEntryRequest(
                date, JournalReferenceType.SALES_ORDER, orderNo,
                "Ban hang " + orderNo + " - " + customerName, lines);
        createAndPost(request, operator);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Nhập hàng có VAT
    // Nợ 156 (taxBase) + Nợ 1331 (vatInput) / Có 111/112/331
    // ────────────────────────────────────────────────────────────────────────

    @Transactional
    public void postPurchaseOrderWithVat(String poNo, LocalDate date,
                                         Long supplierId, String supplierName,
                                         BigDecimal taxBase, BigDecimal vatAmount,
                                         boolean cashPayment, String operator) {
        accountingPeriodService.assertPeriodNotLocked(date, null);
        BigDecimal total = taxBase.add(nullToZero(vatAmount));
        String creditAcc = cashPayment ? CASH : PAYABLE;

        List<JournalEntryLineRequest> lines = new ArrayList<>();
        addDebit(lines, INVENTORY, taxBase, "Nhap hang " + poNo);
        if (vatAmount != null && vatAmount.compareTo(BigDecimal.ZERO) > 0) {
            addDebit(lines, VAT_INPUT, vatAmount, "VAT dau vao " + poNo);
        }
        addCredit(lines, creditAcc, total, "Thanh toan/cong no " + poNo);

        JournalEntryRequest request = new JournalEntryRequest(
                date, JournalReferenceType.PURCHASE_ORDER, poNo,
                "Nhap hang " + poNo + " - " + supplierName, lines);
        createAndPost(request, operator);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Sửa chữa tính phí có VAT + phụ tùng
    // ────────────────────────────────────────────────────────────────────────

    @Transactional
    public void postServiceWithVat(String ticketNo, LocalDate date,
                                   Long customerId, String customerName,
                                   BigDecimal serviceBase, BigDecimal vatAmount,
                                   BigDecimal partsCost, PaymentMethod paymentMethod,
                                   String serviceRevenueAccount, String operator) {
        accountingPeriodService.assertPeriodNotLocked(date, null);
        BigDecimal total = serviceBase.add(nullToZero(vatAmount));
        String debitAcc = isBankPayment(paymentMethod) ? BANK : (paymentMethod == PaymentMethod.CARD ? RECEIVABLE : CASH);
        String revenueAcc = serviceRevenueAccount != null ? serviceRevenueAccount : REVENUE;

        List<JournalEntryLineRequest> lines = new ArrayList<>();
        addDebit(lines, debitAcc, total, "Thu phi dich vu " + ticketNo);
        addCredit(lines, revenueAcc, serviceBase, "Doanh thu dich vu " + ticketNo);
        if (vatAmount != null && vatAmount.compareTo(BigDecimal.ZERO) > 0) {
            addCredit(lines, VAT_OUTPUT, vatAmount, "VAT dich vu " + ticketNo);
        }
        // Nếu có dùng phụ tùng: xuất kho
        if (partsCost != null && partsCost.compareTo(BigDecimal.ZERO) > 0) {
            addDebit(lines, COGS, partsCost, "Phu tung xuat kho " + ticketNo);
            addCredit(lines, INVENTORY, partsCost, "Xuat kho phu tung " + ticketNo);
        }

        JournalEntryRequest request = new JournalEntryRequest(
                date, JournalReferenceType.SERVICE_TICKET, ticketNo,
                "Sua chua tinh phi " + ticketNo + " - " + customerName, lines);
        createAndPost(request, operator);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Bảo hành miễn phí
    // Nợ 642 / Có 156 (phụ tùng) + Có 111/334 (nhân công nếu có)
    // ────────────────────────────────────────────────────────────────────────

    @Transactional
    public void postWarrantyWithParts(String ticketNo, LocalDate date,
                                      BigDecimal partsCost, BigDecimal laborCost,
                                      String warrantyExpenseAccount, String operator) {
        accountingPeriodService.assertPeriodNotLocked(date, null);
        String expenseAcc = warrantyExpenseAccount != null ? warrantyExpenseAccount : "642";
        BigDecimal total = nullToZero(partsCost).add(nullToZero(laborCost));
        if (total.compareTo(BigDecimal.ZERO) <= 0) return;

        List<JournalEntryLineRequest> lines = new ArrayList<>();
        addDebit(lines, expenseAcc, total, "Chi phi bao hanh " + ticketNo);
        if (partsCost != null && partsCost.compareTo(BigDecimal.ZERO) > 0) {
            addCredit(lines, INVENTORY, partsCost, "Phu tung bao hanh " + ticketNo);
        }
        if (laborCost != null && laborCost.compareTo(BigDecimal.ZERO) > 0) {
            addCredit(lines, CASH, laborCost, "Nhan cong bao hanh " + ticketNo);
        }

        JournalEntryRequest request = new JournalEntryRequest(
                date, JournalReferenceType.SERVICE_TICKET, ticketNo,
                "Bao hanh mien phi " + ticketNo, lines);
        createAndPost(request, operator);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Helper: tạo + post entry
    // ────────────────────────────────────────────────────────────────────────

    private JournalEntryResponse createAndPost(JournalEntryRequest request, String operator) {
        JournalEntryResponse created = createJournalEntry(request);
        return postJournalEntry(created.id());
    }

    // ────────────────────────────────────────────────────────────────────────
    // Sổ Nhật Ký Chung (Journal Ledger) — paginated with filters
    // ────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public com.chuanphat.warranty.common.dto.PageResponse<JournalEntryResponse> journalLedger(
            LocalDate fromDate, LocalDate toDate, Long branchId,
            String accountCode, String referenceType, String keyword,
            int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        JournalEntryStatus status = JournalEntryStatus.POSTED;
        String q = keyword == null || keyword.isBlank() ? null : keyword.trim();
        PageRequest pageRequest = PageRequest.of(page, pageSize,
                org.springframework.data.domain.Sort.by("entryDate").descending().and(
                org.springframework.data.domain.Sort.by("id").descending()));
        return com.chuanphat.warranty.common.dto.PageResponse.from(
                journalEntryRepository.search(scopedBranchId, status, fromDate, toDate, q, pageRequest)
                        .map(e -> {
                            Long periodId = accountingPeriodService.findPeriodIdByDate(e.getEntryDate(), e.getBranchId());
                            return JournalEntryResponse.summary(e, periodId);
                        }));
    }

    // ────────────────────────────────────────────────────────────────────────
    // Sổ Chi Tiết Công Nợ Phải Thu (by customer)
    // ────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public GeneralLedgerResponse detailDebtReceivable(Long customerId, LocalDate fromDate, LocalDate toDate) {
        Long scopedBranchId = branchSecurity.scopedBranchId(null);
        BigDecimal openingBalance = lineRepository.getOpeningBalanceByCustomer(RECEIVABLE, customerId, scopedBranchId, fromDate);
        if (openingBalance == null) openingBalance = BigDecimal.ZERO;
        BigDecimal runningBalance = openingBalance;
        List<JournalEntryLine> lines = lineRepository.generalLedgerByCustomer(
                RECEIVABLE, customerId, scopedBranchId, fromDate, toDate, JournalEntryStatus.POSTED);
        List<GeneralLedgerLineResponse> rows = new ArrayList<>();
        for (JournalEntryLine line : lines) {
            runningBalance = runningBalance.add(line.getDebitAmount()).subtract(line.getCreditAmount());
            rows.add(new GeneralLedgerLineResponse(
                    line.getJournalEntry().getEntryDate(),
                    line.getJournalEntry().getId(),
                    line.getJournalEntry().getEntryCode(),
                    line.getJournalEntry().getReferenceType().name(),
                    line.getJournalEntry().getReferenceId(),
                    line.getDescription(),
                    findCounterAccount(line),
                    line.getDebitAmount(),
                    line.getCreditAmount(),
                    runningBalance
            ));
        }
        return new GeneralLedgerResponse(RECEIVABLE, "Phải thu của khách hàng", fromDate, toDate, openingBalance, runningBalance, rows);
    }

    // ────────────────────────────────────────────────────────────────────────
    // Sổ Chi Tiết Công Nợ Phải Trả (by supplier)
    // ────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public GeneralLedgerResponse detailDebtPayable(Long supplierId, LocalDate fromDate, LocalDate toDate) {
        Long scopedBranchId = branchSecurity.scopedBranchId(null);
        BigDecimal openingBalance = lineRepository.getOpeningBalanceBySupplier(PAYABLE, supplierId, scopedBranchId, fromDate);
        if (openingBalance == null) openingBalance = BigDecimal.ZERO;
        BigDecimal runningBalance = openingBalance;
        List<JournalEntryLine> lines = lineRepository.generalLedgerBySupplier(
                PAYABLE, supplierId, scopedBranchId, fromDate, toDate, JournalEntryStatus.POSTED);
        List<GeneralLedgerLineResponse> rows = new ArrayList<>();
        for (JournalEntryLine line : lines) {
            // TK 331: dư Có = phải trả tăng khi Có, giảm khi Nợ
            runningBalance = runningBalance.subtract(line.getDebitAmount()).add(line.getCreditAmount());
            rows.add(new GeneralLedgerLineResponse(
                    line.getJournalEntry().getEntryDate(),
                    line.getJournalEntry().getId(),
                    line.getJournalEntry().getEntryCode(),
                    line.getJournalEntry().getReferenceType().name(),
                    line.getJournalEntry().getReferenceId(),
                    line.getDescription(),
                    findCounterAccount(line),
                    line.getDebitAmount(),
                    line.getCreditAmount(),
                    runningBalance
            ));
        }
        return new GeneralLedgerResponse(PAYABLE, "Phải trả cho người bán", fromDate, toDate, openingBalance, runningBalance, rows);
    }
}

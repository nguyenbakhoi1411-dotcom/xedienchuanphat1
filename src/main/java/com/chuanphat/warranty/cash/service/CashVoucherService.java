package com.chuanphat.warranty.cash.service;

import com.chuanphat.warranty.accounting.dto.JournalEntryLineRequest;
import com.chuanphat.warranty.accounting.dto.JournalEntryRequest;
import com.chuanphat.warranty.accounting.dto.JournalEntryResponse;
import com.chuanphat.warranty.accounting.entity.JournalEntry;
import com.chuanphat.warranty.accounting.entity.JournalEntryLine;
import com.chuanphat.warranty.accounting.enums.JournalEntryStatus;
import com.chuanphat.warranty.accounting.enums.JournalReferenceType;
import com.chuanphat.warranty.accounting.repository.JournalEntryLineRepository;
import com.chuanphat.warranty.accounting.repository.JournalEntryRepository;
import com.chuanphat.warranty.accounting.service.AccountingLedgerService;
import com.chuanphat.warranty.cash.dto.*;
import com.chuanphat.warranty.cash.entity.*;
import com.chuanphat.warranty.cash.repository.CashVoucherRepository;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.entity.Customer;
import com.chuanphat.warranty.core.entity.Supplier;
import com.chuanphat.warranty.core.repository.CustomerRepository;
import com.chuanphat.warranty.core.repository.SupplierRepository;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CashVoucherService {

    private final CashVoucherRepository repository;
    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;
    private final AccountingLedgerService ledgerService;
    private final JournalEntryRepository journalEntryRepository;
    private final JournalEntryLineRepository journalLineRepository;
    private final BranchSecurity branchSecurity;

    public CashVoucherService(
            CashVoucherRepository repository,
            CustomerRepository customerRepository,
            SupplierRepository supplierRepository,
            AccountingLedgerService ledgerService,
            JournalEntryRepository journalEntryRepository,
            JournalEntryLineRepository journalLineRepository,
            BranchSecurity branchSecurity
    ) {
        this.repository = repository;
        this.customerRepository = customerRepository;
        this.supplierRepository = supplierRepository;
        this.ledgerService = ledgerService;
        this.journalEntryRepository = journalEntryRepository;
        this.journalLineRepository = journalLineRepository;
        this.branchSecurity = branchSecurity;
    }

    @Transactional
    public CashVoucherResponse createVoucher(CreateCashVoucherRequest request, Long branchId) {
        branchSecurity.requireBranchAccess(branchId);

        CashVoucher voucher = new CashVoucher();
        voucher.setVoucherType(request.voucherType());
        voucher.setVoucherDate(request.voucherDate());
        voucher.setObjectType(request.objectType());
        voucher.setCustomerId(request.customerId());
        voucher.setSupplierId(request.supplierId());
        voucher.setDescription(request.description());
        voucher.setCashAccountCode(request.cashAccountCode() == null || request.cashAccountCode().isBlank() ? "111" : request.cashAccountCode());
        voucher.setBranchId(branchId);
        voucher.setStatus(CashVoucherStatus.DRAFT);
        voucher.setCreatedBy(branchSecurity.currentUser().getUsername());

        // Generate voucher code (PT/PC + yyyyMMdd + 3 digit counter)
        String typePrefix = request.voucherType() == CashVoucherType.RECEIPT ? "PT" : "PC";
        String datePrefix = request.voucherDate().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = typePrefix + datePrefix;

        Optional<CashVoucher> lastVoucher = repository.findTopByBranchIdAndVoucherTypeAndVoucherNoStartingWithOrderByVoucherNoDesc(
                branchId, request.voucherType(), prefix);

        int nextNum = 1;
        if (lastVoucher.isPresent()) {
            String lastNo = lastVoucher.get().getVoucherNo();
            try {
                String suffix = lastNo.substring(lastNo.length() - 3);
                nextNum = Integer.parseInt(suffix) + 1;
            } catch (Exception e) {
                // Ignore parsing errors and fallback to 1
            }
        }
        String voucherNo = prefix + String.format("%03d", nextNum);
        voucher.setVoucherNo(voucherNo);

        BigDecimal total = BigDecimal.ZERO;
        int lineNo = 1;
        for (CashVoucherLineRequest lineReq : request.lines()) {
            CashVoucherLine line = new CashVoucherLine();
            line.setLineNo(lineNo++);
            line.setAccountCode(lineReq.accountCode());
            line.setAmount(lineReq.amount());
            line.setDescription(lineReq.description());
            line.setCostCenterId(lineReq.costCenterId());
            voucher.addLine(line);
            total = total.add(lineReq.amount());
        }
        voucher.setTotalAmount(total);

        CashVoucher saved = repository.save(voucher);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<CashVoucherResponse> listVouchers(
            CashVoucherType type,
            LocalDate fromDate,
            LocalDate toDate,
            CashVoucherStatus status,
            int page,
            int size,
            Long branchId
    ) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        Pageable pageable = PageRequest.of(page, size);
        return repository.search(scopedBranchId, type, status, fromDate, toDate, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CashVoucherResponse getVoucher(Long id) {
        CashVoucher voucher = getEntity(id);
        return toResponse(voucher);
    }

    @Transactional
    public CashVoucherResponse updateVoucher(Long id, CreateCashVoucherRequest request) {
        CashVoucher voucher = getEntity(id);
        if (voucher.getStatus() != CashVoucherStatus.DRAFT) {
            throw new BusinessException("Only DRAFT vouchers can be updated");
        }

        voucher.setVoucherDate(request.voucherDate());
        voucher.setObjectType(request.objectType());
        voucher.setCustomerId(request.customerId());
        voucher.setSupplierId(request.supplierId());
        voucher.setDescription(request.description());
        voucher.setCashAccountCode(request.cashAccountCode() == null || request.cashAccountCode().isBlank() ? "111" : request.cashAccountCode());

        // Update lines
        voucher.getLines().clear();
        BigDecimal total = BigDecimal.ZERO;
        int lineNo = 1;
        for (CashVoucherLineRequest lineReq : request.lines()) {
            CashVoucherLine line = new CashVoucherLine();
            line.setLineNo(lineNo++);
            line.setAccountCode(lineReq.accountCode());
            line.setAmount(lineReq.amount());
            line.setDescription(lineReq.description());
            line.setCostCenterId(lineReq.costCenterId());
            voucher.addLine(line);
            total = total.add(lineReq.amount());
        }
        voucher.setTotalAmount(total);

        CashVoucher saved = repository.save(voucher);
        return toResponse(saved);
    }

    @Transactional
    public CashVoucherResponse postVoucher(Long id) {
        CashVoucher voucher = getEntity(id);
        if (voucher.getStatus() != CashVoucherStatus.DRAFT) {
            throw new BusinessException("Voucher is already posted or cancelled");
        }

        BigDecimal sumOfLines = voucher.getLines().stream()
                .map(CashVoucherLine::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (sumOfLines.compareTo(voucher.getTotalAmount()) != 0) {
            throw new BusinessException("Sum of lines does not match total amount");
        }

        // Post to Accounting
        List<JournalEntryLineRequest> jeLines = new ArrayList<>();
        JournalReferenceType referenceType = voucher.getVoucherType() == CashVoucherType.RECEIPT 
                ? JournalReferenceType.RECEIPT_VOUCHER 
                : JournalReferenceType.PAYMENT_VOUCHER;

        if (voucher.getVoucherType() == CashVoucherType.RECEIPT) {
            // Receipt: Debit cash account (111) / Credit contra accounts
            jeLines.add(new JournalEntryLineRequest(voucher.getCashAccountCode(), voucher.getTotalAmount(), BigDecimal.ZERO, voucher.getDescription()));
            for (CashVoucherLine line : voucher.getLines()) {
                jeLines.add(new JournalEntryLineRequest(line.getAccountCode(), BigDecimal.ZERO, line.getAmount(), line.getDescription()));
            }
        } else {
            // Payment: Debit contra accounts / Credit cash account (111)
            for (CashVoucherLine line : voucher.getLines()) {
                jeLines.add(new JournalEntryLineRequest(line.getAccountCode(), line.getAmount(), BigDecimal.ZERO, line.getDescription()));
            }
            jeLines.add(new JournalEntryLineRequest(voucher.getCashAccountCode(), BigDecimal.ZERO, voucher.getTotalAmount(), voucher.getDescription()));
        }

        JournalEntryRequest jeRequest = new JournalEntryRequest(
                voucher.getVoucherDate(),
                referenceType,
                voucher.getVoucherNo(),
                voucher.getDescription(),
                jeLines
        );

        JournalEntryResponse jeResponse = ledgerService.createJournalEntry(jeRequest);

        // Update Journal Entry metadata to align branch context
        JournalEntry je = journalEntryRepository.findById(jeResponse.id())
                .orElseThrow(() -> new NotFoundException("Journal entry not found"));
        je.setBranchId(voucher.getBranchId());

        for (JournalEntryLine line : je.getLines()) {
            line.setBranchId(voucher.getBranchId());
            if (voucher.getObjectType() == ObjectType.CUSTOMER) {
                line.setCustomerId(voucher.getCustomerId());
            } else if (voucher.getObjectType() == ObjectType.SUPPLIER) {
                line.setSupplierId(voucher.getSupplierId());
            }
            // Populate cost center ID if available
            for (CashVoucherLine cvl : voucher.getLines()) {
                if (cvl.getAccountCode().equals(line.getAccount().getAccountCode()) && cvl.getAmount().compareTo(line.getDebitAmount().add(line.getCreditAmount())) == 0) {
                    line.setCostCenterId(cvl.getCostCenterId());
                }
            }
        }
        journalEntryRepository.save(je);

        // Post the Journal Entry
        ledgerService.postJournalEntry(je.getId());

        voucher.setStatus(CashVoucherStatus.POSTED);
        voucher.setJournalEntryId(je.getId());
        voucher.setPostedAt(OffsetDateTime.now());

        return toResponse(repository.save(voucher));
    }

    @Transactional
    public CashVoucherResponse cancelVoucher(Long id, String reason) {
        CashVoucher voucher = getEntity(id);
        if (voucher.getStatus() == CashVoucherStatus.CANCELLED) {
            throw new BusinessException("Voucher is already cancelled");
        }

        String operator = branchSecurity.currentUser().getUsername();
        if (voucher.getStatus() == CashVoucherStatus.POSTED && voucher.getJournalEntryId() != null) {
            JournalEntry originalJe = journalEntryRepository.findById(voucher.getJournalEntryId()).orElse(null);
            if (originalJe != null && originalJe.getStatus() == JournalEntryStatus.POSTED) {
                // Reverse the journal entry
                List<JournalEntryLineRequest> reversedLines = new ArrayList<>();
                for (JournalEntryLine line : originalJe.getLines()) {
                    reversedLines.add(new JournalEntryLineRequest(
                            line.getAccount().getAccountCode(),
                            line.getCreditAmount(),
                            line.getDebitAmount(),
                            "Reversal of " + originalJe.getEntryCode() + ": " + reason
                    ));
                }
                JournalEntryRequest revRequest = new JournalEntryRequest(
                        LocalDate.now(),
                        originalJe.getReferenceType(),
                        originalJe.getEntryCode() + "-REV",
                        "Reversal of " + originalJe.getEntryCode() + ": " + reason,
                        reversedLines
                );
                JournalEntryResponse revResponse = ledgerService.createJournalEntry(revRequest);
                JournalEntry revJe = journalEntryRepository.findById(revResponse.id())
                        .orElseThrow(() -> new NotFoundException("Journal entry not found"));
                revJe.setBranchId(voucher.getBranchId());
                for (JournalEntryLine line : revJe.getLines()) {
                    line.setBranchId(voucher.getBranchId());
                }
                journalEntryRepository.save(revJe);
                ledgerService.postJournalEntry(revJe.getId());
            }
        } else if (voucher.getStatus() == CashVoucherStatus.DRAFT && voucher.getJournalEntryId() != null) {
            // Cancel draft journal entry
            ledgerService.cancelJournalEntry(voucher.getJournalEntryId());
        }

        voucher.setStatus(CashVoucherStatus.CANCELLED);
        voucher.setCancelledAt(OffsetDateTime.now());
        if (voucher.getDescription() != null) {
            voucher.setDescription(voucher.getDescription() + " (Cancelled: " + reason + ")");
        } else {
            voucher.setDescription("(Cancelled: " + reason + ")");
        }

        return toResponse(repository.save(voucher));
    }

    @Transactional(readOnly = true)
    public List<CashBookResponse> getCashBook(String accountCode, LocalDate fromDate, LocalDate toDate, Long branchId) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        String actCode = accountCode == null || accountCode.isBlank() ? "111" : accountCode;

        BigDecimal openingBalance = journalLineRepository.getOpeningBalance(actCode, scopedBranchId, fromDate);
        List<CashBookResponse> result = new ArrayList<>();

        // 1. Prepend Opening Balance Row
        result.add(new CashBookResponse(
                null,
                fromDate,
                "Tồn đầu kỳ",
                null,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                openingBalance
        ));

        List<JournalEntryLine> lines = journalLineRepository.generalLedgerForBranch(
                actCode, scopedBranchId, fromDate, toDate, JournalEntryStatus.POSTED);

        BigDecimal runningBalance = openingBalance;
        for (JournalEntryLine line : lines) {
            BigDecimal debit = line.getDebitAmount();
            BigDecimal credit = line.getCreditAmount();
            runningBalance = runningBalance.add(debit).subtract(credit);

            String objectName = resolveObjectName(
                    line.getCustomerId() != null ? ObjectType.CUSTOMER : (line.getSupplierId() != null ? ObjectType.SUPPLIER : null),
                    line.getCustomerId(),
                    line.getSupplierId()
            );

            result.add(new CashBookResponse(
                    line.getJournalEntry().getEntryCode(),
                    line.getJournalEntry().getEntryDate(),
                    line.getDescription(),
                    objectName,
                    debit,
                    credit,
                    runningBalance
            ));
        }

        // 2. Append Closing Balance Row
        result.add(new CashBookResponse(
                null,
                toDate,
                "Tồn cuối kỳ",
                null,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                runningBalance
        ));

        return result;
    }

    @Transactional(readOnly = true)
    public CashBalanceResponse getBalance(Long branchId) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);

        BigDecimal totalReceipt = repository.sumTotalAmountByBranchAndType(scopedBranchId, CashVoucherType.RECEIPT);
        BigDecimal totalPayment = repository.sumTotalAmountByBranchAndType(scopedBranchId, CashVoucherType.PAYMENT);
        BigDecimal currentBalance = totalReceipt.subtract(totalPayment);

        LocalDate today = LocalDate.now();
        BigDecimal todayReceipt = repository.sumTotalAmountByBranchAndTypeAndDate(scopedBranchId, CashVoucherType.RECEIPT, today);
        BigDecimal todayPayment = repository.sumTotalAmountByBranchAndTypeAndDate(scopedBranchId, CashVoucherType.PAYMENT, today);

        return new CashBalanceResponse(currentBalance, todayReceipt, todayPayment);
    }

    private CashVoucher getEntity(Long id) {
        CashVoucher voucher = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cash voucher not found: " + id));
        branchSecurity.requireBranchAccess(voucher.getBranchId());
        return voucher;
    }

    private String resolveObjectName(ObjectType objectType, Long customerId, Long supplierId) {
        if (objectType == null) return "—";
        return switch (objectType) {
            case CUSTOMER -> {
                if (customerId != null) {
                    yield customerRepository.findById(customerId)
                            .map(Customer::getFullName)
                            .orElse("Khách hàng không tồn tại");
                }
                yield "Khách hàng";
            }
            case SUPPLIER -> {
                if (supplierId != null) {
                    yield supplierRepository.findById(supplierId)
                            .map(Supplier::getName)
                            .orElse("Nhà cung cấp không tồn tại");
                }
                yield "Nhà cung cấp";
            }
            case EMPLOYEE -> "Nhân viên";
            case OTHER -> "Khác";
        };
    }

    private CashVoucherResponse toResponse(CashVoucher voucher) {
        String objectName = resolveObjectName(voucher.getObjectType(), voucher.getCustomerId(), voucher.getSupplierId());
        List<CashVoucherResponse.LineResponse> lines = voucher.getLines().stream()
                .map(line -> new CashVoucherResponse.LineResponse(
                        line.getId(),
                        line.getLineNo(),
                        line.getAccountCode(),
                        line.getAmount(),
                        line.getDescription(),
                        line.getCostCenterId()
                ))
                .toList();
        return new CashVoucherResponse(
                voucher.getId(),
                voucher.getVoucherNo(),
                voucher.getVoucherType(),
                voucher.getVoucherDate(),
                voucher.getObjectType(),
                objectName,
                voucher.getTotalAmount(),
                voucher.getStatus(),
                voucher.getBranchId(),
                voucher.getJournalEntryId(),
                lines,
                voucher.getCreatedBy(),
                voucher.getCreatedAt()
        );
    }
}

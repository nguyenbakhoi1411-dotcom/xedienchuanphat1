package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.entity.BankAccount;
import com.chuanphat.warranty.accounting.entity.BankTransaction;
import com.chuanphat.warranty.accounting.repository.BankAccountRepository;
import com.chuanphat.warranty.accounting.repository.BankTransactionRepository;
import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import com.chuanphat.warranty.accounting.service.AccountingLedgerService;
import com.chuanphat.warranty.accounting.dto.JournalEntryRequest;
import com.chuanphat.warranty.accounting.dto.JournalEntryLineRequest;
import com.chuanphat.warranty.accounting.enums.JournalReferenceType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BankTransactionService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final BankTransactionRepository transactionRepository;
    private final BankAccountRepository bankAccountRepository;
    private final BranchSecurity branchSecurity;
    private final AccountingLedgerService accountingLedgerService;

    public BankTransactionService(
            BankTransactionRepository transactionRepository,
            BankAccountRepository bankAccountRepository,
            BranchSecurity branchSecurity,
            AccountingLedgerService accountingLedgerService
    ) {
        this.transactionRepository = transactionRepository;
        this.bankAccountRepository = bankAccountRepository;
        this.branchSecurity = branchSecurity;
        this.accountingLedgerService = accountingLedgerService;
    }

    // ── Create Receipt ──

    @Transactional
    public BankTransaction createReceipt(BankTransactionRequest request) {
        return createTransaction("RECEIPT", request);
    }

    // ── Create Payment ──

    @Transactional
    public BankTransaction createPayment(BankTransactionRequest request) {
        return createTransaction("PAYMENT", request);
    }

    // ── Internal create logic ──

    @Transactional
    public BankTransaction createTransaction(String loaiGiaoDich, BankTransactionRequest request) {
        BankAccount account = bankAccountRepository.findById(request.bankAccountId())
                .orElseThrow(() -> new NotFoundException("Bank account not found: " + request.bankAccountId()));

        if (!account.isActive()) {
            throw new BusinessException("Bank account is inactive: " + account.getMaTaiKhoan());
        }

        BankTransaction tx = new BankTransaction();
        tx.setLoaiGiaoDich(loaiGiaoDich);
        tx.setBankAccount(account);
        tx.setNgayGiaoDich(request.ngayGiaoDich());
        tx.setSoThamChieuNH(request.soThamChieuNH());
        tx.setNganHangDoiUng(request.nganHangDoiUng());
        tx.setSoTkDoiUng(request.soTkDoiUng());
        tx.setTenChuTkDoiUng(request.tenChuTkDoiUng());
        tx.setSoTien(request.tongTien() != null ? request.tongTien() : BigDecimal.ZERO);
        
        // New Master fields
        tx.setDoiTuongId(request.doiTuongId());
        tx.setLoaiDoiTuong(request.loaiDoiTuong());
        tx.setTenDoiTuong(request.tenDoiTuong());
        tx.setDiaChi(request.diaChi());
        tx.setLyDo(request.lyDo());
        tx.setNhanVienId(request.nhanVienId());
        tx.setBranchId(request.branchId());
        tx.setCreatedBy(currentUsername());

        // Auto-generate code
        String prefix = loaiGiaoDich.equals("RECEIPT") ? "NTTK" : "UNC";
        long count = transactionRepository.count() + 1; // simple sequence
        tx.setMaGiaoDich(String.format("%s%05d", prefix, count));

        // Create detail items
        java.util.List<com.chuanphat.warranty.accounting.entity.BankTransactionItem> items = new java.util.ArrayList<>();
        if (request.items() != null) {
            for (BankTransactionItemRequest itemReq : request.items()) {
                com.chuanphat.warranty.accounting.entity.BankTransactionItem item = new com.chuanphat.warranty.accounting.entity.BankTransactionItem();
                item.setTransaction(tx);
                item.setDienGiai(itemReq.dienGiai());
                item.setTkNo(itemReq.tkNo());
                item.setTkCo(itemReq.tkCo());
                item.setSoTien(itemReq.soTien());
                item.setDoiTuongId(itemReq.doiTuongId());
                item.setLoaiDoiTuong(itemReq.loaiDoiTuong());
                item.setTenDoiTuong(itemReq.tenDoiTuong());
                items.add(item);
            }
        }
        tx.setItems(items);

        BankTransaction savedTx = transactionRepository.save(tx);
        return savedTx;
    }

    // ── Get one ──

    @Transactional(readOnly = true)
    public BankTransaction getById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Transaction not found: " + id));
    }

    // ── Update (DRAFT only) ──

    @Transactional
    public BankTransaction update(Long id, BankTransactionRequest request) {
        BankTransaction tx = getById(id);
        if (!"DRAFT".equals(tx.getTrangThai())) {
            throw new BusinessException("Only DRAFT transactions can be updated");
        }

        BankAccount account = tx.getBankAccount();
        // Reverse old balance effect
        reverseBalance(account, tx.getLoaiGiaoDich(), tx.getSoTien());

        tx.setSoTien(request.tongTien() != null ? request.tongTien() : BigDecimal.ZERO);
        tx.setNgayGiaoDich(request.ngayGiaoDich() != null ? request.ngayGiaoDich() : tx.getNgayGiaoDich());
        tx.setSoThamChieuNH(request.soThamChieuNH());
        tx.setNganHangDoiUng(request.nganHangDoiUng());
        tx.setSoTkDoiUng(request.soTkDoiUng());
        tx.setTenChuTkDoiUng(request.tenChuTkDoiUng());
        tx.setDoiTuongId(request.doiTuongId());
        tx.setLoaiDoiTuong(request.loaiDoiTuong());
        tx.setTenDoiTuong(request.tenDoiTuong());
        tx.setDiaChi(request.diaChi());
        tx.setLyDo(request.lyDo());
        tx.setNhanVienId(request.nhanVienId());

        if (request.items() != null) {
            tx.getItems().clear();
            for (BankTransactionItemRequest itemReq : request.items()) {
                com.chuanphat.warranty.accounting.entity.BankTransactionItem item = new com.chuanphat.warranty.accounting.entity.BankTransactionItem();
                item.setTransaction(tx);
                item.setDienGiai(itemReq.dienGiai());
                item.setTkNo(itemReq.tkNo());
                item.setTkCo(itemReq.tkCo());
                item.setSoTien(itemReq.soTien());
                item.setDoiTuongId(itemReq.doiTuongId());
                item.setLoaiDoiTuong(itemReq.loaiDoiTuong());
                item.setTenDoiTuong(itemReq.tenDoiTuong());
                tx.getItems().add(item);
            }
        }
        tx.setUpdatedAt(OffsetDateTime.now());

        BankTransaction saved = transactionRepository.save(tx);

        // Apply new balance effect
        updateBalance(account, tx.getLoaiGiaoDich(), request.tongTien() != null ? request.tongTien() : BigDecimal.ZERO);
        bankAccountRepository.save(account);

        return saved;
    }

    // ── Confirm (DRAFT → CONFIRMED) ──

    @Transactional
    public BankTransaction confirm(Long id) {
        BankTransaction tx = getById(id);
        if (!"DRAFT".equals(tx.getTrangThai())) {
            throw new BusinessException("Only DRAFT transactions can be confirmed");
        }
        tx.setTrangThai("CONFIRMED");
        tx.setUpdatedAt(OffsetDateTime.now());
        
        BankTransaction saved = transactionRepository.save(tx);

        // Post Journal Entry
        if (saved.getItems() != null && !saved.getItems().isEmpty()) {
            java.util.List<JournalEntryLineRequest> journalLines = new java.util.ArrayList<>();
            for (com.chuanphat.warranty.accounting.entity.BankTransactionItem item : saved.getItems()) {
                BigDecimal soTien = item.getSoTien() != null ? item.getSoTien() : BigDecimal.ZERO;
                if (soTien.compareTo(BigDecimal.ZERO) > 0) {
                    Long customerId = null;
                    Long supplierId = null;
                    if ("CUSTOMER".equals(item.getLoaiDoiTuong())) customerId = item.getDoiTuongId();
                    if ("SUPPLIER".equals(item.getLoaiDoiTuong())) supplierId = item.getDoiTuongId();
                    
                    if (item.getTkNo() != null) {
                        journalLines.add(new JournalEntryLineRequest(
                            item.getTkNo(), soTien, BigDecimal.ZERO, item.getDienGiai(), customerId, supplierId, null
                        ));
                    }
                    if (item.getTkCo() != null) {
                        journalLines.add(new JournalEntryLineRequest(
                            item.getTkCo(), BigDecimal.ZERO, soTien, item.getDienGiai(), customerId, supplierId, null
                        ));
                    }
                }
            }
            if (!journalLines.isEmpty()) {
                JournalEntryRequest jr = new JournalEntryRequest(
                        saved.getNgayGiaoDich() != null ? saved.getNgayGiaoDich() : LocalDate.now(),
                        "RECEIPT".equals(saved.getLoaiGiaoDich()) ? JournalReferenceType.RECEIPT_VOUCHER : JournalReferenceType.PAYMENT_VOUCHER,
                        saved.getMaGiaoDich(),
                        saved.getLyDo(),
                        journalLines
                );
                accountingLedgerService.createJournalEntry(jr);
            }
        }

        return saved;
    }

    // ── Cancel ──

    @Transactional
    public BankTransaction cancel(Long id) {
        BankTransaction tx = getById(id);
        if ("CANCELLED".equals(tx.getTrangThai())) {
            throw new BusinessException("Transaction is already cancelled");
        }

        BankAccount account = tx.getBankAccount();
        reverseBalance(account, tx.getLoaiGiaoDich(), tx.getSoTien());
        bankAccountRepository.save(account);

        tx.setTrangThai("CANCELLED");
        tx.setUpdatedAt(OffsetDateTime.now());
        return transactionRepository.save(tx);
    }

    // ── Page / filter ──

    @Transactional(readOnly = true)
    public PageResponse<BankTransaction> list(
            Long bankAccountId,
            String loaiGiaoDich,
            LocalDate fromDate,
            LocalDate toDate,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        if (bankAccountId == null) {
            Page<BankTransaction> result = transactionRepository.findAll(pageable);
            return PageResponse.from(result);
        }

        if (fromDate != null && toDate != null && loaiGiaoDich != null) {
            Page<BankTransaction> result = transactionRepository
                    .findByBankAccountIdAndLoaiGiaoDichAndNgayGiaoDichBetweenOrderByNgayGiaoDichDesc(
                            bankAccountId, loaiGiaoDich, fromDate, toDate, pageable);
            return PageResponse.from(result);
        }

        if (fromDate != null && toDate != null) {
            Page<BankTransaction> result = transactionRepository
                    .findByBankAccountIdAndNgayGiaoDichBetweenOrderByNgayGiaoDichDesc(
                            bankAccountId, fromDate, toDate, pageable);
            return PageResponse.from(result);
        }

        Page<BankTransaction> result = transactionRepository
                .findByBankAccountIdOrderByNgayGiaoDichDesc(bankAccountId, pageable);
        return PageResponse.from(result);
    }

    // ── Private helpers ──

    private String generateVoucherCode(String prefix, LocalDate date) {
        String datePart = date.format(DATE_FMT);
        String fullPrefix = prefix + "-" + datePart + "-";
        long count = transactionRepository.countByMaGiaoDichStartingWith(fullPrefix);
        return fullPrefix + String.format("%03d", count + 1);
    }

    /**
     * Determines debit (No) and credit (Co) accounting accounts.
     * Returns String[2] { taiKhoanNo, taiKhoanCo }
     */
    private String[] resolveAccountingCodes(String loaiGiaoDich, String loaiThuChi) {
        if ("RECEIPT".equals(loaiGiaoDich)) {
            return switch (loaiThuChi != null ? loaiThuChi : "OTHER") {
                case "SALE", "DEBT" -> new String[]{"1121", "131"};
                default              -> new String[]{"1121", "711"};
            };
        } else {
            // PAYMENT
            return switch (loaiThuChi != null ? loaiThuChi : "OTHER") {
                case "PURCHASE"  -> new String[]{"331", "1121"};
                case "SALARY"    -> new String[]{"334", "1121"};
                case "OPERATING" -> new String[]{"642", "1121"};
                default          -> new String[]{"811", "1121"};
            };
        }
    }

    private void updateBalance(BankAccount account, String loaiGiaoDich, BigDecimal soTien) {
        if ("RECEIPT".equals(loaiGiaoDich)) {
            account.setCurrentBalance(account.getCurrentBalance().add(soTien));
        } else {
            BigDecimal newBalance = account.getCurrentBalance().subtract(soTien);
            if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
                // Log warning but still persist — business decision
            }
            account.setCurrentBalance(newBalance);
        }
        account.setUpdatedAt(OffsetDateTime.now());
    }

    private void reverseBalance(BankAccount account, String loaiGiaoDich, BigDecimal soTien) {
        if ("RECEIPT".equals(loaiGiaoDich)) {
            account.setCurrentBalance(account.getCurrentBalance().subtract(soTien));
        } else {
            account.setCurrentBalance(account.getCurrentBalance().add(soTien));
        }
        account.setUpdatedAt(OffsetDateTime.now());
    }

    private String currentUsername() {
        try {
            return branchSecurity.currentUser().getUsername();
        } catch (Exception e) {
            return "system";
        }
    }

    // ── Request DTO ──

    public record BankTransactionRequest(
            Long bankAccountId,
            LocalDate ngayGiaoDich, // Maps to ngayHachToan / ngayChungTu
            Long doiTuongId,
            String loaiDoiTuong,
            String tenDoiTuong,
            String diaChi,
            String lyDo,
            Long nhanVienId,
            String soThamChieuNH, // optional
            String nganHangDoiUng, // optional
            String soTkDoiUng, // optional
            String tenChuTkDoiUng, // optional
            BigDecimal tongTien,
            Long branchId,
            java.util.List<BankTransactionItemRequest> items
    ) {}

    public record BankTransactionItemRequest(
            String dienGiai,
            String tkNo,
            String tkCo,
            BigDecimal soTien,
            Long doiTuongId,
            String loaiDoiTuong,
            String tenDoiTuong
    ) {}
}

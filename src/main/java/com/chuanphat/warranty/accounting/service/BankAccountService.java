package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.entity.BankAccount;
import com.chuanphat.warranty.accounting.repository.BankAccountRepository;
import com.chuanphat.warranty.accounting.repository.BankTransactionRepository;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BankAccountService {

    private final BankAccountRepository bankAccountRepository;
    private final BankTransactionRepository bankTransactionRepository;
    private final BranchSecurity branchSecurity;

    public BankAccountService(
            BankAccountRepository bankAccountRepository,
            BankTransactionRepository bankTransactionRepository,
            BranchSecurity branchSecurity
    ) {
        this.bankAccountRepository = bankAccountRepository;
        this.bankTransactionRepository = bankTransactionRepository;
        this.branchSecurity = branchSecurity;
    }

    // ── List ──

    public List<BankAccount> listAll(boolean includeInactive) {
        if (includeInactive) {
            return bankAccountRepository.findAll();
        }
        return bankAccountRepository.findAllByActiveTrueOrderByMaTaiKhoan();
    }

    // ── Get one ──

    public BankAccount getById(Long id) {
        return bankAccountRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Bank account not found: " + id));
    }

    // ── Create ──

    @Transactional
    public BankAccount create(BankAccountCreateRequest request) {
        bankAccountRepository.findByAccountNumber(request.accountNumber())
                .ifPresent(a -> { throw new BusinessException("Account number already exists: " + request.accountNumber()); });

        String maTaiKhoan = generateMaTaiKhoan();

        BankAccount account = new BankAccount();
        account.setMaTaiKhoan(maTaiKhoan);
        account.setBankName(request.bankName());
        account.setMaNganHang(request.maNganHang());
        account.setChiNhanhNganHang(request.chiNhanhNganHang());
        account.setAccountNumber(request.accountNumber());
        account.setAccountHolder(request.accountHolder());
        if (request.currency() != null) account.setCurrency(request.currency());
        if (request.accountingCode() != null) account.setAccountingCode(request.accountingCode());
        account.setOpeningBalance(request.openingBalance() != null ? request.openingBalance() : BigDecimal.ZERO);
        account.setCurrentBalance(account.getOpeningBalance());
        account.setOpeningBalanceDate(request.openingBalanceDate());
        account.setSpendingLimit(request.spendingLimit());
        account.setGhiChu(request.ghiChu());
        account.setDefault(Boolean.TRUE.equals(request.isDefault()));
        account.setBranchId(request.branchId());
        account.setCreatedBy(currentUsername());

        return bankAccountRepository.save(account);
    }

    // ── Update ──

    @Transactional
    public BankAccount update(Long id, BankAccountUpdateRequest request) {
        BankAccount account = getById(id);

        if (request.bankName() != null) account.setBankName(request.bankName());
        if (request.maNganHang() != null) account.setMaNganHang(request.maNganHang());
        if (request.chiNhanhNganHang() != null) account.setChiNhanhNganHang(request.chiNhanhNganHang());
        if (request.accountHolder() != null) account.setAccountHolder(request.accountHolder());
        if (request.currency() != null) account.setCurrency(request.currency());
        if (request.accountingCode() != null) account.setAccountingCode(request.accountingCode());
        if (request.spendingLimit() != null) account.setSpendingLimit(request.spendingLimit());
        if (request.ghiChu() != null) account.setGhiChu(request.ghiChu());
        if (request.isDefault() != null) account.setDefault(request.isDefault());
        if (request.branchId() != null) account.setBranchId(request.branchId());
        account.setUpdatedAt(OffsetDateTime.now());

        return bankAccountRepository.save(account);
    }

    // ── Deactivate ──

    @Transactional
    public void deactivate(Long id) {
        BankAccount account = getById(id);
        account.setActive(false);
        account.setUpdatedAt(OffsetDateTime.now());
        bankAccountRepository.save(account);
    }

    // ── Balance Summary ──

    @Transactional(readOnly = true)
    public Map<String, Object> getSummary(Long accountId, LocalDate fromDate, LocalDate toDate) {
        BankAccount account = getById(accountId);

        BigDecimal tongThu = bankTransactionRepository
                .sumByAccountAndTypeAndDateRange(accountId, "RECEIPT", fromDate, toDate);
        BigDecimal tongChi = bankTransactionRepository
                .sumByAccountAndTypeAndDateRange(accountId, "PAYMENT", fromDate, toDate);

        tongThu = tongThu != null ? tongThu : BigDecimal.ZERO;
        tongChi = tongChi != null ? tongChi : BigDecimal.ZERO;

        // soDuDauKy = currentBalance - (tongThu - tongChi) within period
        BigDecimal soDuCuoiKy = account.getCurrentBalance();
        BigDecimal soDuDauKy = soDuCuoiKy.subtract(tongThu).add(tongChi);

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("accountId", accountId);
        result.put("maTaiKhoan", account.getMaTaiKhoan() != null ? account.getMaTaiKhoan() : "");
        result.put("bankName", account.getBankName());
        result.put("accountNumber", account.getAccountNumber());
        result.put("currency", account.getCurrency() != null ? account.getCurrency() : "VND");
        result.put("fromDate", fromDate);
        result.put("toDate", toDate);
        result.put("soDuDauKy", soDuDauKy);
        result.put("tongThu", tongThu);
        result.put("tongChi", tongChi);
        result.put("soDuCuoiKy", soDuCuoiKy);
        return result;
    }

    // ── Private helpers ──

    private String generateMaTaiKhoan() {
        long count = bankAccountRepository.count();
        String candidate;
        int attempt = (int) count + 1;
        do {
            candidate = String.format("TK-%04d", attempt++);
        } while (bankAccountRepository.existsByMaTaiKhoan(candidate));
        return candidate;
    }

    private String currentUsername() {
        try {
            return branchSecurity.currentUser().getUsername();
        } catch (Exception e) {
            return "system";
        }
    }

    // ── Embedded request records ──

    public record BankAccountCreateRequest(
            String bankName,
            String maNganHang,
            String chiNhanhNganHang,
            String accountNumber,
            String accountHolder,
            String currency,
            String accountingCode,
            BigDecimal openingBalance,
            LocalDate openingBalanceDate,
            BigDecimal spendingLimit,
            String ghiChu,
            Boolean isDefault,
            Long branchId
    ) {}

    public record BankAccountUpdateRequest(
            String bankName,
            String maNganHang,
            String chiNhanhNganHang,
            String accountHolder,
            String currency,
            String accountingCode,
            BigDecimal spendingLimit,
            String ghiChu,
            Boolean isDefault,
            Long branchId
    ) {}
}

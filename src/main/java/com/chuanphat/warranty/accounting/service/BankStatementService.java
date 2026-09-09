package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.entity.BankAccount;
import com.chuanphat.warranty.accounting.entity.BankStatement;
import com.chuanphat.warranty.accounting.entity.BankStatementLine;
import com.chuanphat.warranty.accounting.entity.BankTransaction;
import com.chuanphat.warranty.accounting.repository.BankAccountRepository;
import com.chuanphat.warranty.accounting.repository.BankStatementLineRepository;
import com.chuanphat.warranty.accounting.repository.BankStatementRepository;
import com.chuanphat.warranty.accounting.repository.BankTransactionRepository;
import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BankStatementService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final BankStatementRepository statementRepository;
    private final BankStatementLineRepository lineRepository;
    private final BankTransactionRepository transactionRepository;
    private final BankAccountRepository bankAccountRepository;
    private final BankTransactionService transactionService;
    private final BranchSecurity branchSecurity;

    public BankStatementService(
            BankStatementRepository statementRepository,
            BankStatementLineRepository lineRepository,
            BankTransactionRepository transactionRepository,
            BankAccountRepository bankAccountRepository,
            BankTransactionService transactionService,
            BranchSecurity branchSecurity
    ) {
        this.statementRepository = statementRepository;
        this.lineRepository = lineRepository;
        this.transactionRepository = transactionRepository;
        this.bankAccountRepository = bankAccountRepository;
        this.transactionService = transactionService;
        this.branchSecurity = branchSecurity;
    }

    // ── Import ──

    /**
     * Saves the already-parsed statement lines into the database.
     * Parsing from CSV/Excel is handled in BankDepositController.
     */
    @Transactional
    public BankStatement importStatement(ImportStatementRequest request) {
        BankAccount account = bankAccountRepository.findById(request.bankAccountId())
                .orElseThrow(() -> new NotFoundException("Bank account not found: " + request.bankAccountId()));

        BankStatement statement = new BankStatement();
        statement.setBankAccount(account);
        statement.setNganHang(request.nganHang());
        statement.setTenFile(request.tenFile());
        statement.setTuNgay(request.tuNgay());
        statement.setDenNgay(request.denNgay());
        statement.setSoDuDauSaoKe(request.soDuDauSaoKe());
        statement.setSoDuCuoiSaoKe(request.soDuCuoiSaoKe());
        statement.setImportedBy(currentUsername());

        List<BankStatementLine> lines = new ArrayList<>();
        for (ParsedStatementLine parsed : request.lines()) {
            BankStatementLine line = new BankStatementLine();
            line.setStatement(statement);
            line.setNgayGiaoDich(parsed.ngayGiaoDich());
            line.setSoThamChieu(parsed.soThamChieu());
            line.setMoTa(parsed.moTa());
            line.setSoTienThu(parsed.soTienThu() != null ? parsed.soTienThu() : BigDecimal.ZERO);
            line.setSoTienChi(parsed.soTienChi() != null ? parsed.soTienChi() : BigDecimal.ZERO);
            line.setSoDuSau(parsed.soDuSau());
            lines.add(line);
        }
        statement.getLines().addAll(lines);
        statement.setTongSoDong(lines.size());
        statement.setTrangThai("PROCESSING");

        BankStatement saved = statementRepository.save(statement);

        // Run auto-matching immediately after import
        int matched = runAutoMatch(saved.getId());
        saved.setSoDongDaDoiChieu(matched);
        saved.setTrangThai("COMPLETED");
        statementRepository.save(saved);

        return saved;
    }

    // ── Auto-match ──

    @Transactional
    public int runAutoMatch(Long statementId) {
        BankStatement statement = statementRepository.findById(statementId)
                .orElseThrow(() -> new NotFoundException("Statement not found: " + statementId));
        Long accountId = statement.getBankAccount().getId();

        List<BankStatementLine> unmatchedLines =
                lineRepository.findByStatementIdAndTrangThaiDoiChieu(statementId, "UNMATCHED");

        int matchedCount = 0;
        for (BankStatementLine line : unmatchedLines) {
            boolean isReceipt = line.getSoTienThu().compareTo(BigDecimal.ZERO) > 0;
            BigDecimal amount = isReceipt ? line.getSoTienThu() : line.getSoTienChi();
            String expectedType = isReceipt ? "RECEIPT" : "PAYMENT";

            LocalDate from = line.getNgayGiaoDich().minusDays(2);
            LocalDate to = line.getNgayGiaoDich().plusDays(2);

            List<BankTransaction> candidates = transactionRepository
                    .findUnmatchedByAccountAndDateRangeAndAmount(accountId, from, to, amount)
                    .stream()
                    .filter(tx -> expectedType.equals(tx.getLoaiGiaoDich()))
                    .toList();

            if (candidates.size() == 1) {
                BankTransaction tx = candidates.get(0);
                // Match both sides
                line.setTrangThaiDoiChieu("MATCHED");
                line.setBankTransactionId(tx.getId());
                lineRepository.save(line);

                tx.setTrangThaiDoiChieu("MATCHED");
                tx.setBankStatementLineId(line.getId());
                tx.setUpdatedAt(OffsetDateTime.now());
                transactionRepository.save(tx);

                matchedCount++;
            }
            // If multiple candidates → skip (NEEDS_REVIEW stays as UNMATCHED for now)
        }

        // Update counter on statement
        long totalMatched = lineRepository.countByStatementIdAndTrangThaiDoiChieu(statementId, "MATCHED");
        statement.setSoDongDaDoiChieu((int) totalMatched);
        statementRepository.save(statement);

        return matchedCount;
    }

    // ── Manual match ──

    @Transactional
    public void manualMatch(Long statementId, Long lineId, Long transactionId) {
        BankStatementLine line = lineRepository.findById(lineId)
                .orElseThrow(() -> new NotFoundException("Statement line not found: " + lineId));
        if (!line.getStatement().getId().equals(statementId)) {
            throw new BusinessException("Line does not belong to statement " + statementId);
        }

        BankTransaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found: " + transactionId));

        line.setTrangThaiDoiChieu("MATCHED");
        line.setBankTransactionId(tx.getId());
        lineRepository.save(line);

        tx.setTrangThaiDoiChieu("MATCHED");
        tx.setBankStatementLineId(line.getId());
        tx.setUpdatedAt(OffsetDateTime.now());
        transactionRepository.save(tx);

        // Refresh counter
        BankStatement statement = line.getStatement();
        long totalMatched = lineRepository.countByStatementIdAndTrangThaiDoiChieu(statementId, "MATCHED");
        statement.setSoDongDaDoiChieu((int) totalMatched);
        statementRepository.save(statement);
    }

    // ── Create transaction from line ──

    @Transactional
    public BankTransaction createTransactionFromLine(Long statementId, Long lineId, String loaiThuChi) {
        BankStatementLine line = lineRepository.findById(lineId)
                .orElseThrow(() -> new NotFoundException("Statement line not found: " + lineId));
        if (!line.getStatement().getId().equals(statementId)) {
            throw new BusinessException("Line does not belong to statement " + statementId);
        }
        if ("MATCHED".equals(line.getTrangThaiDoiChieu())) {
            throw new BusinessException("Line is already matched");
        }
        if ("IGNORED".equals(line.getTrangThaiDoiChieu())) {
            throw new BusinessException("Line is ignored");
        }

        boolean isReceipt = line.getSoTienThu().compareTo(BigDecimal.ZERO) > 0;
        BigDecimal amount = isReceipt ? line.getSoTienThu() : line.getSoTienChi();
        String loaiGiaoDich = isReceipt ? "RECEIPT" : "PAYMENT";
        Long accountId = line.getStatement().getBankAccount().getId();

        String[] codes = isReceipt ? new String[]{"1121", "131"} : new String[]{"331", "1121"};
        if (loaiThuChi != null) {
            if ("RECEIPT".equals(loaiGiaoDich)) {
                codes = switch (loaiThuChi) {
                    case "SALE", "DEBT" -> new String[]{"1121", "131"};
                    default             -> new String[]{"1121", "711"};
                };
            } else {
                codes = switch (loaiThuChi) {
                    case "PURCHASE"  -> new String[]{"331", "1121"};
                    case "SALARY"    -> new String[]{"334", "1121"};
                    case "OPERATING" -> new String[]{"642", "1121"};
                    default          -> new String[]{"811", "1121"};
                };
            }
        }

        BankTransactionService.BankTransactionRequest request = new BankTransactionService.BankTransactionRequest(
                accountId,
                line.getNgayGiaoDich(),
                null,
                null,
                null,
                null,
                line.getMoTa(),
                null,
                line.getSoThamChieu(),
                null,
                null,
                null,
                amount,
                null,
                java.util.Collections.singletonList(new BankTransactionService.BankTransactionItemRequest(
                        line.getMoTa(),
                        codes[0],
                        codes[1],
                        amount,
                        null,
                        null,
                        null
                ))
        );

        BankTransaction tx = transactionService.createTransaction(loaiGiaoDich, request);

        // Link line ↔ tx and confirm right away
        line.setTrangThaiDoiChieu("MATCHED");
        line.setBankTransactionId(tx.getId());
        lineRepository.save(line);

        tx.setTrangThaiDoiChieu("MATCHED");
        tx.setBankStatementLineId(line.getId());
        tx.setTrangThai("CONFIRMED");
        tx.setUpdatedAt(OffsetDateTime.now());
        transactionRepository.save(tx);

        // Refresh statement counter
        BankStatement statement = line.getStatement();
        long totalMatched = lineRepository.countByStatementIdAndTrangThaiDoiChieu(statementId, "MATCHED");
        statement.setSoDongDaDoiChieu((int) totalMatched);
        statementRepository.save(statement);

        return tx;
    }

    // ── Ignore line ──

    @Transactional
    public void ignoreLine(Long statementId, Long lineId) {
        BankStatementLine line = lineRepository.findById(lineId)
                .orElseThrow(() -> new NotFoundException("Statement line not found: " + lineId));
        if (!line.getStatement().getId().equals(statementId)) {
            throw new BusinessException("Line does not belong to statement " + statementId);
        }
        line.setTrangThaiDoiChieu("IGNORED");
        lineRepository.save(line);
    }

    // ── Lines page ──

    @Transactional(readOnly = true)
    public PageResponse<BankStatementLine> listLines(Long statementId, String trangThaiDoiChieu, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (trangThaiDoiChieu != null) {
            return PageResponse.from(
                    lineRepository.findByStatementIdAndTrangThaiDoiChieu(statementId, trangThaiDoiChieu, pageable));
        }
        return PageResponse.from(lineRepository.findByStatementId(statementId, pageable));
    }

    // ── Reconciliation report ──

    @Transactional(readOnly = true)
    public Map<String, Object> reconciliationReport(Long statementId) {
        BankStatement statement = statementRepository.findById(statementId)
                .orElseThrow(() -> new NotFoundException("Statement not found: " + statementId));

        BankAccount account = statement.getBankAccount();
        BigDecimal soDuHeThong = account.getCurrentBalance();
        BigDecimal soDuSaoKe = statement.getSoDuCuoiSaoKe() != null
                ? statement.getSoDuCuoiSaoKe()
                : BigDecimal.ZERO;
        BigDecimal chenhLech = soDuSaoKe.subtract(soDuHeThong);

        long soUnmatched = lineRepository.countByStatementIdAndTrangThaiDoiChieu(statementId, "UNMATCHED");
        long soMatched = lineRepository.countByStatementIdAndTrangThaiDoiChieu(statementId, "MATCHED");
        long soIgnored = lineRepository.countByStatementIdAndTrangThaiDoiChieu(statementId, "IGNORED");

        String trangThai = chenhLech.compareTo(BigDecimal.ZERO) == 0 ? "BALANCED" : "DISCREPANCY";

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("statementId", statementId);
        result.put("nganHang", statement.getNganHang() != null ? statement.getNganHang() : "");
        result.put("tenFile", statement.getTenFile() != null ? statement.getTenFile() : "");
        result.put("tuNgay", statement.getTuNgay());
        result.put("denNgay", statement.getDenNgay());
        result.put("soDuDauSaoKe", statement.getSoDuDauSaoKe() != null ? statement.getSoDuDauSaoKe() : BigDecimal.ZERO);
        result.put("soDuSaoKe", soDuSaoKe);
        result.put("soDuHeThong", soDuHeThong);
        result.put("chenhLech", chenhLech);
        result.put("tongSoDong", statement.getTongSoDong());
        result.put("soMatched", soMatched);
        result.put("soUnmatched", soUnmatched);
        result.put("soIgnored", soIgnored);
        result.put("trangThai", trangThai);
        return result;
    }

    // ── Private ──

    private String currentUsername() {
        try {
            return branchSecurity.currentUser().getUsername();
        } catch (Exception e) {
            return "system";
        }
    }

    // ── Request / Parsed DTOs ──

    public record ImportStatementRequest(
            Long bankAccountId,
            String nganHang,
            String tenFile,
            LocalDate tuNgay,
            LocalDate denNgay,
            BigDecimal soDuDauSaoKe,
            BigDecimal soDuCuoiSaoKe,
            List<ParsedStatementLine> lines
    ) {}

    public record ParsedStatementLine(
            LocalDate ngayGiaoDich,
            String soThamChieu,
            String moTa,
            BigDecimal soTienThu,
            BigDecimal soTienChi,
            BigDecimal soDuSau
    ) {}
}

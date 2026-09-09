package com.chuanphat.warranty.accounting.controller;

import com.chuanphat.warranty.accounting.entity.BankAccount;
import com.chuanphat.warranty.accounting.entity.BankStatement;
import com.chuanphat.warranty.accounting.entity.BankStatementLine;
import com.chuanphat.warranty.accounting.entity.BankTransaction;
import com.chuanphat.warranty.accounting.service.BankAccountService;
import com.chuanphat.warranty.accounting.service.BankAccountService.BankAccountCreateRequest;
import com.chuanphat.warranty.accounting.service.BankAccountService.BankAccountUpdateRequest;
import com.chuanphat.warranty.accounting.service.BankStatementService;
import com.chuanphat.warranty.accounting.service.BankStatementService.ImportStatementRequest;
import com.chuanphat.warranty.accounting.service.BankStatementService.ParsedStatementLine;
import com.chuanphat.warranty.accounting.service.BankTransactionService;
import com.chuanphat.warranty.accounting.service.BankTransactionService.BankTransactionRequest;
import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.exception.BusinessException;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/bank-deposit")
@PreAuthorize("hasAnyRole('ADMIN')")
public class BankDepositController {

    private static final DateTimeFormatter VCB_DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter ALT_DATE_FMT = DateTimeFormatter.ofPattern("dd-MM-yyyy");

    private final BankAccountService bankAccountService;
    private final BankTransactionService transactionService;
    private final BankStatementService statementService;

    public BankDepositController(
            BankAccountService bankAccountService,
            BankTransactionService transactionService,
            BankStatementService statementService
    ) {
        this.bankAccountService = bankAccountService;
        this.transactionService = transactionService;
        this.statementService = statementService;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Bank Accounts
    // ═══════════════════════════════════════════════════════════════════════

    @GetMapping("/accounts")
    public List<BankAccount> getAccounts(
            @RequestParam(defaultValue = "false") boolean includeInactive) {
        return bankAccountService.listAll(includeInactive);
    }

    @GetMapping("/accounts/{id}")
    public BankAccount getAccount(@PathVariable Long id) {
        return bankAccountService.getById(id);
    }

    @PostMapping("/accounts")
    @ResponseStatus(HttpStatus.CREATED)
    public BankAccount createAccount(@RequestBody BankAccountCreateRequest request) {
        return bankAccountService.create(request);
    }

    @PutMapping("/accounts/{id}")
    public BankAccount updateAccount(
            @PathVariable Long id,
            @RequestBody BankAccountUpdateRequest request) {
        return bankAccountService.update(id, request);
    }

    @DeleteMapping("/accounts/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivateAccount(@PathVariable Long id) {
        bankAccountService.deactivate(id);
    }

    @GetMapping("/accounts/{id}/summary")
    public Map<String, Object> getAccountSummary(
            @PathVariable Long id,
            @RequestParam LocalDate fromDate,
            @RequestParam LocalDate toDate) {
        return bankAccountService.getSummary(id, fromDate, toDate);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Transactions
    // ═══════════════════════════════════════════════════════════════════════

    @GetMapping("/transactions")
    public PageResponse<BankTransaction> getTransactions(
            @RequestParam(required = false) Long bankAccountId,
            @RequestParam(required = false) String loaiGiaoDich,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return transactionService.list(bankAccountId, loaiGiaoDich, fromDate, toDate, page, size);
    }

    @GetMapping("/transactions/{id}")
    public BankTransaction getTransaction(@PathVariable Long id) {
        return transactionService.getById(id);
    }

    @PostMapping("/receipts")
    @ResponseStatus(HttpStatus.CREATED)
    public BankTransaction createReceipt(@RequestBody BankTransactionRequest request) {
        return transactionService.createReceipt(request);
    }

    @PostMapping("/payments")
    @ResponseStatus(HttpStatus.CREATED)
    public BankTransaction createPayment(@RequestBody BankTransactionRequest request) {
        return transactionService.createPayment(request);
    }

    @PutMapping("/transactions/{id}")
    public BankTransaction updateTransaction(
            @PathVariable Long id,
            @RequestBody BankTransactionRequest request) {
        return transactionService.update(id, request);
    }

    @PostMapping("/transactions/{id}/post")
    public BankTransaction confirmTransaction(@PathVariable Long id) {
        return transactionService.confirm(id);
    }

    @PostMapping("/transactions/{id}/cancel")
    public BankTransaction cancelTransaction(@PathVariable Long id) {
        return transactionService.cancel(id);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Statements
    // ═══════════════════════════════════════════════════════════════════════

    @PostMapping("/statements/import")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> importStatement(
            @RequestParam("file") MultipartFile file,
            @RequestParam Long bankAccountId,
            @RequestParam(defaultValue = "VCB") String nganHang) {

        if (file.isEmpty()) {
            throw new BusinessException("Uploaded file is empty");
        }

        List<ParsedStatementLine> lines = parseFile(file, nganHang);

        if (lines.isEmpty()) {
            throw new BusinessException("No transaction rows found in the uploaded file");
        }

        LocalDate minDate = lines.stream()
                .map(ParsedStatementLine::ngayGiaoDich)
                .min(LocalDate::compareTo)
                .orElse(LocalDate.now());
        LocalDate maxDate = lines.stream()
                .map(ParsedStatementLine::ngayGiaoDich)
                .max(LocalDate::compareTo)
                .orElse(LocalDate.now());

        ImportStatementRequest request = new ImportStatementRequest(
                bankAccountId,
                nganHang,
                file.getOriginalFilename(),
                minDate,
                maxDate,
                null,
                null,
                lines
        );

        BankStatement saved = statementService.importStatement(request);

        long soCanXemLai = saved.getTongSoDong() - saved.getSoDongDaDoiChieu();

        return Map.of(
                "statementId", saved.getId(),
                "tongSoDong", saved.getTongSoDong(),
                "soDoiChieuDuoc", saved.getSoDongDaDoiChieu(),
                "soCanXemLai", soCanXemLai
        );
    }

    @GetMapping("/statements/{id}/lines")
    public PageResponse<BankStatementLine> getStatementLines(
            @PathVariable Long id,
            @RequestParam(required = false) String trangThaiDoiChieu,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return statementService.listLines(id, trangThaiDoiChieu, page, size);
    }

    @PostMapping("/statements/{id}/auto-match")
    public Map<String, Object> autoMatch(@PathVariable Long id) {
        int matched = statementService.runAutoMatch(id);
        return Map.of("statementId", id, "matched", matched);
    }

    @PostMapping("/statements/{id}/lines/{lineId}/manual-match")
    public Map<String, Object> manualMatch(
            @PathVariable Long id,
            @PathVariable Long lineId,
            @RequestBody Map<String, Long> body) {
        Long transactionId = body.get("transactionId");
        if (transactionId == null) {
            throw new BusinessException("transactionId is required");
        }
        statementService.manualMatch(id, lineId, transactionId);
        return Map.of("success", true, "message", "Đã đối chiếu thành công");
    }

    @PostMapping("/statements/{id}/lines/{lineId}/create-transaction")
    @ResponseStatus(HttpStatus.CREATED)
    public BankTransaction createTransactionFromLine(
            @PathVariable Long id,
            @PathVariable Long lineId,
            @RequestBody(required = false) Map<String, String> body) {
        String loaiThuChi = body != null ? body.get("loaiThuChi") : null;
        return statementService.createTransactionFromLine(id, lineId, loaiThuChi);
    }

    @PostMapping("/statements/{id}/lines/{lineId}/ignore")
    public Map<String, Object> ignoreLine(
            @PathVariable Long id,
            @PathVariable Long lineId) {
        statementService.ignoreLine(id, lineId);
        return Map.of("success", true, "message", "Đã bỏ qua dòng này");
    }

    @GetMapping("/statements/{id}/reconciliation-report")
    public Map<String, Object> reconciliationReport(@PathVariable Long id) {
        return statementService.reconciliationReport(id);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Legacy reconciliation endpoint (keep for existing frontend)
    // ═══════════════════════════════════════════════════════════════════════

    @PostMapping("/reconciliations/{id}/match")
    public Map<String, Object> matchReconciliation(
            @PathVariable String id,
            @RequestBody Map<String, Object> data) {
        return Map.of("success", true, "message", "Đã đối chiếu thành công");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CSV/Excel Parsing
    // ═══════════════════════════════════════════════════════════════════════

    private List<ParsedStatementLine> parseFile(MultipartFile file, String nganHang) {
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        if (filename.endsWith(".csv")) {
            return parseCsv(file, nganHang);
        }
        // For Excel formats, fall back to CSV-style parsing (caller must export as CSV)
        // A full Excel parser would require Apache POI dependency
        return parseCsv(file, nganHang);
    }

    /**
     * Parses a bank statement CSV file.
     * Dispatches to the correct format handler based on nganHang.
     */
    private List<ParsedStatementLine> parseCsv(MultipartFile file, String nganHang) {
        return switch (nganHang.toUpperCase()) {
            case "MB" -> parseMbCsv(file);
            case "TCB" -> parseTcbCsv(file);
            default -> parseVcbCsv(file);
        };
    }

    // ── VCB ──

    /**
     * VCB CSV format:
     * Skips rows until a header row containing "Ngay GD" or "Ngày GD".
     * Data columns: Ngày GD | Số tham chiếu | Mô tả | Phát sinh | Số dư
     * Positive "Phát sinh" → thu (RECEIPT), Negative → chi (PAYMENT).
     */
    private List<ParsedStatementLine> parseVcbCsv(MultipartFile file) {
        List<ParsedStatementLine> result = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            boolean headerFound = false;
            while ((line = reader.readLine()) != null) {
                String normalized = removeBom(line).trim();
                if (!headerFound) {
                    String lower = normalized.toLowerCase();
                    if (lower.contains("ngay gd") || lower.contains("ngày gd")
                            || lower.contains("ngày giao dịch")) {
                        headerFound = true;
                    }
                    continue;
                }

                if (normalized.isBlank()) continue;

                String[] cols = splitCsvLine(normalized);
                if (cols.length < 4) continue;

                LocalDate date = parseDate(cols[0].trim());
                if (date == null) continue;

                String soThamChieu = cols.length > 1 ? cols[1].trim() : "";
                String moTa = cols.length > 2 ? cols[2].trim() : "";
                BigDecimal phatSinh = parseMoney(cols.length > 3 ? cols[3].trim() : "");
                BigDecimal soDuSau = parseMoney(cols.length > 4 ? cols[4].trim() : "");

                BigDecimal soTienThu = BigDecimal.ZERO;
                BigDecimal soTienChi = BigDecimal.ZERO;
                if (phatSinh.compareTo(BigDecimal.ZERO) >= 0) {
                    soTienThu = phatSinh;
                } else {
                    soTienChi = phatSinh.abs();
                }

                result.add(new ParsedStatementLine(date, soThamChieu, moTa, soTienThu, soTienChi, soDuSau));
            }
        } catch (Exception e) {
            throw new BusinessException("Failed to parse VCB statement: " + e.getMessage());
        }
        return result;
    }

    // ── TCB ──

    /**
     * TCB CSV/Excel (exported as CSV) format:
     * Data starts at row 6 (0-indexed row 5 in the file after skipping header rows).
     * Columns: Date | RefNo | Description | MoneyIn | MoneyOut | Balance
     */
    private List<ParsedStatementLine> parseTcbCsv(MultipartFile file) {
        List<ParsedStatementLine> result = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            int rowIndex = 0;
            while ((line = reader.readLine()) != null) {
                rowIndex++;
                if (rowIndex < 6) continue; // skip first 5 rows

                String normalized = removeBom(line).trim();
                if (normalized.isBlank()) continue;

                String[] cols = splitCsvLine(normalized);
                if (cols.length < 5) continue;

                LocalDate date = parseDate(cols[0].trim());
                if (date == null) continue;

                String soThamChieu = cols.length > 1 ? cols[1].trim() : "";
                String moTa = cols.length > 2 ? cols[2].trim() : "";
                BigDecimal soTienThu = parseMoney(cols.length > 3 ? cols[3].trim() : "");
                BigDecimal soTienChi = parseMoney(cols.length > 4 ? cols[4].trim() : "");
                BigDecimal soDuSau = parseMoney(cols.length > 5 ? cols[5].trim() : "");

                result.add(new ParsedStatementLine(date, soThamChieu, moTa, soTienThu, soTienChi, soDuSau));
            }
        } catch (Exception e) {
            throw new BusinessException("Failed to parse TCB statement: " + e.getMessage());
        }
        return result;
    }

    // ── MB ──

    /**
     * MB CSV format:
     * Columns: Date | Amount | Type (Có / Nợ) | Description | Balance
     * "Có" → thu (RECEIPT), "Nợ" → chi (PAYMENT)
     */
    private List<ParsedStatementLine> parseMbCsv(MultipartFile file) {
        List<ParsedStatementLine> result = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            boolean headerFound = false;
            while ((line = reader.readLine()) != null) {
                String normalized = removeBom(line).trim();
                if (!headerFound) {
                    String lower = normalized.toLowerCase();
                    // MB header contains Date and Amount keywords
                    if (lower.contains("date") || lower.contains("ngày") || lower.contains("ngay")) {
                        headerFound = true;
                    }
                    continue;
                }

                if (normalized.isBlank()) continue;

                String[] cols = splitCsvLine(normalized);
                if (cols.length < 3) continue;

                LocalDate date = parseDate(cols[0].trim());
                if (date == null) continue;

                BigDecimal amount = parseMoney(cols[1].trim());
                String type = cols.length > 2 ? cols[2].trim() : "";
                String moTa = cols.length > 3 ? cols[3].trim() : "";
                BigDecimal soDuSau = parseMoney(cols.length > 4 ? cols[4].trim() : "");

                BigDecimal soTienThu = BigDecimal.ZERO;
                BigDecimal soTienChi = BigDecimal.ZERO;

                if (type.equalsIgnoreCase("Có") || type.equalsIgnoreCase("Co")
                        || type.equalsIgnoreCase("CR") || type.equalsIgnoreCase("+")) {
                    soTienThu = amount.abs();
                } else {
                    soTienChi = amount.abs();
                }

                result.add(new ParsedStatementLine(date, "", moTa, soTienThu, soTienChi, soDuSau));
            }
        } catch (Exception e) {
            throw new BusinessException("Failed to parse MB statement: " + e.getMessage());
        }
        return result;
    }

    // ── CSV utilities ──

    private String[] splitCsvLine(String line) {
        List<String> tokens = new ArrayList<>();
        boolean inQuote = false;
        StringBuilder current = new StringBuilder();
        for (char c : line.toCharArray()) {
            if (c == '"') {
                inQuote = !inQuote;
            } else if (c == ',' && !inQuote) {
                tokens.add(current.toString());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        tokens.add(current.toString());
        return tokens.toArray(new String[0]);
    }

    private LocalDate parseDate(String raw) {
        if (raw == null || raw.isBlank()) return null;
        String cleaned = raw.replaceAll("\"", "").trim();
        for (DateTimeFormatter fmt : List.of(VCB_DATE_FMT, ALT_DATE_FMT)) {
            try {
                return LocalDate.parse(cleaned, fmt);
            } catch (DateTimeParseException ignored) {
                // try next format
            }
        }
        return null;
    }

    private BigDecimal parseMoney(String raw) {
        if (raw == null || raw.isBlank()) return BigDecimal.ZERO;
        String cleaned = raw.replaceAll("\"", "")
                .replaceAll(",", "")
                .replaceAll("\\.", "")
                .replaceAll(" ", "")
                .trim();
        // Handle Vietnamese number format: dots as thousands separator, comma as decimal
        // After removing all commas and dots above, if the original had a decimal comma we lose it.
        // Re-parse with original for safety:
        try {
            String forParse = raw.replaceAll("\"", "").trim()
                    .replace(".", "")   // remove thousand separators (dots)
                    .replace(",", "."); // replace decimal comma with dot
            if (forParse.isBlank()) return BigDecimal.ZERO;
            return new BigDecimal(forParse);
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }

    private String removeBom(String line) {
        if (line != null && line.startsWith("\uFEFF")) {
            return line.substring(1);
        }
        return line;
    }
}


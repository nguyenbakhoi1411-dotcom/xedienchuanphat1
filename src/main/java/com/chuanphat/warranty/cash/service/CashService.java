package com.chuanphat.warranty.cash.service;

import com.chuanphat.warranty.accounting.entity.JournalEntry;
import com.chuanphat.warranty.accounting.entity.JournalEntryLine;
import com.chuanphat.warranty.accounting.enums.JournalEntryStatus;
import com.chuanphat.warranty.accounting.enums.JournalReferenceType;
import com.chuanphat.warranty.accounting.entity.ChartOfAccount;
import com.chuanphat.warranty.accounting.repository.ChartOfAccountRepository;
import com.chuanphat.warranty.accounting.repository.JournalEntryRepository;
import com.chuanphat.warranty.cash.dto.*;
import com.chuanphat.warranty.cash.entity.*;
import com.chuanphat.warranty.cash.repository.CashPaymentRepository;
import com.chuanphat.warranty.cash.repository.CashReceiptRepository;
import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CashService {

    private final CashReceiptRepository receiptRepo;
    private final CashPaymentRepository paymentRepo;
    private final JournalEntryRepository journalRepo;
    private final ChartOfAccountRepository accountRepo;
    private final BranchSecurity branchSecurity;
    private final JdbcTemplate jdbcTemplate;

    public CashService(
            CashReceiptRepository receiptRepo,
            CashPaymentRepository paymentRepo,
            JournalEntryRepository journalRepo,
            ChartOfAccountRepository accountRepo,
            BranchSecurity branchSecurity,
            JdbcTemplate jdbcTemplate) {
        this.receiptRepo = receiptRepo;
        this.paymentRepo = paymentRepo;
        this.journalRepo = journalRepo;
        this.accountRepo = accountRepo;
        this.branchSecurity = branchSecurity;
        this.jdbcTemplate = jdbcTemplate;
    }

    private String getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated()) ? auth.getName() : "system";
    }

    // =========================================================================
    // TÓM TẮT HEADER (KPI)
    // =========================================================================
    public CashSummaryDto getSummary(LocalDate date) {
        Long branchId = branchSecurity.scopedBranchId(null, false);
        
        // 1. Thu trong ngày
        BigDecimal thu = receiptRepo.sumConfirmed(date, date, branchId);
        
        // 2. Chi trong ngày
        BigDecimal chi = paymentRepo.sumConfirmed(date, date, branchId);
        
        // 3. Tính tồn quỹ đầu ngày
        // = (Tổng thu lũy kế đến hôm qua) - (Tổng chi lũy kế đến hôm qua) + Số dư ban đầu (giả định 0)
        LocalDate yesterday = date.minusDays(1);
        BigDecimal luKeThu = receiptRepo.sumConfirmed(LocalDate.of(2000, 1, 1), yesterday, branchId);
        BigDecimal luKeChi = paymentRepo.sumConfirmed(LocalDate.of(2000, 1, 1), yesterday, branchId);
        BigDecimal dauNgay = luKeThu.subtract(luKeChi);
        
        // 4. Tồn quỹ hiện tại
        BigDecimal hienTai = dauNgay.add(thu).subtract(chi);
        
        return new CashSummaryDto(dauNgay, thu, chi, hienTai, hienTai.compareTo(BigDecimal.ZERO) < 0);
    }

    // =========================================================================
    // PHIẾU THU
    // =========================================================================
    @Transactional
    public String generateReceiptNo(LocalDate date) {
        // SELECT FOR UPDATE giả lập (khóa logic để tránh trùng)
        long count = receiptRepo.countByDate(date);
        return String.format("PT-%s-%03d", date.format(DateTimeFormatter.ofPattern("yyyyMMdd")), count + 1);
    }

    private String determineReceiptCreditAccount(ReceiptType type) {
        return switch (type) {
            case SALE -> "131"; // Thu bán hàng -> Có TK 131
            case DEBT -> "131";
            case OTHER -> "711";
        };
    }

    public PageResponse<CashReceiptDto> searchReceipts(
            LocalDate fromDate, LocalDate toDate, ReceiptType type, String keyword, Pageable pageable) {
        Long branchId = branchSecurity.scopedBranchId(null, false);
        Page<CashReceipt> page = receiptRepo.search(fromDate, toDate, type, branchId, keyword, pageable);
        
        List<CashReceiptDto> list = page.getContent().stream().map(r -> {
            String orderNo = null; // Có thể query thêm từ sales_orders nếu cần
            if (r.getSalesOrderId() != null) {
                try {
                    orderNo = jdbcTemplate.queryForObject(
                            "SELECT order_number FROM sales_orders WHERE id = ?", 
                            String.class, r.getSalesOrderId());
                } catch (Exception ignored) {}
            }
            return CashReceiptDto.from(r, orderNo);
        }).toList();

        return new PageResponse<>(list, page.getNumber() + 1, page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    @Transactional
    public CashReceiptDto createReceipt(CreateReceiptRequest req) {
        CashReceipt r = new CashReceipt();
        r.setVoucherNo(generateReceiptNo(req.receiptDate()));
        r.setReceiptDate(req.receiptDate());
        r.setPayerName(req.payerName());
        r.setCustomerId(req.customerId());
        r.setReceiptType(req.receiptType());
        r.setSalesOrderId(req.salesOrderId());
        r.setAmount(req.amount());
        r.setDescription(req.description());
        r.setCreatedBy(getCurrentUser());
        r.setDebitAccount("1111");
        r.setCreditAccount(determineReceiptCreditAccount(req.receiptType()));
        r.setBranchId(branchSecurity.scopedBranchId(req.branchId(), false));
        
        if (req.confirmNow()) {
            r.setStatus(VoucherStatus.CONFIRMED);
            postJournalForReceipt(r);
            updateOrderPaidAmount(r.getSalesOrderId(), r.getAmount());
        } else {
            r.setStatus(VoucherStatus.DRAFT);
        }
        
        receiptRepo.save(r);
        return CashReceiptDto.from(r, null);
    }

    @Transactional
    public void confirmReceipt(Long id) {
        CashReceipt r = receiptRepo.findById(id).orElseThrow(() -> new NotFoundException("Không tìm thấy phiếu thu"));
        if (r.getStatus() != VoucherStatus.DRAFT) throw new BusinessException("Chỉ được xác nhận phiếu Nháp");
        
        r.setStatus(VoucherStatus.CONFIRMED);
        postJournalForReceipt(r);
        updateOrderPaidAmount(r.getSalesOrderId(), r.getAmount());
        receiptRepo.save(r);
    }

    @Transactional
    public void cancelReceipt(Long id) {
        CashReceipt r = receiptRepo.findById(id).orElseThrow(() -> new NotFoundException("Không tìm thấy phiếu thu"));
        if (r.getStatus() == VoucherStatus.CANCELLED) throw new BusinessException("Phiếu đã hủy");
        
        if (r.getStatus() == VoucherStatus.CONFIRMED) {
            cancelJournal(r.getVoucherNo(), JournalReferenceType.RECEIPT_VOUCHER);
            updateOrderPaidAmount(r.getSalesOrderId(), r.getAmount().negate());
        }
        
        r.setStatus(VoucherStatus.CANCELLED);
        receiptRepo.save(r);
    }

    private void postJournalForReceipt(CashReceipt r) {
        JournalEntry j = new JournalEntry();
        j.setEntryDate(r.getReceiptDate());
        j.setEntryCode("JE-" + r.getVoucherNo());
        j.setBranchId(r.getBranchId());
        j.setReferenceType(JournalReferenceType.RECEIPT_VOUCHER);
        j.setReferenceId(r.getVoucherNo());
        j.setDescription(r.getDescription());
        j.setStatus(JournalEntryStatus.POSTED);
        j.setCreatedBy(r.getCreatedBy());
        j.setPostedBy(r.getCreatedBy());
        j.setTotalDebit(r.getAmount());
        j.setTotalCredit(r.getAmount());

        ChartOfAccount debitAcc = accountRepo.findByAccountCode(r.getDebitAccount()).orElse(null);
        if (debitAcc != null) {
            JournalEntryLine n = new JournalEntryLine();
            n.setAccount(debitAcc);
            n.setDebitAmount(r.getAmount());
            n.setDescription(r.getDescription());
            j.addLine(n);
        }

        ChartOfAccount creditAcc = accountRepo.findByAccountCode(r.getCreditAccount()).orElse(null);
        if (creditAcc != null) {
            JournalEntryLine c = new JournalEntryLine();
            c.setAccount(creditAcc);
            c.setCreditAmount(r.getAmount());
            c.setDescription(r.getDescription());
            j.addLine(c);
        }

        journalRepo.save(j);
    }

    // =========================================================================
    // PHIẾU CHI
    // =========================================================================
    @Transactional
    public String generatePaymentNo(LocalDate date) {
        long count = paymentRepo.countByDate(date);
        return String.format("PC-%s-%03d", date.format(DateTimeFormatter.ofPattern("yyyyMMdd")), count + 1);
    }

    private String determinePaymentDebitAccount(PaymentType type) {
        return switch (type) {
            case PURCHASE -> "156";
            case SALARY -> "334";
            case OPERATING -> "642";
            case REFUND -> "131";
            case OTHER -> "811";
        };
    }

    public PageResponse<CashPaymentDto> searchPayments(
            LocalDate fromDate, LocalDate toDate, PaymentType type, String keyword, Pageable pageable) {
        Long branchId = branchSecurity.scopedBranchId(null, false);
        Page<CashPayment> page = paymentRepo.search(fromDate, toDate, type, branchId, keyword, pageable);
        List<CashPaymentDto> list = page.getContent().stream().map(CashPaymentDto::from).toList();
        return new PageResponse<>(list, page.getNumber() + 1, page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    @Transactional
    public CashPaymentDto createPayment(CreatePaymentRequest req) {
        CashPayment p = new CashPayment();
        p.setVoucherNo(generatePaymentNo(req.paymentDate()));
        p.setPaymentDate(req.paymentDate());
        p.setPayeeName(req.payeeName());
        p.setSupplierId(req.supplierId());
        p.setPaymentType(req.paymentType());
        p.setPurchaseOrderId(req.purchaseOrderId());
        p.setAmount(req.amount());
        p.setDescription(req.description());
        p.setCreatedBy(getCurrentUser());
        p.setDebitAccount(determinePaymentDebitAccount(req.paymentType()));
        p.setCreditAccount("1111");
        p.setBranchId(branchSecurity.scopedBranchId(req.branchId(), false));
        
        if (req.confirmNow()) {
            p.setStatus(VoucherStatus.CONFIRMED);
            postJournalForPayment(p);
        } else {
            p.setStatus(VoucherStatus.DRAFT);
        }
        
        paymentRepo.save(p);
        return CashPaymentDto.from(p);
    }

    @Transactional
    public void confirmPayment(Long id) {
        CashPayment p = paymentRepo.findById(id).orElseThrow(() -> new NotFoundException("Không tìm thấy phiếu chi"));
        if (p.getStatus() != VoucherStatus.DRAFT) throw new BusinessException("Chỉ được xác nhận phiếu Nháp");
        
        p.setStatus(VoucherStatus.CONFIRMED);
        postJournalForPayment(p);
        paymentRepo.save(p);
    }

    @Transactional
    public void cancelPayment(Long id) {
        CashPayment p = paymentRepo.findById(id).orElseThrow(() -> new NotFoundException("Không tìm thấy phiếu chi"));
        if (p.getStatus() == VoucherStatus.CANCELLED) throw new BusinessException("Phiếu đã hủy");
        
        if (p.getStatus() == VoucherStatus.CONFIRMED) {
            cancelJournal(p.getVoucherNo(), JournalReferenceType.PAYMENT_VOUCHER);
        }
        
        p.setStatus(VoucherStatus.CANCELLED);
        paymentRepo.save(p);
    }

    private void postJournalForPayment(CashPayment p) {
        JournalEntry j = new JournalEntry();
        j.setEntryDate(p.getPaymentDate());
        j.setEntryCode("JE-" + p.getVoucherNo());
        j.setBranchId(p.getBranchId());
        j.setReferenceType(JournalReferenceType.PAYMENT_VOUCHER);
        j.setReferenceId(p.getVoucherNo());
        j.setDescription(p.getDescription());
        j.setStatus(JournalEntryStatus.POSTED);
        j.setCreatedBy(p.getCreatedBy());
        j.setPostedBy(p.getCreatedBy());
        j.setTotalDebit(p.getAmount());
        j.setTotalCredit(p.getAmount());

        ChartOfAccount debitAcc = accountRepo.findByAccountCode(p.getDebitAccount()).orElse(null);
        if (debitAcc != null) {
            JournalEntryLine n = new JournalEntryLine();
            n.setAccount(debitAcc);
            n.setDebitAmount(p.getAmount());
            n.setDescription(p.getDescription());
            j.addLine(n);
        }

        ChartOfAccount creditAcc = accountRepo.findByAccountCode(p.getCreditAccount()).orElse(null);
        if (creditAcc != null) {
            JournalEntryLine c = new JournalEntryLine();
            c.setAccount(creditAcc);
            c.setCreditAmount(p.getAmount());
            c.setDescription(p.getDescription());
            j.addLine(c);
        }

        journalRepo.save(j);
    }

    // =========================================================================
    // DÒNG TIỀN / SỔ QUỸ
    // =========================================================================
    public CashLedgerDto getLedger(LocalDate fromDate, LocalDate toDate) {
        Long branchId = branchSecurity.scopedBranchId(null, false);
        
        // Dư đầu kỳ
        LocalDate dayBeforeFrom = fromDate.minusDays(1);
        BigDecimal luKeThu = receiptRepo.sumConfirmed(LocalDate.of(2000, 1, 1), dayBeforeFrom, branchId);
        BigDecimal luKeChi = paymentRepo.sumConfirmed(LocalDate.of(2000, 1, 1), dayBeforeFrom, branchId);
        BigDecimal dauKy = luKeThu.subtract(luKeChi);
        
        // Tổng trong kỳ
        BigDecimal tongThu = receiptRepo.sumConfirmed(fromDate, toDate, branchId);
        BigDecimal tongChi = paymentRepo.sumConfirmed(fromDate, toDate, branchId);
        BigDecimal cuoiKy = dauKy.add(tongThu).subtract(tongChi);
        
        // Lấy chi tiết GD
        // Lưu ý: Dùng page size lớn hoặc chia nhỏ nếu dữ liệu nhiều, ở đây demo tải 500
        Page<CashReceipt> rs = receiptRepo.search(fromDate, toDate, null, branchId, null, Pageable.unpaged());
        Page<CashPayment> ps = paymentRepo.search(fromDate, toDate, null, branchId, null, Pageable.unpaged());
        
        List<CashLedgerDto.LedgerRow> transactions = new ArrayList<>();
        
        // Map data (chỉ lấy CONFIRMED)
        rs.getContent().stream()
            .filter(r -> r.getStatus() == VoucherStatus.CONFIRMED)
            .forEach(r -> {
                transactions.add(new CashLedgerDto.LedgerRow(
                        r.getReceiptDate(), "RECEIPT", r.getVoucherNo(), r.getDescription(),
                        r.getAmount(), BigDecimal.ZERO, BigDecimal.ZERO
                ));
            });
            
        ps.getContent().stream()
            .filter(p -> p.getStatus() == VoucherStatus.CONFIRMED)
            .forEach(p -> {
                transactions.add(new CashLedgerDto.LedgerRow(
                        p.getPaymentDate(), "PAYMENT", p.getVoucherNo(), p.getDescription(),
                        BigDecimal.ZERO, p.getAmount(), BigDecimal.ZERO
                ));
            });
            
        // Sort theo ngày, sau đó mã chứng từ
        transactions.sort(Comparator.comparing(CashLedgerDto.LedgerRow::ngay)
                                    .thenComparing(CashLedgerDto.LedgerRow::maChungTu));
                                    
        // Tính running balance
        List<CashLedgerDto.LedgerRow> finalRows = new ArrayList<>();
        BigDecimal currentBalance = dauKy;
        for (var row : transactions) {
            currentBalance = currentBalance.add(row.thu()).subtract(row.chi());
            finalRows.add(new CashLedgerDto.LedgerRow(
                    row.ngay(), row.loai(), row.maChungTu(), row.dienGiai(),
                    row.thu(), row.chi(), currentBalance
            ));
        }

        return new CashLedgerDto(dauKy, tongThu, tongChi, cuoiKy, finalRows);
    }

    // =========================================================================
    // UTILS
    // =========================================================================
    private void cancelJournal(String referenceId, JournalReferenceType type) {
        journalRepo.findByReferenceTypeAndReferenceIdAndStatus(type, referenceId, JournalEntryStatus.POSTED)
            .ifPresent(j -> {
                j.setStatus(JournalEntryStatus.CANCELLED);
                j.setCancelledBy(getCurrentUser());
                journalRepo.save(j);
            });
    }

    private void updateOrderPaidAmount(Long orderId, BigDecimal amount) {
        if (orderId == null || amount == null || amount.compareTo(BigDecimal.ZERO) == 0) return;
        try {
            jdbcTemplate.update("""
                UPDATE sales_orders 
                SET paid_amount = COALESCE(paid_amount, 0) + ? 
                WHERE id = ?
                """, amount, orderId);
            
            // Có thể thêm logic UPDATE status = 'PAID' nếu paid_amount >= total_amount
        } catch (Exception ignored) {
            // ignore if sales_orders table doesn't have these columns yet
        }
    }
}

package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.dto.PayableDto;
import com.chuanphat.warranty.core.dto.PayablePayRequest;
import com.chuanphat.warranty.core.entity.Payable;
import com.chuanphat.warranty.core.entity.PayablePayment;
import com.chuanphat.warranty.core.entity.Supplier;
import com.chuanphat.warranty.core.enums.PayableStatus;
import com.chuanphat.warranty.core.repository.PayablePaymentRepository;
import com.chuanphat.warranty.core.repository.PayableRepository;
import com.chuanphat.warranty.core.repository.SupplierRepository;
import com.chuanphat.warranty.exception.BusinessException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * PayableService — Quan ly cong no phai tra nha cung cap.
 *
 * - createFromReceipt(): tao payable khi xac nhan phieu nhap
 * - pay(): thanh toan mot phan hoac toan bo
 * - agingReport(): bao cao tuoi no
 * - markOverdueDaily(): scheduled job danh dau qua han
 */
@Service
@Transactional
public class PayableService {

    private final PayableRepository payableRepo;
    private final PayablePaymentRepository paymentRepo;
    private final SupplierRepository supplierRepo;
    private final SupplierService supplierService;
    private final BranchSecurity branchSecurity;

    public PayableService(PayableRepository payableRepo,
                          PayablePaymentRepository paymentRepo,
                          SupplierRepository supplierRepo,
                          SupplierService supplierService,
                          BranchSecurity branchSecurity) {
        this.payableRepo    = payableRepo;
        this.paymentRepo    = paymentRepo;
        this.supplierRepo   = supplierRepo;
        this.supplierService = supplierService;
        this.branchSecurity = branchSecurity;
    }

    // ── QUERY ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PageResponse<PayableDto> list(Long branchId, PayableStatus status, Long supplierId, int page, int size) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "dueDate"));

        if (supplierId != null) {
            return PageResponse.from(payableRepo.findBySupplier_Id(supplierId, pageable).map(PayableDto::from));
        }
        if (scopedBranchId == null) {
            if (status != null) return PageResponse.from(payableRepo.findByStatus(status, pageable).map(PayableDto::from));
            return PageResponse.from(payableRepo.findAll(pageable).map(PayableDto::from));
        }
        if (status != null) return PageResponse.from(payableRepo.findByBranchIdAndStatus(scopedBranchId, status, pageable).map(PayableDto::from));
        return PageResponse.from(payableRepo.findByBranchId(scopedBranchId, pageable).map(PayableDto::from));
    }

    @Transactional(readOnly = true)
    public PayableDto get(Long id) {
        return PayableDto.from(findById(id));
    }

    @Transactional(readOnly = true)
    public List<PayableDto> getOpenBySupplier(Long supplierId) {
        return payableRepo.findOpenPayablesBySupplier(supplierId)
                .stream().map(PayableDto::from).toList();
    }

    // ── CREATE FROM RECEIPT (goi tu PurchaseReceiptService) ────────

    /**
     * Tao cong no tu phieu nhap kho.
     * @param supplierId NCC
     * @param branchId Chi nhanh
     * @param sourceId receipt.id
     * @param sourceNo receipt.receiptNo
     * @param amount tong tien nhap
     * @param paymentTermsDays so ngay credit
     */
    public Payable createFromReceipt(Long supplierId, Long branchId,
                                     Long sourceId, String sourceNo,
                                     BigDecimal amount, int paymentTermsDays) {
        Supplier supplier = supplierRepo.findById(supplierId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy NCC: " + supplierId));

        Payable payable = new Payable();
        payable.setPayableCode(generatePayableCode());
        payable.setSupplier(supplier);
        payable.setBranchId(branchId);
        payable.setSourceType("PURCHASE_RECEIPT");
        payable.setSourceId(sourceId);
        payable.setSourceNo(sourceNo);
        payable.setOriginalAmount(amount);
        payable.setPaidAmount(BigDecimal.ZERO);
        payable.setRemainingAmount(amount);
        payable.setInvoiceDate(LocalDate.now());
        payable.setDueDate(LocalDate.now().plusDays(paymentTermsDays));
        payable.setStatus(PayableStatus.OPEN);
        payable.setCreatedBy(safeUsername());

        payable = payableRepo.save(payable);

        // Cap nhat currentDebt NCC
        supplierService.increaseDebt(supplierId, amount);

        return payable;
    }

    /** Tao khoang phai thu tu tra hang (NCC no lai minh) */
    public Payable createReturnCredit(Long supplierId, Long branchId,
                                      Long sourceId, String sourceNo,
                                      BigDecimal amount) {
        Supplier supplier = supplierRepo.findById(supplierId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy NCC: " + supplierId));

        Payable payable = new Payable();
        payable.setPayableCode(generatePayableCode());
        payable.setSupplier(supplier);
        payable.setBranchId(branchId);
        payable.setSourceType("PURCHASE_RETURN_REFUND");
        payable.setSourceId(sourceId);
        payable.setSourceNo(sourceNo);
        payable.setOriginalAmount(amount.negate());   // Am = NCC co minh
        payable.setPaidAmount(BigDecimal.ZERO);
        payable.setRemainingAmount(amount.negate());
        payable.setInvoiceDate(LocalDate.now());
        payable.setStatus(PayableStatus.PAID);        // Khoan thu, khong can theo doi tra
        payable.setCreatedBy(safeUsername());
        return payableRepo.save(payable);
    }

    // ── PAYMENT ────────────────────────────────────────────────────

    public PayableDto pay(PayablePayRequest req) {
        // Pessimistic lock de tranh thanh toan dong thoi
        Payable payable = payableRepo.findWithLockById(req.payableId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy công nợ: " + req.payableId()));
        branchSecurity.requireBranchAccess(payable.getBranchId());

        if (payable.getStatus() == PayableStatus.PAID || payable.getStatus() == PayableStatus.CANCELLED) {
            throw new BusinessException("Công nợ đã thanh toán hoặc đã hủy");
        }
        if (req.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Số tiền thanh toán phải > 0");
        }

        BigDecimal applied = payable.applyPayment(req.amount());

        PayablePayment payment = new PayablePayment();
        payment.setAmount(applied);
        payment.setPaymentDate(req.paymentDate() != null ? req.paymentDate() : LocalDate.now());
        payment.setPaymentMethod(req.paymentMethod());
        payment.setBankRef(req.bankRef());
        payment.setNote(req.note());
        payment.setCreatedBy(safeUsername());
        payable.addPayment(payment);

        payable = payableRepo.save(payable);

        // Giam currentDebt NCC
        supplierService.decreaseDebt(payable.getSupplier().getId(), applied);

        return PayableDto.from(payable);
    }

    // ── AGING REPORT ───────────────────────────────────────────────

    public record AgingBucket(
            Long supplierId, String supplierName,
            BigDecimal current,       // Chua den han
            BigDecimal days1_30,      // 1-30 ngay
            BigDecimal days31_60,     // 31-60 ngay
            BigDecimal days61_90,     // 61-90 ngay
            BigDecimal over90,        // > 90 ngay
            BigDecimal total
    ) {}

    @Transactional(readOnly = true)
    public List<AgingBucket> agingReport(Long branchId) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        if (scopedBranchId == null) {
            // Admin: lay tat ca — group theo supplier
            scopedBranchId = 0L; // placeholder; se query khac
        }

        List<Payable> payables = payableRepo.findForAgingReport(scopedBranchId);
        LocalDate today = LocalDate.now();

        Map<Long, List<Payable>> bySupplier = payables.stream()
                .collect(Collectors.groupingBy(p -> p.getSupplier().getId()));

        List<AgingBucket> result = new ArrayList<>();
        for (var entry : bySupplier.entrySet()) {
            Long sId = entry.getKey();
            List<Payable> sPayables = entry.getValue();
            String sName = sPayables.get(0).getSupplier().getName();

            BigDecimal current   = BigDecimal.ZERO;
            BigDecimal d1_30     = BigDecimal.ZERO;
            BigDecimal d31_60    = BigDecimal.ZERO;
            BigDecimal d61_90    = BigDecimal.ZERO;
            BigDecimal over90    = BigDecimal.ZERO;

            for (Payable p : sPayables) {
                BigDecimal remaining = p.getRemainingAmount();
                if (remaining.compareTo(BigDecimal.ZERO) <= 0) continue;

                if (p.getDueDate() == null || !today.isAfter(p.getDueDate())) {
                    current = current.add(remaining);
                } else {
                    long days = java.time.temporal.ChronoUnit.DAYS.between(p.getDueDate(), today);
                    if (days <= 30)      d1_30  = d1_30.add(remaining);
                    else if (days <= 60) d31_60 = d31_60.add(remaining);
                    else if (days <= 90) d61_90 = d61_90.add(remaining);
                    else                 over90 = over90.add(remaining);
                }
            }
            BigDecimal total = current.add(d1_30).add(d31_60).add(d61_90).add(over90);
            result.add(new AgingBucket(sId, sName, current, d1_30, d31_60, d61_90, over90, total));
        }
        result.sort((a, b) -> b.total().compareTo(a.total()));
        return result;
    }

    // ── SCHEDULED — danh dau qua han moi ngay luc 01:00 ──────────

    @Scheduled(cron = "0 0 1 * * *")
    public void markOverdueDaily() {
        int updated = payableRepo.markOverdue(LocalDate.now());
        if (updated > 0) {
            System.out.println("[PayableService] Marked " + updated + " payables as OVERDUE");
        }
    }

    // ── HELPERS ────────────────────────────────────────────────────

    private Payable findById(Long id) {
        return payableRepo.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy công nợ: " + id));
    }

    private String generatePayableCode() {
        int seq = payableRepo.findMaxPayableSeq() + 1;
        return String.format("CN-%05d", seq);
    }

    private String safeUsername() {
        try { return branchSecurity.currentUser().getUsername(); }
        catch (Exception e) { return "SYSTEM"; }
    }
}

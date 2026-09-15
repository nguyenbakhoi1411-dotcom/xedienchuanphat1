package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.accounting.enums.PaymentMethod;
import com.chuanphat.warranty.accounting.period.GuardAccountingPeriod;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.dto.PurchasePaymentDto;
import com.chuanphat.warranty.core.dto.PurchasePaymentRequest;
import com.chuanphat.warranty.core.dto.PurchasePaymentResultDto;
import com.chuanphat.warranty.core.dto.SupplierPayableAgingDto;
import com.chuanphat.warranty.core.entity.PurchasePayment;
import com.chuanphat.warranty.core.entity.SupplierInvoice;
import com.chuanphat.warranty.core.enums.PurchasePaymentEntryType;
import com.chuanphat.warranty.core.enums.SupplierInvoicePaymentStatus;
import com.chuanphat.warranty.core.enums.SupplierInvoiceStatus;
import com.chuanphat.warranty.core.repository.PurchasePaymentRepository;
import com.chuanphat.warranty.core.repository.SupplierInvoiceRepository;
import com.chuanphat.warranty.exception.BusinessException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PurchasePaymentService {
    private final SupplierInvoiceRepository invoiceRepository;
    private final PurchasePaymentRepository paymentRepository;
    private final BranchSecurity branchSecurity;

    public PurchasePaymentService(SupplierInvoiceRepository invoiceRepository,
                                  PurchasePaymentRepository paymentRepository,
                                  BranchSecurity branchSecurity) {
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.branchSecurity = branchSecurity;
    }

    @GuardAccountingPeriod(date = "#request.paymentDate() ?: T(java.time.LocalDate).now()", branchId = "@periodGuardDateResolver.supplierInvoiceBranchId(#request.supplierInvoiceId())")
    public PurchasePaymentResultDto pay(PurchasePaymentRequest request) {
        if (request.supplierInvoiceId() == null) {
            throw new BusinessException("Hoa don nha cung cap bat buoc khi thanh toan");
        }
        SupplierInvoice invoice = invoiceRepository.findWithLockById(request.supplierInvoiceId())
                .orElseThrow(() -> new BusinessException("Khong tim thay hoa don nha cung cap: " + request.supplierInvoiceId()));
        branchSecurity.requireBranchAccess(invoice.getBranchId());
        requirePayableMatchStatus(invoice);
        requireSupportedMethod(request.paymentMethod());
        if (request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("So tien thanh toan phai > 0");
        }

        BigDecimal alreadyPaid = paymentRepository.sumBySupplierInvoiceId(invoice.getId());
        BigDecimal newPaidAmount = alreadyPaid.add(request.amount());
        if (newPaidAmount.compareTo(invoice.getTotalAmount()) > 0) {
            throw new BusinessException("Tong thanh toan vuot qua gia tri hoa don nha cung cap");
        }

        PurchasePayment payment = new PurchasePayment();
        payment.setSupplierInvoice(invoice);
        payment.setAmount(request.amount());
        payment.setEntryType(PurchasePaymentEntryType.PAYMENT);
        payment.setPaymentDate(request.paymentDate() != null ? request.paymentDate() : LocalDate.now());
        payment.setPaymentMethod(request.paymentMethod());
        payment.setReferenceNo(request.referenceNo());
        payment.setNote(request.note());
        payment.setCreatedBy(safeUsername());
        PurchasePayment saved = paymentRepository.save(payment);

        invoice.setPaidAmount(newPaidAmount);
        invoice.setPaymentStatus(paymentStatus(invoice.getTotalAmount(), newPaidAmount));
        SupplierInvoice savedInvoice = invoiceRepository.save(invoice);
        return result(saved, savedInvoice);
    }

    @GuardAccountingPeriod(date = "T(java.time.LocalDate).now()", branchId = "#invoice.branchId")
    public PurchasePayment applyReturnCredit(SupplierInvoice invoice, BigDecimal amount, String returnCode) {
        if (invoice.getStatus() != SupplierInvoiceStatus.MATCHED && invoice.getStatus() != SupplierInvoiceStatus.RESOLVED) {
            throw new BusinessException("Hoa don nha cung cap chua MATCHED/RESOLVED, khong duoc ghi giam tru tra hang");
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("So tien giam tru phai > 0");
        }
        BigDecimal alreadyApplied = paymentRepository.sumBySupplierInvoiceId(invoice.getId());
        BigDecimal newAppliedAmount = alreadyApplied.add(amount);
        if (newAppliedAmount.compareTo(invoice.getTotalAmount()) > 0) {
            throw new BusinessException("Tong giam tru/thanh toan vuot qua gia tri hoa don nha cung cap");
        }

        PurchasePayment credit = new PurchasePayment();
        credit.setSupplierInvoice(invoice);
        credit.setAmount(amount);
        credit.setEntryType(PurchasePaymentEntryType.RETURN_CREDIT);
        credit.setPaymentDate(LocalDate.now());
        credit.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        credit.setReferenceNo(returnCode);
        credit.setNote("Giam tru cong no do tra hang NCC " + returnCode);
        credit.setCreatedBy(safeUsername());
        PurchasePayment saved = paymentRepository.save(credit);

        invoice.setPaidAmount(newAppliedAmount);
        invoice.setPaymentStatus(paymentStatus(invoice.getTotalAmount(), newAppliedAmount));
        invoiceRepository.save(invoice);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<PurchasePaymentDto> paymentHistory(Long supplierInvoiceId) {
        return paymentRepository.findBySupplierInvoice_IdOrderByPaymentDateDescIdDesc(supplierInvoiceId)
                .stream()
                .map(PurchasePaymentDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SupplierPayableAgingDto> agingReport(Long branchId) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        List<SupplierInvoice> confirmedInvoices = invoiceRepository.findByStatusInAndPaymentStatusNot(
                List.of(SupplierInvoiceStatus.MATCHED, SupplierInvoiceStatus.RESOLVED),
                SupplierInvoicePaymentStatus.PAID);
        List<SupplierInvoice> holdInvoices = invoiceRepository.findByStatusIn(List.of(SupplierInvoiceStatus.HOLD_FOR_REVIEW));
        Map<Long, AgingAccumulator> rows = new LinkedHashMap<>();
        LocalDate today = LocalDate.now();

        for (SupplierInvoice invoice : confirmedInvoices) {
            if (!branchMatches(invoice, scopedBranchId)) {
                continue;
            }
            BigDecimal remaining = invoice.getTotalAmount().subtract(paymentRepository.sumBySupplierInvoiceId(invoice.getId()));
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            AgingAccumulator row = row(rows, invoice);
            long ageDays = ChronoUnit.DAYS.between(dueDate(invoice), today);
            if (ageDays <= 30) {
                row.days0To30 = row.days0To30.add(remaining);
            } else if (ageDays <= 60) {
                row.days31To60 = row.days31To60.add(remaining);
            } else {
                row.daysOver60 = row.daysOver60.add(remaining);
            }
        }

        for (SupplierInvoice invoice : holdInvoices) {
            if (!branchMatches(invoice, scopedBranchId)) {
                continue;
            }
            row(rows, invoice).holdForReviewAmount = row(rows, invoice).holdForReviewAmount.add(invoice.getTotalAmount());
        }

        return rows.values().stream().map(AgingAccumulator::toDto).toList();
    }

    private void requirePayableMatchStatus(SupplierInvoice invoice) {
        if (invoice.getStatus() != SupplierInvoiceStatus.MATCHED && invoice.getStatus() != SupplierInvoiceStatus.RESOLVED) {
            throw new BusinessException("Hoa don nha cung cap chua MATCHED/RESOLVED, khong duoc thanh toan");
        }
    }

    private void requireSupportedMethod(PaymentMethod method) {
        if (method != PaymentMethod.CASH && method != PaymentMethod.BANK_TRANSFER) {
            throw new BusinessException("Phuong thuc thanh toan NCC chi ho tro CASH hoac BANK_TRANSFER");
        }
    }

    private SupplierInvoicePaymentStatus paymentStatus(BigDecimal totalAmount, BigDecimal paidAmount) {
        if (paidAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return SupplierInvoicePaymentStatus.UNPAID;
        }
        if (paidAmount.compareTo(totalAmount) < 0) {
            return SupplierInvoicePaymentStatus.PARTIALLY_PAID;
        }
        return SupplierInvoicePaymentStatus.PAID;
    }

    private PurchasePaymentResultDto result(PurchasePayment payment, SupplierInvoice invoice) {
        return new PurchasePaymentResultDto(
                PurchasePaymentDto.from(payment),
                invoice.getId(),
                invoice.getStatus(),
                invoice.getPaymentStatus(),
                invoice.getTotalAmount(),
                invoice.getPaidAmount(),
                invoice.getRemainingAmount());
    }

    private boolean branchMatches(SupplierInvoice invoice, Long scopedBranchId) {
        return scopedBranchId == null || scopedBranchId.equals(invoice.getBranchId());
    }

    private LocalDate dueDate(SupplierInvoice invoice) {
        if (invoice.getDueDate() != null) {
            return invoice.getDueDate();
        }
        int terms = invoice.getSupplier() != null ? invoice.getSupplier().getDefaultPaymentTermDays() : 30;
        return invoice.getInvoiceDate().plusDays(terms);
    }

    private AgingAccumulator row(Map<Long, AgingAccumulator> rows, SupplierInvoice invoice) {
        return rows.computeIfAbsent(invoice.getSupplier().getId(),
                ignored -> new AgingAccumulator(invoice.getSupplier().getId(), invoice.getSupplier().getName()));
    }

    private String safeUsername() {
        try {
            String username = branchSecurity.currentUser().getUsername();
            return username != null ? username : "SYSTEM";
        } catch (Exception e) {
            return "SYSTEM";
        }
    }

    private static class AgingAccumulator {
        private final Long supplierId;
        private final String supplierName;
        private BigDecimal days0To30 = BigDecimal.ZERO;
        private BigDecimal days31To60 = BigDecimal.ZERO;
        private BigDecimal daysOver60 = BigDecimal.ZERO;
        private BigDecimal holdForReviewAmount = BigDecimal.ZERO;

        private AgingAccumulator(Long supplierId, String supplierName) {
            this.supplierId = supplierId;
            this.supplierName = supplierName;
        }

        private SupplierPayableAgingDto toDto() {
            BigDecimal totalConfirmedDebt = days0To30.add(days31To60).add(daysOver60);
            return new SupplierPayableAgingDto(
                    supplierId,
                    supplierName,
                    days0To30,
                    days31To60,
                    daysOver60,
                    totalConfirmedDebt,
                    holdForReviewAmount);
        }
    }
}

package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.accounting.enums.PaymentMethod;
import com.chuanphat.warranty.accounting.service.AccountingService;
import com.chuanphat.warranty.audit.dto.CreateAuditLogRequest;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import com.chuanphat.warranty.audit.service.AuditLogService;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.dto.CreateDepositRequest;
import com.chuanphat.warranty.core.dto.DepositResponse;
import com.chuanphat.warranty.core.entity.Customer;
import com.chuanphat.warranty.core.entity.Deposit;
import com.chuanphat.warranty.core.repository.DepositRepository;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * DepositService — quản lý đặt cọc xe.
 *
 * Luồng:
 *   1. createDeposit()    → ghi kế toán phiếu thu (idempotent)
 *   2. convertToOrder()   → chuyển cọc thành đơn hàng + bù trừ kế toán
 *   3. refundDeposit()    → hoàn cọc + ghi kế toán phiếu chi
 */
@Service
public class DepositService {
    private final DepositRepository depositRepository;
    private final CustomerService customerService;
    private final AccountingService accountingService;
    private final AuditLogService auditLogService;
    private final BranchSecurity branchSecurity;

    public DepositService(
            DepositRepository depositRepository,
            CustomerService customerService,
            AccountingService accountingService,
            AuditLogService auditLogService,
            BranchSecurity branchSecurity
    ) {
        this.depositRepository = depositRepository;
        this.customerService = customerService;
        this.accountingService = accountingService;
        this.auditLogService = auditLogService;
        this.branchSecurity = branchSecurity;
    }

    @Transactional(readOnly = true)
    public List<DepositResponse> listByCustomer(Long customerId) {
        return depositRepository.findByCustomerIdAndDeletedFalseOrderByCreatedAtDesc(customerId)
                .stream().map(DepositResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<DepositResponse> listByBranch(Long branchId) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        if (scopedBranchId == null) {
            return depositRepository.findAll().stream()
                    .filter(d -> !d.isDeleted())
                    .map(DepositResponse::from).toList();
        }
        return depositRepository.findByBranchIdAndDeletedFalseOrderByCreatedAtDesc(scopedBranchId)
                .stream().map(DepositResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public DepositResponse get(Long id) {
        return DepositResponse.from(getEntity(id));
    }

    /**
     * Tạo phiếu đặt cọc + ghi kế toán (Nợ TK tiền / Có TK tạm ứng KH).
     */
    @Transactional
    public DepositResponse create(CreateDepositRequest request) {
        branchSecurity.requireBranchAccess(request.branchId());
        Customer customer = customerService.get(request.customerId());

        Deposit deposit = new Deposit();
        deposit.setDepositCode("DC-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT));
        deposit.setCustomerId(request.customerId());
        deposit.setBranchId(request.branchId());
        deposit.setProductId(request.productId());
        deposit.setSerialId(request.serialId());
        deposit.setAmount(request.amount());
        deposit.setDepositDate(request.depositDate() == null ? LocalDate.now() : request.depositDate());
        deposit.setExpiredAt(request.expiredAt());
        deposit.setPaymentMethod(request.paymentMethod() == null ? "CASH" : request.paymentMethod());
        deposit.setNote(request.note());
        deposit.setCreatedBy(branchSecurity.currentUser().getUsername());
        Deposit saved = depositRepository.save(deposit);

        // Ghi kế toán — idempotent thông qua existsBySourceNoAndType trong AccountingService
        if (!saved.isAccountingRecorded()) {
            PaymentMethod pm = resolvePaymentMethod(saved.getPaymentMethod());
            accountingService.recordDepositReceived(
                    saved.getDepositCode(),
                    saved.getDepositDate(),
                    customer.getId(),
                    customer.getFullName(),
                    saved.getAmount(),
                    pm,
                    null,
                    "Deposit received " + saved.getDepositCode()
            );
            saved.setAccountingRecorded(true);
            saved.setJournalEntryNo(saved.getDepositCode());
        }

        auditLogService.record(new CreateAuditLogRequest(
                branchSecurity.currentUser().getUsername(),
                AuditAction.CREATE_DEPOSIT,
                AuditModule.SALES,
                "Deposit",
                saved.getId().toString(),
                null,
                saved.getDepositCode(),
                null, null
        ));
        return DepositResponse.from(saved);
    }

    /**
     * Chuyển đổi cọc thành đơn hàng.
     * Gọi sau khi SalesOrder đã được tạo thành công.
     */
    @Transactional
    public DepositResponse convertToOrder(Long depositId, Long salesOrderId, String salesOrderNo) {
        Deposit deposit = getEntity(depositId);
        if (!"ACTIVE".equals(deposit.getStatus())) {
            throw new BusinessException("Deposit is not active: " + deposit.getStatus());
        }
        Customer customer = customerService.get(deposit.getCustomerId());

        deposit.setStatus("CONVERTED");
        deposit.setConvertedToOrderId(salesOrderId);
        deposit.setConvertedAt(OffsetDateTime.now());
        deposit.setConvertedBy(branchSecurity.currentUser().getUsername());

        // Ghi bút toán bù trừ cọc → đơn hàng
        accountingService.recordDepositConverted(
                deposit.getDepositCode(),
                LocalDate.now(),
                customer.getId(),
                customer.getFullName(),
                deposit.getAmount(),
                salesOrderNo,
                "Convert deposit " + deposit.getDepositCode() + " to order " + salesOrderNo
        );

        auditLogService.record(new CreateAuditLogRequest(
                branchSecurity.currentUser().getUsername(),
                AuditAction.UPDATE_ORDER,
                AuditModule.SALES,
                "Deposit",
                deposit.getId().toString(),
                "ACTIVE",
                "CONVERTED -> " + salesOrderNo,
                null, null
        ));
        return DepositResponse.from(deposit);
    }

    /**
     * Hoàn cọc — đổi trạng thái sang REFUNDED.
     * Kế toán refund được xử lý riêng qua AccountingService.recordSalesRefund.
     */
    @Transactional
    public DepositResponse refund(Long depositId, String refundedBy) {
        Deposit deposit = getEntity(depositId);
        if (!"ACTIVE".equals(deposit.getStatus())) {
            throw new BusinessException("Only ACTIVE deposits can be refunded");
        }
        deposit.setStatus("REFUNDED");
        deposit.setRefundedAt(OffsetDateTime.now());
        deposit.setRefundedBy(refundedBy == null ? branchSecurity.currentUser().getUsername() : refundedBy);
        deposit.setRefundAmount(deposit.getAmount());
        return DepositResponse.from(deposit);
    }

    private Deposit getEntity(Long id) {
        Deposit deposit = depositRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Deposit not found: " + id));
        if (deposit.isDeleted()) {
            throw new NotFoundException("Deposit not found: " + id);
        }
        branchSecurity.requireBranchAccess(deposit.getBranchId());
        return deposit;
    }

    private PaymentMethod resolvePaymentMethod(String raw) {
        if (raw == null) return PaymentMethod.CASH;
        try {
            return PaymentMethod.valueOf(raw.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return PaymentMethod.CASH;
        }
    }
}

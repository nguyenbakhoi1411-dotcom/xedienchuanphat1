package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.accounting.dto.CreateReceiptRequest;
import com.chuanphat.warranty.accounting.dto.RecordSalesPaymentRequest;
import com.chuanphat.warranty.accounting.enums.PaymentMethod;
import com.chuanphat.warranty.accounting.service.AccountingService;
import com.chuanphat.warranty.audit.dto.CreateAuditLogRequest;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import com.chuanphat.warranty.audit.service.AuditLogService;
import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.common.security.BranchSecurity;
import com.chuanphat.warranty.core.dto.ConvertQuotationRequest;
import com.chuanphat.warranty.core.dto.CreateInstallmentRequest;
import com.chuanphat.warranty.core.dto.CreateInvoiceRequest;
import com.chuanphat.warranty.core.dto.CreateQuotationItemRequest;
import com.chuanphat.warranty.core.dto.CreateQuotationRequest;
import com.chuanphat.warranty.core.dto.CreateSalesOrderItemRequest;
import com.chuanphat.warranty.core.dto.CreateSalesOrderRequest;
import com.chuanphat.warranty.core.dto.CreateSalesReturnItemRequest;
import com.chuanphat.warranty.core.dto.CreateSalesReturnRequest;
import com.chuanphat.warranty.core.dto.InstallmentResponse;
import com.chuanphat.warranty.core.dto.InvoiceResponse;
import com.chuanphat.warranty.core.dto.PaymentEntryRequest;
import com.chuanphat.warranty.core.dto.QuotationListResponse;
import com.chuanphat.warranty.core.dto.QuotationResponse;
import com.chuanphat.warranty.core.dto.QuotationStatusRequest;
import com.chuanphat.warranty.core.dto.SalesOrderResponse;
import com.chuanphat.warranty.core.dto.SalesOrderListResponse;
import com.chuanphat.warranty.core.dto.SalesOrderStatusRequest;
import com.chuanphat.warranty.core.dto.SalesPaymentResponse;
import com.chuanphat.warranty.core.dto.SalesReturnResponse;
import com.chuanphat.warranty.core.dto.VoucherPreviewRequest;
import com.chuanphat.warranty.core.dto.VoucherPreviewResponse;
import com.chuanphat.warranty.core.entity.Customer;
import com.chuanphat.warranty.core.entity.InstallmentApplication;
import com.chuanphat.warranty.core.entity.Invoice;
import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.entity.ProductSerial;
import com.chuanphat.warranty.core.entity.Quotation;
import com.chuanphat.warranty.core.entity.QuotationItem;
import com.chuanphat.warranty.core.entity.SalesOrder;
import com.chuanphat.warranty.core.entity.SalesOrderItem;
import com.chuanphat.warranty.core.entity.SalesPayment;
import com.chuanphat.warranty.core.entity.SalesReturn;
import com.chuanphat.warranty.core.entity.SalesReturnItem;
import com.chuanphat.warranty.core.entity.Warehouse;
import com.chuanphat.warranty.core.enums.InstallmentStatus;
import com.chuanphat.warranty.core.enums.InvoiceStatus;
import com.chuanphat.warranty.core.enums.PaymentStatus;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.QuotationStatus;
import com.chuanphat.warranty.core.enums.ReturnSerialDisposition;
import com.chuanphat.warranty.core.enums.SalesOrderStatus;
import com.chuanphat.warranty.core.enums.DiscountApprovalStatus;
import com.chuanphat.warranty.core.enums.SalesReturnStatus;
import com.chuanphat.warranty.core.enums.SerialStatus;
import com.chuanphat.warranty.core.repository.InstallmentApplicationRepository;
import com.chuanphat.warranty.core.repository.InvoiceRepository;
import com.chuanphat.warranty.core.repository.ProductSerialRepository;
import com.chuanphat.warranty.core.repository.QuotationRepository;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import com.chuanphat.warranty.core.repository.SalesPaymentRepository;
import com.chuanphat.warranty.core.repository.SalesReturnRepository;
import com.chuanphat.warranty.dto.CreateWarrantyRequest;
import com.chuanphat.warranty.entity.WarrantyPolicy;
import com.chuanphat.warranty.exception.BusinessException;
import com.chuanphat.warranty.exception.NotFoundException;
import com.chuanphat.warranty.marketing.entity.Voucher;
import com.chuanphat.warranty.marketing.repository.VoucherRepository;
import com.chuanphat.warranty.notification.NotificationService;
import com.chuanphat.warranty.notification.NotificationSeverity;
import com.chuanphat.warranty.reports.ExportDocumentService;
import com.chuanphat.warranty.service.WarrantyService;
import com.chuanphat.warranty.repository.WarrantyPolicyRepository;
import com.chuanphat.warranty.repository.WarrantyRepository;
import com.chuanphat.warranty.pricing.dto.PricingDtos;
import com.chuanphat.warranty.pricing.service.PriceCalculationService;
import com.chuanphat.warranty.settings.SettingService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SalesService {
    private static final int DEFAULT_RESERVATION_MINUTES = 120;

    private final SalesOrderRepository salesOrderRepository;
    private final QuotationRepository quotationRepository;
    private final SalesPaymentRepository paymentRepository;
    private final InstallmentApplicationRepository installmentRepository;
    private final SalesReturnRepository returnRepository;
    private final ProductSerialRepository serialRepository;
    private final InvoiceRepository invoiceRepository;
    private final VoucherRepository voucherRepository;
    private final ProductService productService;
    private final InventoryService inventoryService;
    private final CustomerService customerService;
    private final AccountingService accountingService;
    private final WarrantyService warrantyService;
    private final WarrantyPolicyRepository warrantyPolicyRepository;
    private final WarrantyRepository warrantyRepository;
    private final PriceCalculationService priceCalculationService;
    private final AuditLogService auditLogService;
    private final BranchSecurity branchSecurity;
    private final SettingService settingService;
    private final ExportDocumentService exportDocumentService;
    private final NotificationService notificationService;

    public SalesService(
            SalesOrderRepository salesOrderRepository,
            QuotationRepository quotationRepository,
            SalesPaymentRepository paymentRepository,
            InstallmentApplicationRepository installmentRepository,
            SalesReturnRepository returnRepository,
            ProductSerialRepository serialRepository,
            InvoiceRepository invoiceRepository,
            VoucherRepository voucherRepository,
            ProductService productService,
            InventoryService inventoryService,
            CustomerService customerService,
            AccountingService accountingService,
            WarrantyService warrantyService,
            WarrantyPolicyRepository warrantyPolicyRepository,
            WarrantyRepository warrantyRepository,
            PriceCalculationService priceCalculationService,
            AuditLogService auditLogService,
            BranchSecurity branchSecurity,
            SettingService settingService,
            ExportDocumentService exportDocumentService,
            NotificationService notificationService
    ) {
        this.salesOrderRepository = salesOrderRepository;
        this.quotationRepository = quotationRepository;
        this.paymentRepository = paymentRepository;
        this.installmentRepository = installmentRepository;
        this.returnRepository = returnRepository;
        this.serialRepository = serialRepository;
        this.invoiceRepository = invoiceRepository;
        this.voucherRepository = voucherRepository;
        this.productService = productService;
        this.inventoryService = inventoryService;
        this.customerService = customerService;
        this.accountingService = accountingService;
        this.warrantyService = warrantyService;
        this.warrantyPolicyRepository = warrantyPolicyRepository;
        this.warrantyRepository = warrantyRepository;
        this.priceCalculationService = priceCalculationService;
        this.auditLogService = auditLogService;
        this.branchSecurity = branchSecurity;
        this.settingService = settingService;
        this.exportDocumentService = exportDocumentService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public PageResponse<SalesOrderListResponse> list(Long branchId, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        PageRequest pageRequest = listPageRequest(page, pageSize);
        if (scopedBranchId == null) {
            return PageResponse.from(salesOrderRepository.findList(pageRequest));
        }
        return PageResponse.from(salesOrderRepository.findListByBranchId(scopedBranchId, pageRequest));
    }

    @Transactional(readOnly = true)
    public SalesOrderResponse getOrder(Long id) {
        SalesOrder order = salesOrderRepository.findWithItemsById(id)
                .orElseThrow(() -> new NotFoundException("Sales order not found: " + id));
        branchSecurity.requireBranchAccess(order.getBranchId());
        return SalesOrderResponse.from(order);
    }

    @Transactional
    public SalesOrderResponse create(CreateSalesOrderRequest request) {
        Customer customer = validateCustomerBranch(request.customerId(), request.branchId());
        requireDiscountApprovalIfNeeded(nullToZero(request.discountAmount()), request.voucherCode(), request.items());

        SalesOrder order = new SalesOrder();
        order.setOrderNo(number("SO"));
        order.setBranchId(request.branchId());
        order.setCustomerId(request.customerId());
        order.setEmployeeId(request.employeeId());
        order.setOrderDate(request.orderDate() == null ? LocalDate.now() : request.orderDate());
        order.setVoucherCode(blankToEmpty(request.voucherCode()));
        order.setNote(request.note());
        order.setReservationUntil(resolveReservationUntil(request.reservationUntil(), null));

        BigDecimal subtotal = addOrderItems(order, request.items());
        BigDecimal discount = resolveDiscount(order.getBranchId(), subtotal, order.getVoucherCode(), orderProductIds(order), nullToZero(request.discountAmount()));
        applyTotals(order, subtotal, discount);
        checkAndMarkDiscountApproval(order, nullToZero(request.discountAmount()));
        validatePayments(order.getTotalAmount(), normalizedPayments(request));

        SalesOrder saved = salesOrderRepository.save(order);
        audit(AuditAction.CREATE_ORDER, AuditModule.SALES, "SalesOrder", saved.getId(), null, saved.getOrderNo());
        notificationService.notifyAllOnce("NEW_ORDER", NotificationSeverity.SUCCESS, "SALES", saved.getId(), "Don hang moi", "Don " + saved.getOrderNo() + " vua duoc tao");

        boolean shouldConfirm = request.confirm() == null || Boolean.TRUE.equals(request.confirm());
        if (shouldConfirm && saved.getStatus() != SalesOrderStatus.WAITING_DISCOUNT_APPROVAL) {
            confirmOrder(saved, new SalesOrderStatusRequest(saved.getReservationUntil(), null), false);
            consumeVoucher(saved);
            for (PaymentEntryRequest payment : normalizedPayments(request)) {
                addPaymentInternal(saved, customer, payment, false);
            }
        }

        boolean shouldIssueInvoice = request.issueInvoice() == null ? shouldConfirm : Boolean.TRUE.equals(request.issueInvoice());
        if (shouldIssueInvoice && saved.getStatus() != SalesOrderStatus.WAITING_DISCOUNT_APPROVAL) {
            createInvoiceEntity(saved, new CreateInvoiceRequest(InvoiceStatus.ISSUED, null));
        }

        return SalesOrderResponse.from(saved);
    }

    @Transactional
    public SalesOrderResponse confirm(Long id, SalesOrderStatusRequest request) {
        SalesOrder order = getOrderEntity(id);
        branchSecurity.requireBranchAccess(order.getBranchId());
        confirmOrder(order, request, true);
        consumeVoucher(order);
        return SalesOrderResponse.from(order);
    }

    @Transactional
    public SalesOrderResponse cancel(Long id, SalesOrderStatusRequest request) {
        SalesOrder order = getOrderEntity(id);
        branchSecurity.requireBranchAccess(order.getBranchId());
        if (order.getStatus() == SalesOrderStatus.DELIVERED || order.getStatus() == SalesOrderStatus.RETURNED) {
            throw new BusinessException("Delivered or returned orders cannot be cancelled");
        }
        releaseOrderSerials(order);
        order.setStatus(SalesOrderStatus.CANCELLED);
        order.setCancelledAt(OffsetDateTime.now());
        audit(AuditAction.CANCEL_ORDER, AuditModule.SALES, "SalesOrder", order.getId(), request == null ? null : request.reason(), order.getOrderNo());
        return SalesOrderResponse.from(order);
    }

    @Transactional
    public SalesOrderResponse deliver(Long id) {
        SalesOrder order = getOrderEntity(id);
        branchSecurity.requireBranchAccess(order.getBranchId());
        if (order.getStatus() == SalesOrderStatus.CANCELLED || order.getStatus() == SalesOrderStatus.RETURNED) {
            throw new BusinessException("Order cannot be delivered in status " + order.getStatus());
        }
        issueStockIfNeeded(order);
        order.setStatus(SalesOrderStatus.DELIVERED);
        order.setDeliveredAt(OffsetDateTime.now());
        // Cập nhật Customer 360 khi giao hàng thành công
        customerService.recordPurchase(order.getCustomerId(), order.getTotalAmount(), order.getOrderDate());
        return SalesOrderResponse.from(order);
    }

    /** Quan ly duyet giam gia — yeu cau quyen SALES_DISCOUNT_APPROVE. */
    @Transactional
    public SalesOrderResponse approveDiscount(Long id, String note) {
        if (!hasAuthority("SALES_DISCOUNT_APPROVE")) {
            throw new AccessDeniedException("Requried SALES_DISCOUNT_APPROVE permission to approve discount");
        }
        SalesOrder order = getOrderEntity(id);
        branchSecurity.requireBranchAccess(order.getBranchId());
        if (order.getStatus() != SalesOrderStatus.WAITING_DISCOUNT_APPROVAL) {
            throw new BusinessException("Order is not waiting for discount approval");
        }
        String approver = branchSecurity.currentUser().getUsername();
        order.setDiscountApprovalStatus(DiscountApprovalStatus.APPROVED);
        order.setApprovedBy(approver);
        order.setApprovedAt(OffsetDateTime.now());
        order.setApprovalNote(note);
        order.setStatus(SalesOrderStatus.DRAFT);
        confirmOrder(order, new SalesOrderStatusRequest(order.getReservationUntil(), null), false);
        audit(AuditAction.UPDATE_ORDER, AuditModule.SALES, "SalesOrder", order.getId(), "Approved discount: " + note, order.getOrderNo());
        notificationService.notifyAllOnce("DISCOUNT_APPROVED", NotificationSeverity.SUCCESS, "SALES", order.getId(),
                "Giam gia da duoc duyet", "Don " + order.getOrderNo() + " da duoc " + approver + " duyet giam gia");
        return SalesOrderResponse.from(order);
    }

    @Transactional
    public SalesOrderResponse rejectDiscount(Long id, String note) {
        if (!hasAuthority("SALES_DISCOUNT_APPROVE")) {
            throw new AccessDeniedException("Required SALES_DISCOUNT_APPROVE permission to reject discount");
        }
        SalesOrder order = getOrderEntity(id);
        branchSecurity.requireBranchAccess(order.getBranchId());
        if (order.getStatus() != SalesOrderStatus.WAITING_DISCOUNT_APPROVAL) {
            throw new BusinessException("Order is not waiting for discount approval");
        }
        String reviewer = branchSecurity.currentUser().getUsername();
        order.setDiscountApprovalStatus(DiscountApprovalStatus.REJECTED);
        order.setApprovedBy(reviewer);
        order.setApprovedAt(OffsetDateTime.now());
        order.setApprovalNote(note);
        order.setStatus(SalesOrderStatus.DRAFT);
        audit(AuditAction.UPDATE_ORDER, AuditModule.SALES, "SalesOrder", order.getId(), "Rejected discount: " + note, order.getOrderNo());
        notificationService.notifyAllOnce("DISCOUNT_REJECTED", NotificationSeverity.WARNING, "SALES", order.getId(),
                "Giam gia bi tu choi", "Don " + order.getOrderNo() + ": " + note);
        return SalesOrderResponse.from(order);
    }

    @Transactional
    public SalesPaymentResponse addPayment(Long orderId, PaymentEntryRequest request) {
        SalesOrder order = getOrderEntity(orderId);
        branchSecurity.requireBranchAccess(order.getBranchId());
        Customer customer = customerService.get(order.getCustomerId());
        SalesPayment payment = addPaymentInternal(order, customer, request, false);
        return SalesPaymentResponse.from(payment);
    }

    @Transactional(readOnly = true)
    public List<SalesPaymentResponse> paymentHistory(Long orderId) {
        SalesOrder order = getOrderEntity(orderId);
        branchSecurity.requireBranchAccess(order.getBranchId());
        return paymentRepository.findByOrder_IdOrderByPaymentDateDescIdDesc(orderId).stream()
                .map(SalesPaymentResponse::from)
                .toList();
    }

    @Transactional
    public PageResponse<QuotationListResponse> quotations(Long branchId, int page, int pageSize) {
        expireQuotations();
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        PageRequest pageRequest = listPageRequest(page, pageSize);
        if (scopedBranchId == null) {
            return PageResponse.from(quotationRepository.findList(pageRequest));
        }
        return PageResponse.from(quotationRepository.findListByBranchId(scopedBranchId, pageRequest));
    }

    @Transactional(readOnly = true)
    public QuotationResponse getQuotation(Long id) {
        Quotation quotation = quotationRepository.findWithItemsById(id)
                .orElseThrow(() -> new NotFoundException("Quotation not found: " + id));
        branchSecurity.requireBranchAccess(quotation.getBranchId());
        return QuotationResponse.from(quotation);
    }

    @Transactional
    public QuotationResponse createQuotation(CreateQuotationRequest request) {
        validateCustomerBranch(request.customerId(), request.branchId());
        requireDiscountApprovalIfNeeded(nullToZero(request.discountAmount()), request.voucherCode(), request.items());
        if (request.validUntil().isBefore(request.quotationDate() == null ? LocalDate.now() : request.quotationDate())) {
            throw new BusinessException("validUntil must be on or after quotationDate");
        }

        Quotation quotation = new Quotation();
        quotation.setQuotationNo(number("QT"));
        quotation.setBranchId(request.branchId());
        quotation.setCustomerId(request.customerId());
        quotation.setEmployeeId(request.employeeId());
        quotation.setQuotationDate(request.quotationDate() == null ? LocalDate.now() : request.quotationDate());
        quotation.setValidUntil(request.validUntil());
        quotation.setVoucherCode(blankToNull(request.voucherCode()));
        quotation.setNote(request.note());

        BigDecimal subtotal = addQuotationItems(quotation, request.items());
        BigDecimal discount = resolveDiscount(quotation.getBranchId(), subtotal, quotation.getVoucherCode(), quotationProductIds(quotation), nullToZero(request.discountAmount()));
        quotation.setSubtotal(subtotal);
        quotation.setDiscountAmount(discount);
        quotation.setTotalAmount(subtotal.subtract(discount));
        if (quotation.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Quotation total must be greater than zero");
        }

        Quotation saved = quotationRepository.save(quotation);
        audit(AuditAction.CREATE_QUOTATION, AuditModule.SALES, "Quotation", saved.getId(), null, saved.getQuotationNo());
        return QuotationResponse.from(saved);
    }

    @Transactional
    public QuotationResponse updateQuotationStatus(Long id, QuotationStatusRequest request) {
        Quotation quotation = getQuotationEntity(id);
        branchSecurity.requireBranchAccess(quotation.getBranchId());
        if (request.status() == QuotationStatus.ACCEPTED && quotation.getValidUntil().isBefore(LocalDate.now())) {
            quotation.setStatus(QuotationStatus.EXPIRED);
            throw new BusinessException("Quotation is expired");
        }
        quotation.setStatus(request.status());
        audit(AuditAction.UPDATE_QUOTATION, AuditModule.SALES, "Quotation", quotation.getId(), null, quotation.getQuotationNo() + " -> " + request.status());
        return QuotationResponse.from(quotation);
    }

    @Transactional
    public SalesOrderResponse convertQuotation(Long id, ConvertQuotationRequest request) {
        Quotation quotation = getQuotationEntity(id);
        branchSecurity.requireBranchAccess(quotation.getBranchId());
        if (quotation.getStatus() == QuotationStatus.REJECTED || quotation.getStatus() == QuotationStatus.EXPIRED) {
            throw new BusinessException("Quotation cannot be converted in status " + quotation.getStatus());
        }
        if (quotation.getValidUntil().isBefore(LocalDate.now())) {
            quotation.setStatus(QuotationStatus.EXPIRED);
            throw new BusinessException("Quotation is expired");
        }

        SalesOrder order = new SalesOrder();
        order.setOrderNo(number("SO"));
        order.setQuotation(quotation);
        order.setBranchId(quotation.getBranchId());
        order.setCustomerId(quotation.getCustomerId());
        order.setEmployeeId(request.employeeId());
        order.setOrderDate(LocalDate.now());
        order.setVoucherCode(blankToEmpty(quotation.getVoucherCode()));
        order.setReservationUntil(resolveReservationUntil(request.reservationUntil(), null));

        for (QuotationItem source : quotation.getItems()) {
            SalesOrderItem item = new SalesOrderItem();
            item.setProduct(source.getProduct());
            item.setSerial(source.getSerial());
            item.setQuantity(source.getSerial() == null ? source.getQuantity() : 1);
            item.setUnitPrice(source.getUnitPrice());
            item.setLineTotal(source.getLineTotal());
            order.addItem(item);
        }
        applyTotals(order, quotation.getSubtotal(), quotation.getDiscountAmount());
        validatePayments(order.getTotalAmount(), request.payments() == null ? List.of() : request.payments());

        SalesOrder saved = salesOrderRepository.save(order);
        quotation.setStatus(QuotationStatus.ACCEPTED);
        audit(AuditAction.CREATE_ORDER, AuditModule.SALES, "SalesOrder", saved.getId(), quotation.getQuotationNo(), saved.getOrderNo());
        notificationService.notifyAllOnce("NEW_ORDER", NotificationSeverity.SUCCESS, "SALES", saved.getId(), "Don hang moi", "Don " + saved.getOrderNo() + " vua duoc tao tu bao gia");

        confirmOrder(saved, new SalesOrderStatusRequest(saved.getReservationUntil(), null), false);
        consumeVoucher(saved);
        Customer customer = customerService.get(saved.getCustomerId());
        if (request.payments() != null) {
            for (PaymentEntryRequest payment : request.payments()) {
                addPaymentInternal(saved, customer, payment, false);
            }
        }
        if (Boolean.TRUE.equals(request.issueInvoice())) {
            createInvoiceEntity(saved, new CreateInvoiceRequest(InvoiceStatus.ISSUED, null));
        }
        return SalesOrderResponse.from(saved);
    }

    @Transactional
    public InstallmentResponse createInstallment(Long orderId, CreateInstallmentRequest request) {
        SalesOrder order = getOrderEntity(orderId);
        branchSecurity.requireBranchAccess(order.getBranchId());
        BigDecimal amount = request.downPaymentAmount().add(request.loanAmount());
        if (amount.compareTo(order.getTotalAmount()) > 0) {
            throw new BusinessException("Installment amount exceeds order total");
        }

        InstallmentApplication installment = new InstallmentApplication();
        installment.setOrder(order);
        installment.setApplicationNo(number("INS"));
        installment.setFinanceCompany(request.financeCompany());
        installment.setDownPaymentAmount(request.downPaymentAmount());
        installment.setLoanAmount(request.loanAmount());
        installment.setTermMonths(request.termMonths());
        installment.setInterestRate(request.interestRate());
        installment.setNote(request.note());
        InstallmentApplication saved = installmentRepository.save(installment);
        audit(AuditAction.CREATE_INSTALLMENT, AuditModule.SALES, "InstallmentApplication", saved.getId(), null, saved.getApplicationNo());
        return InstallmentResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<InstallmentResponse> installments(Long orderId) {
        SalesOrder order = getOrderEntity(orderId);
        branchSecurity.requireBranchAccess(order.getBranchId());
        return installmentRepository.findByOrder_IdOrderByCreatedAtDesc(orderId).stream()
                .map(InstallmentResponse::from)
                .toList();
    }

    @Transactional
    public InstallmentResponse updateInstallmentStatus(Long id, com.chuanphat.warranty.core.dto.UpdateInstallmentStatusRequest request) {
        InstallmentApplication installment = installmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Installment application not found: " + id));
        SalesOrder order = installment.getOrder();
        branchSecurity.requireBranchAccess(order.getBranchId());
        InstallmentStatus oldStatus = installment.getStatus();
        installment.setStatus(request.status());
        if (request.note() != null && !request.note().isBlank()) {
            installment.setNote(request.note());
        }
        if (request.status() == InstallmentStatus.DISBURSED && oldStatus != InstallmentStatus.DISBURSED) {
            BigDecimal disbursedAmount = request.disbursedAmount() == null ? installment.getLoanAmount() : request.disbursedAmount();
            installment.setDisbursedAmount(disbursedAmount);
            installment.setDisbursedAt(OffsetDateTime.now());
            Customer customer = customerService.get(order.getCustomerId());
            addPaymentInternal(order, customer, new PaymentEntryRequest(
                    PaymentMethod.INSTALLMENT,
                    disbursedAmount,
                    request.bankAccountId(),
                    request.paymentDate(),
                    request.referenceNo(),
                    request.note()
            ), true);
        }
        audit(AuditAction.UPDATE_INSTALLMENT, AuditModule.SALES, "InstallmentApplication", installment.getId(), oldStatus.name(), installment.getStatus().name());
        return InstallmentResponse.from(installment);
    }

    @Transactional
    public InvoiceResponse createInvoice(Long orderId, CreateInvoiceRequest request) {
        SalesOrder order = getOrderEntity(orderId);
        branchSecurity.requireBranchAccess(order.getBranchId());
        return InvoiceResponse.from(createInvoiceEntity(order, request));
    }

    @Transactional
    public InvoiceResponse issueInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Invoice not found: " + id));
        branchSecurity.requireBranchAccess(invoice.getOrder().getBranchId());
        issueInvoiceEntity(invoice);
        return InvoiceResponse.from(invoice);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Invoice not found: " + id));
        branchSecurity.requireBranchAccess(invoice.getOrder().getBranchId());
        return InvoiceResponse.from(invoice);
    }

    @Transactional(readOnly = true)
    public byte[] invoicePdf(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Invoice not found: " + id));
        branchSecurity.requireBranchAccess(invoice.getOrder().getBranchId());
        Customer customer = customerService.get(invoice.getOrder().getCustomerId());
        return exportDocumentService.businessPdf(new ExportDocumentService.BusinessDocument(
                "Hoa don ban hang",
                invoice.getInvoiceNo(),
                invoice.getInvoiceDate().toString(),
                customer.getFullName(),
                customer.getPhone(),
                "Don hang: " + invoice.getOrder().getOrderNo() + " | Trang thai: " + invoice.getStatus(),
                List.of("San pham", "SL", "Don gia", "Thanh tien"),
                invoice.getOrder().getItems().stream().map(item -> List.of(
                        item.getProduct().getProductName(),
                        String.valueOf(item.getQuantity()),
                        item.getUnitPrice().toPlainString(),
                        item.getLineTotal().toPlainString()
                )).toList(),
                invoice.getTotalAmount()
        ));
    }

    @Transactional(readOnly = true)
    public byte[] salesOrderPdf(Long id) {
        SalesOrder order = getOrderEntity(id);
        branchSecurity.requireBranchAccess(order.getBranchId());
        Customer customer = customerService.get(order.getCustomerId());
        return exportDocumentService.businessPdf(new ExportDocumentService.BusinessDocument(
                "Don ban hang",
                order.getOrderNo(),
                order.getOrderDate().toString(),
                customer.getFullName(),
                customer.getPhone(),
                "Trang thai: " + order.getStatus() + " | Thanh toan: " + order.getPaymentStatus(),
                List.of("San pham", "SL", "Don gia", "Thanh tien"),
                order.getItems().stream().map(item -> List.of(
                        item.getProduct().getProductName(),
                        String.valueOf(item.getQuantity()),
                        item.getUnitPrice().toPlainString(),
                        item.getLineTotal().toPlainString()
                )).toList(),
                order.getTotalAmount()
        ));
    }

    @Transactional(readOnly = true)
    public byte[] quotationPdf(Long id) {
        Quotation quotation = getQuotationEntity(id);
        branchSecurity.requireBranchAccess(quotation.getBranchId());
        Customer customer = customerService.get(quotation.getCustomerId());
        return exportDocumentService.businessPdf(new ExportDocumentService.BusinessDocument(
                "Bao gia",
                quotation.getQuotationNo(),
                quotation.getQuotationDate().toString(),
                customer.getFullName(),
                customer.getPhone(),
                "Hieu luc den: " + quotation.getValidUntil() + " | Trang thai: " + quotation.getStatus(),
                List.of("San pham", "SL", "Don gia", "Thanh tien"),
                quotation.getItems().stream().map(item -> List.of(
                        item.getProduct().getProductName(),
                        String.valueOf(item.getQuantity()),
                        item.getUnitPrice().toPlainString(),
                        item.getLineTotal().toPlainString()
                )).toList(),
                quotation.getTotalAmount()
        ));
    }

    @Transactional
    public SalesReturnResponse createReturn(CreateSalesReturnRequest request) {
        SalesOrder order = getOrderEntity(request.orderId());
        branchSecurity.requireBranchAccess(order.getBranchId());
        if (order.getStatus() == SalesOrderStatus.CANCELLED) {
            throw new BusinessException("Cancelled orders cannot be returned");
        }
        if (!order.isStockIssued()) {
            throw new BusinessException("Order stock has not been issued yet");
        }

        SalesReturn salesReturn = new SalesReturn();
        salesReturn.setReturnNo(number("SR"));
        salesReturn.setOrder(order);
        salesReturn.setBranchId(order.getBranchId());
        salesReturn.setCustomerId(order.getCustomerId());
        salesReturn.setReturnDate(request.returnDate() == null ? LocalDate.now() : request.returnDate());
        salesReturn.setReason(request.reason());

        BigDecimal returnAmount = BigDecimal.ZERO;
        for (CreateSalesReturnItemRequest itemRequest : request.items()) {
            SalesOrderItem orderItem = order.getItems().stream()
                    .filter(item -> item.getId().equals(itemRequest.orderItemId()))
                    .findFirst()
                    .orElseThrow(() -> new BusinessException("Order item not found in order: " + itemRequest.orderItemId()));
            int availableToReturn = orderItem.getQuantity() - orderItem.getReturnedQuantity();
            if (itemRequest.quantity() > availableToReturn) {
                throw new BusinessException("Return quantity exceeds sold quantity");
            }

            SalesReturnItem returnItem = new SalesReturnItem();
            returnItem.setOrderItem(orderItem);
            returnItem.setProduct(orderItem.getProduct());
            returnItem.setSerial(orderItem.getSerial());
            returnItem.setQuantity(itemRequest.quantity());
            returnItem.setUnitPrice(orderItem.getUnitPrice());
            returnItem.setLineAmount(orderItem.getUnitPrice().multiply(BigDecimal.valueOf(itemRequest.quantity())));
            returnItem.setSerialDisposition(itemRequest.serialDisposition() == null ? ReturnSerialDisposition.RETURNED : itemRequest.serialDisposition());
            salesReturn.addItem(returnItem);

            orderItem.setReturnedQuantity(orderItem.getReturnedQuantity() + itemRequest.quantity());
            if (orderItem.getSerial() != null) {
                orderItem.getSerial().setStatus(returnItem.getSerialDisposition() == ReturnSerialDisposition.DAMAGED ? SerialStatus.DAMAGED : SerialStatus.RETURNED);
                orderItem.getSerial().setReservedOrderNo(null);
                orderItem.getSerial().setReservationUntil(null);
            }
            if (returnItem.getSerialDisposition() == ReturnSerialDisposition.RETURNED) {
                inventoryService.returnStock(order.getBranchId(), orderItem.getProduct(), itemRequest.quantity(), salesReturn.getReturnNo());
            }
            returnAmount = returnAmount.add(returnItem.getLineAmount());
        }

        BigDecimal refundAmount = nullToZero(request.refundAmount());
        if (refundAmount.compareTo(returnAmount) > 0) {
            throw new BusinessException("Refund amount cannot be greater than return amount");
        }
        if (refundAmount.compareTo(order.getPaidAmount()) > 0) {
            throw new BusinessException("Refund amount cannot be greater than paid amount");
        }
        salesReturn.setReturnAmount(returnAmount);
        salesReturn.setRefundAmount(refundAmount);
        salesReturn.setStatus(SalesReturnStatus.COMPLETED);
        SalesReturn saved = returnRepository.save(salesReturn);

        Customer customer = customerService.get(order.getCustomerId());
        if (refundAmount.compareTo(BigDecimal.ZERO) > 0) {
            accountingService.recordSalesRefund(
                    saved.getReturnNo(),
                    saved.getReturnDate(),
                    customer.getId(),
                    customer.getFullName(),
                    refundAmount,
                    request.refundMethod() == null ? PaymentMethod.CASH : request.refundMethod(),
                    request.bankAccountId(),
                    "Refund sales return " + saved.getReturnNo()
            );
            order.setPaidAmount(order.getPaidAmount().subtract(refundAmount));
            order.setPaymentStatus(paymentStatus(order.getTotalAmount(), order.getPaidAmount()));
            audit(AuditAction.REFUND, AuditModule.SALES, "SalesReturn", saved.getId(), null, saved.getReturnNo());
        }

        boolean allReturned = order.getItems().stream().allMatch(item -> item.getReturnedQuantity() >= item.getQuantity());
        if (allReturned) {
            order.setStatus(SalesOrderStatus.RETURNED);
            order.setReturnedAt(OffsetDateTime.now());
        }

        // Đảo bút toán doanh thu + giá vốn (chống ghi trùng bằng flag accountingReversed)
        if (!saved.isAccountingReversed()) {
            BigDecimal returnCostAmount = saved.getItems().stream()
                    .map(item -> item.getProduct().getImportPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            accountingService.recordSalesReturnReversal(
                    saved.getReturnNo(),
                    saved.getReturnDate(),
                    customer.getId(),
                    customer.getFullName(),
                    saved.getReturnAmount(),
                    returnCostAmount,
                    "Sales return reversal " + saved.getReturnNo()
            );
            saved.setAccountingReversed(true);
            saved.setReversalEntryNo(saved.getReturnNo() + "-REV");
        }

        audit(AuditAction.CREATE_RETURN, AuditModule.SALES, "SalesReturn", saved.getId(), null, saved.getReturnNo());
        return SalesReturnResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<SalesReturnResponse> returns(Long branchId, int page, int pageSize) {
        Long scopedBranchId = branchSecurity.scopedBranchId(branchId);
        if (scopedBranchId == null) {
            return PageResponse.from(returnRepository.findAll(PageRequest.of(page, pageSize)).map(SalesReturnResponse::from));
        }
        return PageResponse.from(returnRepository.findByBranchId(scopedBranchId, PageRequest.of(page, pageSize)).map(SalesReturnResponse::from));
    }

    @Transactional(readOnly = true)
    public VoucherPreviewResponse previewVoucher(VoucherPreviewRequest request) {
        BigDecimal discount = validateVoucher(request.voucherCode(), request.branchId(), request.subtotal(), request.productIds(), false);
        return new VoucherPreviewResponse(request.voucherCode().trim().toUpperCase(Locale.ROOT), discount, request.subtotal().subtract(discount), "Voucher is valid");
    }

    @Transactional
    public int releaseExpiredReservations() {
        List<ProductSerial> expired = serialRepository.findByStatusAndReservationUntilBefore(SerialStatus.RESERVED, OffsetDateTime.now());
        for (ProductSerial serial : expired) {
            serial.setStatus(SerialStatus.IN_STOCK);
            serial.setReservedOrderNo(null);
            serial.setReservationUntil(null);
        }
        return expired.size();
    }

    @Scheduled(fixedDelay = 300000)
    @Transactional
    public void releaseExpiredReservationsJob() {
        releaseExpiredReservations();
    }

    private void confirmOrder(SalesOrder order, SalesOrderStatusRequest request, boolean audit) {
        if (order.getStatus() == SalesOrderStatus.CANCELLED || order.getStatus() == SalesOrderStatus.RETURNED) {
            throw new BusinessException("Order cannot be confirmed in status " + order.getStatus());
        }
        if (order.getStatus() == SalesOrderStatus.DRAFT) {
            order.setConfirmedAt(OffsetDateTime.now());
        }
        if (request != null && request.reservationUntil() != null) {
            order.setReservationUntil(request.reservationUntil());
        }
        if (order.getReservationUntil() == null) {
            order.setReservationUntil(OffsetDateTime.now().plusMinutes(DEFAULT_RESERVATION_MINUTES));
        }
        recordOrderAccounting(order);
        updateOrderStatusFromPayment(order);
        if (order.getPaidAmount().compareTo(order.getTotalAmount()) >= 0) {
            issueStockIfNeeded(order);
        } else {
            reserveSerials(order);
        }
        if (audit) {
            audit(AuditAction.UPDATE_ORDER, AuditModule.SALES, "SalesOrder", order.getId(), null, order.getStatus().name());
        }
    }

    private SalesPayment addPaymentInternal(SalesOrder order, Customer customer, PaymentEntryRequest request, boolean installmentDisbursement) {
        if (order.getStatus() == SalesOrderStatus.CANCELLED || order.getStatus() == SalesOrderStatus.RETURNED) {
            throw new BusinessException("Cannot add payment to order in status " + order.getStatus());
        }
        if (order.getStatus() == SalesOrderStatus.WAITING_DISCOUNT_APPROVAL) {
            throw new BusinessException("Order is waiting for discount approval");
        }
        recordOrderAccounting(order);
        BigDecimal amount = request.amount();
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Payment amount must be greater than zero");
        }
        if (order.getPaidAmount().add(amount).compareTo(order.getTotalAmount()) > 0) {
            throw new BusinessException("Payment exceeds remaining amount");
        }

        String paymentNo = hasText(request.referenceNo()) ? request.referenceNo() : number("PAY");
        SalesPayment payment = new SalesPayment();
        payment.setOrder(order);
        payment.setPaymentMethod(request.paymentMethod());
        payment.setAmount(amount);
        payment.setPaymentDate(request.paymentDate() == null ? LocalDate.now() : request.paymentDate());
        payment.setBankAccountId(request.bankAccountId());
        payment.setReferenceNo(paymentNo);
        payment.setNote(request.note());
        payment.setInstallmentDisbursement(installmentDisbursement);
        SalesPayment saved = paymentRepository.save(payment);

        accountingService.createReceipt(new CreateReceiptRequest(
                paymentNo,
                payment.getPaymentDate(),
                customer.getId(),
                customer.getFullName(),
                amount,
                request.paymentMethod(),
                request.bankAccountId(),
                order.getOrderNo(),
                "Collect sales order " + order.getOrderNo()
        ));

        order.setPaidAmount(order.getPaidAmount().add(amount));
        order.setPaymentStatus(paymentStatus(order.getTotalAmount(), order.getPaidAmount()));
        updateOrderStatusFromPayment(order);
        if (order.getPaidAmount().compareTo(order.getTotalAmount()) >= 0) {
            issueStockIfNeeded(order);
        } else {
            reserveSerials(order);
        }
        audit(AuditAction.CREATE_PAYMENT, AuditModule.ACCOUNTING, "SalesPayment", saved.getId(), null, paymentNo);
        return saved;
    }

    private Invoice createInvoiceEntity(SalesOrder order, CreateInvoiceRequest request) {
        Invoice existing = invoiceRepository.findByOrder_Id(order.getId()).orElse(null);
        if (existing != null) {
            return existing;
        }
        recordOrderAccounting(order);
        Invoice invoice = new Invoice();
        invoice.setInvoiceNo(number("INV"));
        invoice.setOrder(order);
        invoice.setInvoiceDate(order.getOrderDate());
        invoice.setTotalAmount(order.getTotalAmount());
        invoice.setVatAmount(order.getTotalAmount().divide(BigDecimal.valueOf(11), 2, RoundingMode.HALF_UP));
        invoice.setTemplateCode(hasText(request == null ? null : request.templateCode()) ? request.templateCode() : "DEFAULT");
        invoice.setTemplateSnapshot(settingService.getSettings().invoiceTemplate());
        invoice.setElectronicInvoiceStatus("READY");
        invoice.setStatus(request == null || request.status() == null ? InvoiceStatus.DRAFT : request.status());
        Invoice saved = invoiceRepository.save(invoice);
        audit(AuditAction.CREATE_INVOICE, AuditModule.SALES, "Invoice", saved.getId(), null, saved.getInvoiceNo());
        if (saved.getStatus() == InvoiceStatus.ISSUED) {
            issueInvoiceEntity(saved);
        }
        return saved;
    }

    private void issueInvoiceEntity(Invoice invoice) {
        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new BusinessException("Cancelled invoice cannot be issued");
        }
        if (invoice.getStatus() != InvoiceStatus.ISSUED) {
            invoice.setStatus(InvoiceStatus.ISSUED);
            invoice.setIssuedAt(OffsetDateTime.now());
        } else if (invoice.getIssuedAt() == null) {
            invoice.setIssuedAt(OffsetDateTime.now());
        }
        createWarrantiesIfNeeded(invoice.getOrder());
        audit(AuditAction.ISSUE_INVOICE, AuditModule.SALES, "Invoice", invoice.getId(), null, invoice.getInvoiceNo());
    }

    private BigDecimal addOrderItems(SalesOrder order, List<CreateSalesOrderItemRequest> requests) {
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CreateSalesOrderItemRequest itemRequest : requests) {
            Product product = productService.get(itemRequest.productId());
            ProductSerial serial = resolveSerial(itemRequest.serialId(), product, order.getBranchId());
            int quantity = serial == null ? itemRequest.quantity() : 1;
            PricingDtos.EffectivePriceResponse effectivePrice = priceCalculationService.calculateEffectivePrice(product.getId(), order.getBranchId(), order.getCustomerId(), order.getOrderDate());
            BigDecimal unitPrice = itemRequest.unitPrice() == null ? effectivePrice.effectivePrice() : itemRequest.unitPrice();
            if (itemRequest.unitPrice() != null && unitPrice.compareTo(effectivePrice.effectivePrice()) < 0 && !hasAuthority("SALES_DISCOUNT_APPROVE")) {
                throw new AccessDeniedException("Changing price requires SALES_DISCOUNT_APPROVE");
            }
            if (itemRequest.unitPrice() != null && unitPrice.compareTo(effectivePrice.effectivePrice()) != 0) {
                audit(AuditAction.UPDATE_PRICE, AuditModule.SALES, "Product", product.getId(), effectivePrice.effectivePrice().toPlainString(), unitPrice.toPlainString());
            }
            SalesOrderItem item = new SalesOrderItem();
            item.setProduct(product);
            item.setSerial(serial);
            item.setWarehouse(serial == null ? null : serial.getWarehouse());
            item.setQuantity(quantity);
            item.setUnitPrice(unitPrice);
            item.setListPrice(effectivePrice.listPrice());
            item.setPricePolicyId(effectivePrice.policyId());
            item.setPricePolicyCode(effectivePrice.policyCode());
            item.setPricePolicyName(effectivePrice.policyName());
            item.setPolicyDiscountAmount(effectivePrice.policyDiscountAmount().multiply(BigDecimal.valueOf(quantity)));
            item.setLineTotal(unitPrice.multiply(BigDecimal.valueOf(quantity)));
            order.addItem(item);
            if (effectivePrice.policyId() != null) {
                audit(AuditAction.APPLY_PRICE_POLICY, AuditModule.PRICING, "PricePolicy", effectivePrice.policyId(), null, order.getOrderNo());
            }
            subtotal = subtotal.add(item.getLineTotal());
        }
        return subtotal;
    }

    private BigDecimal addQuotationItems(Quotation quotation, List<CreateQuotationItemRequest> requests) {
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CreateQuotationItemRequest itemRequest : requests) {
            Product product = productService.get(itemRequest.productId());
            ProductSerial serial = resolveSerial(itemRequest.serialId(), product, quotation.getBranchId());
            int quantity = serial == null ? itemRequest.quantity() : 1;
            PricingDtos.EffectivePriceResponse effectivePrice = priceCalculationService.calculateEffectivePrice(product.getId(), quotation.getBranchId(), quotation.getCustomerId(), quotation.getQuotationDate());
            BigDecimal unitPrice = itemRequest.unitPrice() == null ? effectivePrice.effectivePrice() : itemRequest.unitPrice();
            if (itemRequest.unitPrice() != null && unitPrice.compareTo(effectivePrice.effectivePrice()) < 0 && !hasAuthority("SALES_DISCOUNT_APPROVE")) {
                throw new AccessDeniedException("Changing price requires SALES_DISCOUNT_APPROVE");
            }
            QuotationItem item = new QuotationItem();
            item.setProduct(product);
            item.setSerial(serial);
            item.setQuantity(quantity);
            item.setUnitPrice(unitPrice);
            item.setLineTotal(unitPrice.multiply(BigDecimal.valueOf(quantity)));
            quotation.addItem(item);
            subtotal = subtotal.add(item.getLineTotal());
        }
        return subtotal;
    }

    private ProductSerial resolveSerial(Long serialId, Product product, Long branchId) {
        if (product.getCategory() == ProductCategory.ELECTRIC_MOTORBIKE && serialId == null) {
            throw new BusinessException("serialId is required for electric motorbike");
        }
        if (serialId == null) {
            return null;
        }
        ProductSerial serial = serialRepository.findWithLockById(serialId)
                .orElseThrow(() -> new BusinessException("Serial not found"));
        if (!serial.getProduct().getId().equals(product.getId())) {
            throw new BusinessException("Serial does not belong to selected product");
        }
        if (!serial.getBranchId().equals(branchId)) {
            throw new BusinessException("Serial belongs to another branch");
        }
        if (serial.getStatus() != SerialStatus.IN_STOCK) {
            throw new BusinessException("Serial is not available for sale");
        }
        return serial;
    }

    private void applyTotals(SalesOrder order, BigDecimal subtotal, BigDecimal discount) {
        BigDecimal afterDiscount = subtotal.subtract(discount);
        if (afterDiscount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Order total must be greater than zero");
        }
        // Tinh VAT: ap dung cho toan bo don hang (co the mo rong theo tung dong)
        BigDecimal vatRate = order.getVatRate() == null ? new java.math.BigDecimal("10.00") : order.getVatRate();
        BigDecimal vatAmount = afterDiscount.multiply(vatRate)
                .divide(new java.math.BigDecimal("100"), 0, java.math.RoundingMode.HALF_UP);
        BigDecimal total = afterDiscount.add(vatAmount);
        order.setSubtotal(subtotal);
        order.setDiscountAmount(discount);
        order.setVatRate(vatRate);
        order.setVatAmount(vatAmount);
        order.setTotalAmount(total);
        order.setPaymentStatus(paymentStatus(total, order.getPaidAmount()));
    }

    private void recordOrderAccounting(SalesOrder order) {
        if (order.isAccountingRecorded()) {
            return;
        }
        Customer customer = customerService.get(order.getCustomerId());
        accountingService.recordPaidSalesOrder(new RecordSalesPaymentRequest(
                order.getOrderNo(),
                order.getOrderDate(),
                customer.getId(),
                customer.getFullName(),
                order.getTotalAmount(),
                BigDecimal.ZERO,
                costAmount(order),
                PaymentMethod.CASH,
                null,
                "Sales order " + order.getOrderNo()
        ));
        order.setAccountingRecorded(true);
    }

    private void reserveSerials(SalesOrder order) {
        for (SalesOrderItem item : order.getItems()) {
            ProductSerial serial = item.getSerial();
            if (serial != null && serial.getStatus() == SerialStatus.IN_STOCK) {
                serial.setStatus(SerialStatus.RESERVED);
                serial.setReservedOrderNo(order.getOrderNo());
                serial.setReservationUntil(order.getReservationUntil());
            } else if (serial != null && serial.getStatus() == SerialStatus.RESERVED && order.getOrderNo().equals(serial.getReservedOrderNo())) {
                serial.setReservationUntil(order.getReservationUntil());
            }
        }
    }

    private void releaseOrderSerials(SalesOrder order) {
        for (SalesOrderItem item : order.getItems()) {
            ProductSerial serial = item.getSerial();
            if (serial != null && serial.getStatus() == SerialStatus.RESERVED && order.getOrderNo().equals(serial.getReservedOrderNo())) {
                serial.setStatus(SerialStatus.IN_STOCK);
                serial.setReservedOrderNo(null);
                serial.setReservationUntil(null);
            }
        }
    }

    private void issueStockIfNeeded(SalesOrder order) {
        if (order.isStockIssued()) {
            return;
        }
        for (SalesOrderItem item : order.getItems()) {
            ProductSerial serial = item.getSerial();
            if (serial != null && !isIssuableSerial(serial, order)) {
                throw new BusinessException("Serial is no longer available for order " + order.getOrderNo());
            }
            Warehouse warehouse = item.getWarehouse();
            if (warehouse == null) {
                inventoryService.decrease(order.getBranchId(), item.getProduct().getId(), item.getQuantity());
                inventoryService.recordSale(order.getBranchId(), item.getProduct(), item.getQuantity(), order.getOrderNo());
            } else {
                inventoryService.decrease(order.getBranchId(), warehouse.getId(), item.getProduct().getId(), item.getQuantity());
                inventoryService.recordSale(order.getBranchId(), warehouse.getId(), item.getProduct(), item.getQuantity(), order.getOrderNo());
            }
            if (serial != null) {
                serial.setStatus(SerialStatus.SOLD);
                serial.setReservedOrderNo(null);
                serial.setReservationUntil(null);
            }
        }
        order.setStockIssued(true);
    }

    private boolean isIssuableSerial(ProductSerial serial, SalesOrder order) {
        if (serial.getStatus() == SerialStatus.IN_STOCK) {
            return true;
        }
        return serial.getStatus() == SerialStatus.RESERVED && order.getOrderNo().equals(serial.getReservedOrderNo());
    }

    private void createWarrantiesIfNeeded(SalesOrder order) {
        if (order.isWarrantyCreated()) {
            return;
        }
        Customer customer = customerService.get(order.getCustomerId());
        String invoiceNo = invoiceRepository.findByOrder_Id(order.getId()).map(Invoice::getInvoiceNo).orElse(null);
        for (SalesOrderItem item : order.getItems()) {
            if (item.getSerial() != null && item.getProduct().getCategory() == ProductCategory.ELECTRIC_MOTORBIKE) {
                if (warrantyRepository.existsBySerialNumber(item.getSerial().getSerialNumber())) {
                    applySerialWarrantySaleMetadata(item, customer, order);
                    continue;
                }
                try {
                    WarrantyPolicy policy = warrantyPolicyRepository.findFirstByProductCategoryOrderByCreatedAtDesc(item.getProduct().getCategory()).orElse(null);
                    warrantyService.create(new CreateWarrantyRequest(
                            item.getSerial().getSerialNumber(),
                            item.getSerial().getId(),
                            policy == null ? null : policy.getId(),
                            customer.getId(),
                            customer.getFullName(),
                            invoiceNo,
                            order.getOrderDate(),
                            order.getOrderDate(),
                            order.getOrderDate().plusMonths(item.getProduct().getWarrantyMonths()),
                            order.getOrderDate().plusMonths(item.getProduct().getWarrantyMonths()),
                            order.getOrderDate().plusMonths(item.getProduct().getWarrantyMonths()),
                            order.getOrderDate().plusMonths(item.getProduct().getWarrantyMonths()),
                            "Vehicle, battery, motor, charger"
                    ));
                    applySerialWarrantySaleMetadata(item, customer, order);
                } catch (BusinessException ignored) {
                    // Warranty may already exist when an invoice is re-issued from imported data.
                }
            }
        }
        order.setWarrantyCreated(true);
    }

    private void applySerialWarrantySaleMetadata(SalesOrderItem item, Customer customer, SalesOrder order) {
        item.getSerial().setCurrentCustomerId(customer.getId());
        item.getSerial().setSoldDate(order.getOrderDate());
        item.getSerial().setWarrantyStartDate(order.getOrderDate());
        item.getSerial().setWarrantyEndDate(order.getOrderDate().plusMonths(item.getProduct().getWarrantyMonths()));
    }

    private BigDecimal resolveDiscount(Long branchId, BigDecimal subtotal, String voucherCode, List<Long> productIds, BigDecimal manualDiscount) {
        if (hasText(voucherCode)) {
            return validateVoucher(voucherCode, branchId, subtotal, productIds, false);
        }
        return manualDiscount;
    }

    private BigDecimal validateVoucher(String voucherCode, Long branchId, BigDecimal subtotal, List<Long> productIds, boolean consume) {
        Voucher voucher = voucherRepository.findByCodeIgnoreCase(voucherCode.trim())
                .orElseThrow(() -> new BusinessException("Voucher not found"));
        LocalDate today = LocalDate.now();
        if (!"ACTIVE".equalsIgnoreCase(voucher.getStatus())) {
            throw new BusinessException("Voucher is not active");
        }
        if (voucher.getStartDate() != null && today.isBefore(voucher.getStartDate())) {
            throw new BusinessException("Voucher is not started");
        }
        if (voucher.getEndDate() != null && today.isAfter(voucher.getEndDate())) {
            throw new BusinessException("Voucher is expired");
        }
        if (voucher.getUsageLimit() > 0 && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new BusinessException("Voucher usage limit reached");
        }
        if (subtotal.compareTo(voucher.getMinimumOrderAmount()) < 0) {
            throw new BusinessException("Order does not meet voucher minimum amount");
        }
        if (!matchesCsv(voucher.getApplicableBranchIds(), branchId)) {
            throw new BusinessException("Voucher is not applicable to this branch");
        }
        if (hasText(voucher.getApplicableProductIds()) && productIds.stream().noneMatch(productId -> matchesCsv(voucher.getApplicableProductIds(), productId))) {
            throw new BusinessException("Voucher is not applicable to selected products");
        }
        BigDecimal discount = "PERCENT".equalsIgnoreCase(voucher.getDiscountType())
                ? subtotal.multiply(voucher.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                : voucher.getDiscountValue();
        if (discount.compareTo(subtotal) > 0) {
            discount = subtotal;
        }
        if (consume) {
            voucher.setUsedCount(voucher.getUsedCount() + 1);
        }
        return discount;
    }

    private void consumeVoucher(SalesOrder order) {
        if (hasText(order.getVoucherCode()) && !order.isVoucherConsumed()) {
            validateVoucher(order.getVoucherCode(), order.getBranchId(), order.getSubtotal(), orderProductIds(order), true);
            order.setVoucherConsumed(true);
        }
    }

    private List<PaymentEntryRequest> normalizedPayments(CreateSalesOrderRequest request) {
        if (request.payments() != null && !request.payments().isEmpty()) {
            return request.payments();
        }
        BigDecimal paidAmount = nullToZero(request.paidAmount());
        if (paidAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return List.of();
        }
        return List.of(new PaymentEntryRequest(
                request.paymentMethod() == null ? PaymentMethod.CASH : request.paymentMethod(),
                paidAmount,
                request.bankAccountId(),
                request.orderDate(),
                null,
                "Initial POS payment"
        ));
    }

    private void validatePayments(BigDecimal totalAmount, List<PaymentEntryRequest> payments) {
        BigDecimal paid = payments.stream().map(PaymentEntryRequest::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (paid.compareTo(totalAmount) > 0) {
            throw new BusinessException("Payment amount cannot be greater than totalAmount");
        }
    }

    private void updateOrderStatusFromPayment(SalesOrder order) {
        order.setPaymentStatus(paymentStatus(order.getTotalAmount(), order.getPaidAmount()));
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            order.setStatus(SalesOrderStatus.PAID);
        } else if (order.getPaymentStatus() == PaymentStatus.PARTIAL) {
            order.setStatus(SalesOrderStatus.PARTIALLY_PAID);
        } else if (order.getStatus() == SalesOrderStatus.DRAFT) {
            order.setStatus(SalesOrderStatus.CONFIRMED);
        }
    }

    private PaymentStatus paymentStatus(BigDecimal total, BigDecimal paid) {
        if (paid.compareTo(BigDecimal.ZERO) <= 0) {
            return PaymentStatus.UNPAID;
        }
        if (paid.compareTo(total) < 0) {
            return PaymentStatus.PARTIAL;
        }
        return PaymentStatus.PAID;
    }

    private Customer validateCustomerBranch(Long customerId, Long branchId) {
        branchSecurity.requireBranchAccess(branchId);
        Customer customer = customerService.get(customerId);
        if (!customer.getBranchId().equals(branchId)) {
            throw new BusinessException("Customer belongs to another branch");
        }
        return customer;
    }

    private SalesOrder getOrderEntity(Long id) {
        return salesOrderRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Sales order not found: " + id));
    }

    private Quotation getQuotationEntity(Long id) {
        return quotationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Quotation not found: " + id));
    }

    private void expireQuotations() {
        quotationRepository.findByStatusAndValidUntilBefore(QuotationStatus.SENT, LocalDate.now())
                .forEach(quotation -> quotation.setStatus(QuotationStatus.EXPIRED));
        quotationRepository.findByStatusAndValidUntilBefore(QuotationStatus.DRAFT, LocalDate.now())
                .forEach(quotation -> quotation.setStatus(QuotationStatus.EXPIRED));
    }

    private BigDecimal costAmount(SalesOrder order) {
        return order.getItems().stream()
                .map(item -> item.getProduct().getImportPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<Long> orderProductIds(SalesOrder order) {
        return order.getItems().stream().map(item -> item.getProduct().getId()).distinct().toList();
    }

    private List<Long> quotationProductIds(Quotation quotation) {
        return quotation.getItems().stream().map(item -> item.getProduct().getId()).distinct().toList();
    }

    private OffsetDateTime resolveReservationUntil(OffsetDateTime requested, Integer minutes) {
        if (requested != null) {
            return requested;
        }
        int value = minutes == null || minutes <= 0 ? DEFAULT_RESERVATION_MINUTES : minutes;
        return OffsetDateTime.now().plusMinutes(value);
    }

    /**
     * Neu discount vuot nguong (maxDiscountPct) va nguoi dung khong co quyen APPROVE:
     *   - Dat trang thai don hang -> WAITING_DISCOUNT_APPROVAL
     *   - Khong throw exception (don van duoc luu, cho quan ly duyet)
     * Neu co quyen APPROVE hoac discount hop le: khong lam gi.
     */
    private void checkAndMarkDiscountApproval(SalesOrder order, BigDecimal manualDiscount) {
        BigDecimal discount = nullToZero(manualDiscount);
        BigDecimal subtotal = order.getSubtotal();
        if (subtotal == null || subtotal.compareTo(BigDecimal.ZERO) == 0) return;
        if (discount == null || discount.compareTo(BigDecimal.ZERO) <= 0) return;
        BigDecimal discountPct = discount.multiply(new java.math.BigDecimal("100"))
                .divide(subtotal, 2, java.math.RoundingMode.HALF_UP);
        BigDecimal threshold = order.getMaxDiscountPct() != null ? order.getMaxDiscountPct() : new java.math.BigDecimal("5");
        if (discountPct.compareTo(threshold) > 0 && !hasAuthority("SALES_DISCOUNT_APPROVE")) {
            order.setDiscountApprovalStatus(DiscountApprovalStatus.PENDING);
            order.setStatus(SalesOrderStatus.WAITING_DISCOUNT_APPROVAL);
        }
    }

    /** @deprecated Replaced by checkAndMarkDiscountApproval(SalesOrder) */
    private void requireDiscountApprovalIfNeeded(BigDecimal discountAmount, String voucherCode, List<?> items) {
        // Legacy check kept for backward compat — discount approval now handled via entity status
    }

    private boolean hasAuthority(String authority) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(item -> authority.equals(item.getAuthority()));
    }

    private boolean matchesCsv(String csv, Long value) {
        if (!hasText(csv)) {
            return true;
        }
        String expected = String.valueOf(value);
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(item -> !item.isEmpty())
                .anyMatch(expected::equals);
    }

    private BigDecimal nullToZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String blankToNull(String value) {
        return hasText(value) ? value.trim() : null;
    }

    private String blankToEmpty(String value) {
        return hasText(value) ? value.trim() : "";
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private PageRequest listPageRequest(int page, int pageSize) {
        int safePage = Math.max(page, 0);
        int safePageSize = Math.min(Math.max(pageSize, 1), 100);
        return PageRequest.of(safePage, safePageSize, Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id")));
    }

    private String number(String prefix) {
        return prefix + "-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
    }

    private void audit(AuditAction action, AuditModule module, String entityType, Long entityId, String oldValue, String newValue) {
        auditLogService.record(new CreateAuditLogRequest(
                branchSecurity.currentUser().getUsername(),
                action,
                module,
                entityType,
                entityId == null ? null : entityId.toString(),
                oldValue,
                newValue,
                null,
                null
        ));
    }

}

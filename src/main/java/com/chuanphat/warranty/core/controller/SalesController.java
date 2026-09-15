package com.chuanphat.warranty.core.controller;

import com.chuanphat.warranty.audit.annotation.Audited;
import com.chuanphat.warranty.audit.enums.AuditAction;
import com.chuanphat.warranty.audit.enums.AuditModule;
import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.core.dto.ConvertQuotationRequest;
import com.chuanphat.warranty.core.dto.CreateInstallmentRequest;
import com.chuanphat.warranty.core.dto.CreateInvoiceRequest;
import com.chuanphat.warranty.core.dto.CreateQuotationRequest;
import com.chuanphat.warranty.core.dto.CreateSalesOrderRequest;
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
import com.chuanphat.warranty.core.dto.UpdateInstallmentStatusRequest;
import com.chuanphat.warranty.core.dto.VoucherPreviewRequest;
import com.chuanphat.warranty.core.dto.VoucherPreviewResponse;
import com.chuanphat.warranty.core.service.SalesService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sales")
public class SalesController {
    private final SalesService service;

    public SalesController(SalesService service) {
        this.service = service;
    }

    @GetMapping("/orders")
    @PreAuthorize("hasAuthority('SALES_VIEW')")
    public PageResponse<SalesOrderListResponse> listOrders(@RequestParam(required = false) Long branchId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int pageSize) {
        return service.list(branchId, page, pageSize);
    }

    @GetMapping("/orders/{id}")
    @PreAuthorize("hasAuthority('SALES_VIEW')")
    public SalesOrderResponse getOrder(@PathVariable Long id) {
        return service.getOrder(id);
    }

    @PostMapping("/orders")
    @PreAuthorize("hasAuthority('SALES_CREATE')")
    @Audited(action = AuditAction.CREATE_ORDER, module = AuditModule.SALES, entityType = "SalesOrder")
    public SalesOrderResponse createOrder(@Valid @RequestBody CreateSalesOrderRequest request) {
        return service.create(request);
    }

    @PatchMapping("/orders/{id}/confirm")
    @PreAuthorize("hasAuthority('SALES_UPDATE')")
    @Audited(action = AuditAction.UPDATE_ORDER, module = AuditModule.SALES, entityType = "SalesOrder", entityIdParam = "id")
    public SalesOrderResponse confirm(@PathVariable Long id, @RequestBody(required = false) SalesOrderStatusRequest request) {
        return service.confirm(id, request);
    }

    @PatchMapping("/orders/{id}/cancel")
    @PreAuthorize("hasAuthority('SALES_CANCEL')")
    @Audited(action = AuditAction.CANCEL_ORDER, module = AuditModule.SALES, entityType = "SalesOrder", entityIdParam = "id")
    public SalesOrderResponse cancel(@PathVariable Long id, @RequestBody(required = false) SalesOrderStatusRequest request) {
        return service.cancel(id, request);
    }

    @PatchMapping("/orders/{id}/deliver")
    @PreAuthorize("hasAuthority('SALES_UPDATE')")
    @Audited(action = AuditAction.UPDATE_ORDER, module = AuditModule.SALES, entityType = "SalesOrder", entityIdParam = "id")
    public SalesOrderResponse deliver(@PathVariable Long id) {
        return service.deliver(id);
    }

    @PostMapping("/orders/{id}/payments")
    @PreAuthorize("hasAuthority('SALES_UPDATE')")
    @Audited(action = AuditAction.UPDATE_ORDER, module = AuditModule.SALES, entityType = "SalesPayment", entityIdParam = "id")
    public SalesPaymentResponse addPayment(@PathVariable Long id, @Valid @RequestBody PaymentEntryRequest request) {
        return service.addPayment(id, request);
    }

    @GetMapping("/orders/{id}/payments")
    @PreAuthorize("hasAuthority('SALES_VIEW')")
    public List<SalesPaymentResponse> paymentHistory(@PathVariable Long id) {
        return service.paymentHistory(id);
    }

    @PostMapping("/orders/{id}/installments")
    @PreAuthorize("hasAuthority('SALES_CREATE')")
    @Audited(action = AuditAction.CREATE_INSTALLMENT, module = AuditModule.SALES, entityType = "InstallmentApplication", entityIdParam = "id")
    public InstallmentResponse createInstallment(@PathVariable Long id, @Valid @RequestBody CreateInstallmentRequest request) {
        return service.createInstallment(id, request);
    }

    @GetMapping("/orders/{id}/installments")
    @PreAuthorize("hasAuthority('SALES_VIEW')")
    public List<InstallmentResponse> installments(@PathVariable Long id) {
        return service.installments(id);
    }

    @PatchMapping("/installments/{id}/status")
    @PreAuthorize("hasAuthority('SALES_UPDATE')")
    @Audited(action = AuditAction.UPDATE_INSTALLMENT, module = AuditModule.SALES, entityType = "InstallmentApplication", entityIdParam = "id")
    public InstallmentResponse updateInstallmentStatus(@PathVariable Long id, @Valid @RequestBody UpdateInstallmentStatusRequest request) {
        return service.updateInstallmentStatus(id, request);
    }

    @PostMapping("/orders/{id}/invoice")
    @PreAuthorize("hasAuthority('INVOICE_ISSUE')")
    @Audited(action = AuditAction.CREATE_INVOICE, module = AuditModule.SALES, entityType = "Invoice", entityIdParam = "id")
    public InvoiceResponse createInvoice(@PathVariable Long id, @RequestBody(required = false) CreateInvoiceRequest request) {
        return service.createInvoice(id, request);
    }

    @PatchMapping("/invoices/{id}/issue")
    @PreAuthorize("hasAuthority('INVOICE_ISSUE')")
    @Audited(action = AuditAction.ISSUE_INVOICE, module = AuditModule.SALES, entityType = "Invoice", entityIdParam = "id")
    public InvoiceResponse issueInvoice(@PathVariable Long id) {
        return service.issueInvoice(id);
    }

    @GetMapping("/invoices/{id}")
    @PreAuthorize("hasAuthority('SALES_VIEW')")
    public InvoiceResponse getInvoice(@PathVariable Long id) {
        return service.getInvoice(id);
    }

    @GetMapping("/invoices/{id}/pdf")
    @PreAuthorize("hasAnyAuthority('INVOICE_EXPORT','SALES_VIEW')")
    public ResponseEntity<byte[]> invoicePdf(@PathVariable Long id) {
        byte[] pdf = service.invoicePdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=invoice-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/orders/{id}/pdf")
    @PreAuthorize("hasAuthority('INVOICE_EXPORT')")
    public ResponseEntity<byte[]> salesOrderPdf(@PathVariable Long id) {
        byte[] pdf = service.salesOrderPdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=sales-order-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/quotations")
    @PreAuthorize("hasAuthority('SALES_VIEW')")
    public PageResponse<QuotationListResponse> quotations(@RequestParam(required = false) Long branchId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int pageSize) {
        return service.quotations(branchId, page, pageSize);
    }

    @GetMapping("/quotations/{id}")
    @PreAuthorize("hasAuthority('SALES_VIEW')")
    public QuotationResponse getQuotation(@PathVariable Long id) {
        return service.getQuotation(id);
    }

    @GetMapping("/quotations/{id}/pdf")
    @PreAuthorize("hasAuthority('INVOICE_EXPORT')")
    public ResponseEntity<byte[]> quotationPdf(@PathVariable Long id) {
        byte[] pdf = service.quotationPdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=quotation-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @PostMapping("/quotations")
    @PreAuthorize("hasAuthority('SALES_CREATE')")
    @Audited(action = AuditAction.CREATE_QUOTATION, module = AuditModule.SALES, entityType = "Quotation")
    public QuotationResponse createQuotation(@Valid @RequestBody CreateQuotationRequest request) {
        return service.createQuotation(request);
    }

    @PatchMapping("/quotations/{id}/status")
    @PreAuthorize("hasAuthority('SALES_UPDATE')")
    @Audited(action = AuditAction.UPDATE_QUOTATION, module = AuditModule.SALES, entityType = "Quotation", entityIdParam = "id")
    public QuotationResponse updateQuotationStatus(@PathVariable Long id, @Valid @RequestBody QuotationStatusRequest request) {
        return service.updateQuotationStatus(id, request);
    }

    @PostMapping("/quotations/{id}/convert")
    @PreAuthorize("hasAuthority('SALES_CREATE')")
    @Audited(action = AuditAction.CREATE_ORDER, module = AuditModule.SALES, entityType = "SalesOrder", entityIdParam = "id")
    public SalesOrderResponse convertQuotation(@PathVariable Long id, @Valid @RequestBody ConvertQuotationRequest request) {
        return service.convertQuotation(id, request);
    }

    @GetMapping("/returns")
    @PreAuthorize("hasAuthority('SALES_RETURN')")
    public PageResponse<SalesReturnResponse> returns(@RequestParam(required = false) Long branchId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int pageSize) {
        return service.returns(branchId, page, pageSize);
    }

    @PostMapping("/returns")
    @PreAuthorize("hasAuthority('SALES_RETURN')")
    @Audited(action = AuditAction.CREATE_RETURN, module = AuditModule.SALES, entityType = "SalesReturn")
    public SalesReturnResponse createReturn(@Valid @RequestBody CreateSalesReturnRequest request) {
        return service.createReturn(request);
    }

    @PostMapping("/vouchers/preview")
    @PreAuthorize("hasAuthority('SALES_VIEW')")
    public VoucherPreviewResponse previewVoucher(@Valid @RequestBody VoucherPreviewRequest request) {
        return service.previewVoucher(request);
    }

    @PostMapping("/reservations/release-expired")
    @PreAuthorize("hasAuthority('SALES_UPDATE')")
    @Audited(action = AuditAction.UPDATE_ORDER, module = AuditModule.SALES, entityType = "InventoryReservation")
    public Map<String, Integer> releaseExpiredReservations() {
        return Map.of("released", service.releaseExpiredReservations());
    }

    // ── Discount Approval ──

    @PatchMapping("/orders/{id}/approve-discount")
    @PreAuthorize("hasAuthority('SALES_DISCOUNT_APPROVE')")
    @Audited(action = AuditAction.UPDATE_ORDER, module = AuditModule.SALES, entityType = "SalesOrder", entityIdParam = "id")
    public SalesOrderResponse approveDiscount(@PathVariable Long id,
            @RequestBody(required = false) DiscountApprovalRequest request) {
        return service.approveDiscount(id, request == null ? null : request.note());
    }

    @PatchMapping("/orders/{id}/reject-discount")
    @PreAuthorize("hasAuthority('SALES_DISCOUNT_APPROVE')")
    @Audited(action = AuditAction.UPDATE_ORDER, module = AuditModule.SALES, entityType = "SalesOrder", entityIdParam = "id")
    public SalesOrderResponse rejectDiscount(@PathVariable Long id,
            @RequestBody(required = false) DiscountApprovalRequest request) {
        return service.rejectDiscount(id, request == null ? null : request.note());
    }

    @PatchMapping("/orders/{id}/approve-credit")
    @PreAuthorize("hasAuthority('SALES_CREDIT_APPROVE')")
    @Audited(action = AuditAction.UPDATE_ORDER, module = AuditModule.SALES, entityType = "SalesOrder", entityIdParam = "id")
    public SalesOrderResponse approveCredit(@PathVariable Long id,
            @RequestBody(required = false) CreditApprovalRequest request) {
        return service.approveCredit(id, request == null ? null : request.note());
    }

    @PatchMapping("/orders/{id}/reject-credit")
    @PreAuthorize("hasAuthority('SALES_CREDIT_APPROVE')")
    @Audited(action = AuditAction.UPDATE_ORDER, module = AuditModule.SALES, entityType = "SalesOrder", entityIdParam = "id")
    public SalesOrderResponse rejectCredit(@PathVariable Long id,
            @RequestBody(required = false) CreditApprovalRequest request) {
        return service.rejectCredit(id, request == null ? null : request.note());
    }

    record DiscountApprovalRequest(String note) {}
    record CreditApprovalRequest(String note) {}
}

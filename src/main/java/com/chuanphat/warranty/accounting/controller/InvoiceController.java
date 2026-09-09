package com.chuanphat.warranty.accounting.controller;

import com.chuanphat.warranty.accounting.dto.InvoiceDtos.*;
import com.chuanphat.warranty.accounting.service.InvoiceInputService;
import com.chuanphat.warranty.accounting.service.InvoiceService;
import com.chuanphat.warranty.accounting.service.VATReportService;
import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.accounting.service.InvoicePDFService;
import com.chuanphat.warranty.accounting.entity.Invoice;
import com.chuanphat.warranty.accounting.repository.InvoiceRepository;
import com.chuanphat.warranty.exception.NotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/accounting/invoices")
@PreAuthorize("hasAnyRole('ADMIN')")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final InvoiceInputService invoiceInputService;
    private final VATReportService vatReportService;
    private final InvoicePDFService invoicePDFService;
    private final InvoiceRepository invoiceRepository;

    public InvoiceController(InvoiceService invoiceService, InvoiceInputService invoiceInputService,
                             VATReportService vatReportService, InvoicePDFService invoicePDFService,
                             InvoiceRepository invoiceRepository) {
        this.invoiceService = invoiceService;
        this.invoiceInputService = invoiceInputService;
        this.vatReportService = vatReportService;
        this.invoicePDFService = invoicePDFService;
        this.invoiceRepository = invoiceRepository;
    }

    // --- Output Invoices (Bán hàng) ---
    @GetMapping("/output")
    public PageResponse<InvoiceDto> listOutputInvoices(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return invoiceService.listOutputInvoices(branchId, status, page, size);
    }

    @PostMapping("/output")
    public InvoiceDto createOutputInvoice(@Valid @RequestBody CreateInvoiceRequest request) {
        return invoiceService.createOutputInvoice(request);
    }

    @GetMapping("/output/{id}")
    public InvoiceDto getOutputInvoice(@PathVariable Long id) {
        return invoiceService.getInvoice(id);
    }

    @PostMapping("/output/{id}/issue")
    public InvoiceDto issueInvoice(@PathVariable Long id, @Valid @RequestBody IssueInvoiceRequest request) {
        return invoiceService.issueInvoice(id, request);
    }

    @GetMapping("/output/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        Invoice invoice = invoiceRepository.findById(id).orElseThrow(() -> new NotFoundException("Not found"));
        byte[] pdfBytes = invoicePDFService.generatePdf(invoice);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Invoice_" + id + ".pdf");
        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }

    // --- Input Invoices (Mua hàng) ---
    @GetMapping("/input")
    public PageResponse<InvoiceInputDto> listInputInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return invoiceInputService.listInputInvoices(page, size);
    }

    @PostMapping("/input")
    public InvoiceInputDto createInputInvoice(@Valid @RequestBody CreateInvoiceInputRequest request) {
        return invoiceInputService.createInputInvoice(request);
    }

    @GetMapping("/input/{id}")
    public InvoiceInputDto getInputInvoice(@PathVariable Long id) {
        return invoiceInputService.getInvoice(id);
    }

    @PostMapping("/input/{id}/approve")
    public InvoiceInputDto approveInputInvoice(@PathVariable Long id) {
        return invoiceInputService.approveInputInvoice(id);
    }

    // --- VAT Report ---
    @GetMapping("/reports/vat")
    public VatReportResponse getVatReport(
            @RequestParam(required = false) Long branchId,
            @RequestParam int year,
            @RequestParam int month) {
        return vatReportService.generateVatReport(branchId, year, month);
    }
}


package com.chuanphat.warranty.sales.service;

import com.chuanphat.warranty.core.entity.TaxInvoice;
import com.chuanphat.warranty.core.repository.CustomerRepository;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import com.chuanphat.warranty.core.repository.TaxInvoiceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Service
@Transactional
public class TaxInvoiceService {
    private final TaxInvoiceRepository taxInvoiceRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final CustomerRepository customerRepository;

    public TaxInvoiceService(TaxInvoiceRepository taxInvoiceRepository, SalesOrderRepository salesOrderRepository, CustomerRepository customerRepository) {
        this.taxInvoiceRepository = taxInvoiceRepository;
        this.salesOrderRepository = salesOrderRepository;
        this.customerRepository = customerRepository;
    }

    public Page<TaxInvoice> listInvoices(Long branchId, String status, LocalDate from, LocalDate to, Pageable pageable) {
        return taxInvoiceRepository.findByBranchId(branchId, pageable);
    }

    public TaxInvoice getById(Long id) {
        return taxInvoiceRepository.findById(id).orElseThrow(() -> new RuntimeException("Invoice not found: " + id));
    }

    public TaxInvoice createFromOrder(Long orderId, Long branchId, String createdBy) {
        TaxInvoice invoice = new TaxInvoice();
        invoice.setInvoiceNo("HD" + branchId + "-" + System.currentTimeMillis());
        invoice.setBranchId(branchId);
        invoice.setInvoiceDate(LocalDate.now());
        invoice.setIssueStatus("NOT_ISSUED");
        invoice.setAssemblyStatus("READY");
        invoice.setStatus("DRAFT");
        invoice.setCreatedBy(createdBy);
        return taxInvoiceRepository.save(invoice);
    }

    public TaxInvoice issueInvoice(Long invoiceId) {
        TaxInvoice invoice = getById(invoiceId);
        invoice.setIssueStatus("ISSUED");
        invoice.setIssuedAt(OffsetDateTime.now());
        invoice.setTaxAuthorityCode("CQT-" + System.currentTimeMillis());
        invoice.setStatus("ISSUED");
        return taxInvoiceRepository.save(invoice);
    }

    public TaxInvoice cancelInvoice(Long invoiceId, String reason) {
        TaxInvoice invoice = getById(invoiceId);
        invoice.setStatus("CANCELLED");
        invoice.setCancelledAt(OffsetDateTime.now());
        invoice.setInvalidHandling(reason);
        return taxInvoiceRepository.save(invoice);
    }
}

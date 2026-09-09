package com.chuanphat.warranty.sales.service;

import com.chuanphat.warranty.core.entity.Quotation;
import com.chuanphat.warranty.core.enums.QuotationStatus;
import com.chuanphat.warranty.core.repository.CustomerRepository;
import com.chuanphat.warranty.core.repository.QuotationItemRepository;
import com.chuanphat.warranty.core.repository.QuotationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Service
@Transactional
public class QuotationService {
    private final QuotationRepository quotationRepository;
    private final QuotationItemRepository quotationItemRepository;
    private final CustomerRepository customerRepository;

    public QuotationService(QuotationRepository quotationRepository, QuotationItemRepository quotationItemRepository, CustomerRepository customerRepository) {
        this.quotationRepository = quotationRepository;
        this.quotationItemRepository = quotationItemRepository;
        this.customerRepository = customerRepository;
    }

    public Page<Quotation> listQuotations(Long branchId, String status, LocalDate from, LocalDate to, String keyword, Pageable pageable) {
        return quotationRepository.findByBranchId(branchId, pageable);
    }

    public Quotation getById(Long id) {
        return quotationRepository.findById(id).orElseThrow(() -> new RuntimeException("Quotation not found: " + id));
    }

    public Quotation createQuotation(Map<String, Object> req, String createdBy, Long branchId) {
        Quotation quotation = new Quotation();
        quotation.setQuotationNo("BG" + branchId + "-" + System.currentTimeMillis());
        quotation.setBranchId(branchId);
        quotation.setCustomerId(Long.valueOf(req.getOrDefault("customerId", 1L).toString()));
        quotation.setEmployeeId(1L);
        quotation.setQuotationDate(LocalDate.now());
        quotation.setValidUntil(LocalDate.now().plusDays(30));
        quotation.setStatus(QuotationStatus.DRAFT);
        return quotationRepository.save(quotation);
    }

    public Quotation updateStatus(Long id, String status) {
        Quotation quotation = getById(id);
        quotation.setStatus(QuotationStatus.valueOf(status));
        return quotationRepository.save(quotation);
    }
}

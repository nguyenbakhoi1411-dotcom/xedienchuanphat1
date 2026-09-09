package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.TaxInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaxInvoiceRepository extends JpaRepository<TaxInvoice, Long> {
    Page<TaxInvoice> findByBranchId(Long branchId, Pageable pageable);
    Optional<TaxInvoice> findByInvoiceNo(String invoiceNo);
    Page<TaxInvoice> findByStatus(String status, Pageable pageable);
    Page<TaxInvoice> findByBranchIdAndStatus(Long branchId, String status, Pageable pageable);
    long countByCustomerId(Long customerId);
}

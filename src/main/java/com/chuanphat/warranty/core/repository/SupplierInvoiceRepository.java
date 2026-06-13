package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.SupplierInvoice;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierInvoiceRepository extends JpaRepository<SupplierInvoice, Long> {
    Page<SupplierInvoice> findBySupplier_Id(Long supplierId, Pageable pageable);
    Page<SupplierInvoice> findByBranchId(Long branchId, Pageable pageable);
    Optional<SupplierInvoice> findByReceiptId(Long receiptId);
    boolean existsByInvoiceNoIgnoreCase(String invoiceNo);
}

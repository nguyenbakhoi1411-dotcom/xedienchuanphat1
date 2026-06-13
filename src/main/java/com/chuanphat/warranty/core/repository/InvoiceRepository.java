package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.Invoice;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByOrder_Id(Long orderId);

    Optional<Invoice> findByInvoiceNo(String invoiceNo);
}

package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {
    List<InvoiceItem> findByInvoiceIdOrderByThuTuAsc(Long invoiceId);
}

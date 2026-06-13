package com.chuanphat.warranty.repository;

import com.chuanphat.warranty.entity.ServiceInvoice;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceInvoiceRepository extends JpaRepository<ServiceInvoice, Long> {
    Optional<ServiceInvoice> findByTicketId(Long ticketId);
}

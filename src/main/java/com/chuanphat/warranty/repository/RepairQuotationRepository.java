package com.chuanphat.warranty.repository;

import com.chuanphat.warranty.entity.RepairQuotation;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepairQuotationRepository extends JpaRepository<RepairQuotation, Long> {
    Optional<RepairQuotation> findTopByTicketIdOrderByCreatedAtDesc(Long ticketId);
}

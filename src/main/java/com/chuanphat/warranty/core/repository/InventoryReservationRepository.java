package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.InventoryReservation;
import com.chuanphat.warranty.core.enums.InventoryReservationStatus;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryReservationRepository extends JpaRepository<InventoryReservation, Long> {
    List<InventoryReservation> findByStatusAndExpiresAtBefore(InventoryReservationStatus status, OffsetDateTime expiresAt);

    List<InventoryReservation> findBySalesOrderNoAndStatus(String salesOrderNo, InventoryReservationStatus status);

    Page<InventoryReservation> findByBranchId(Long branchId, Pageable pageable);
}

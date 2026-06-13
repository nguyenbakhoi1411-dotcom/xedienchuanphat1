package com.chuanphat.warranty.repository;

import com.chuanphat.warranty.entity.Warranty;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WarrantyRepository extends JpaRepository<Warranty, Long> {
    Optional<Warranty> findBySerialNumber(String serialNumber);

    boolean existsBySerialNumber(String serialNumber);

    List<Warranty> findByCustomerIdOrderByEndDateAsc(Long customerId);

    /** Bảo hành sắp hết trong khoảng ngày (cho alert engine) */
    List<Warranty> findByEndDateBetween(LocalDate from, LocalDate to);
}


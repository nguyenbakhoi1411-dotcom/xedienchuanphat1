package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.InstallmentApplication;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InstallmentApplicationRepository extends JpaRepository<InstallmentApplication, Long> {
    List<InstallmentApplication> findByOrder_IdOrderByCreatedAtDesc(Long orderId);
}

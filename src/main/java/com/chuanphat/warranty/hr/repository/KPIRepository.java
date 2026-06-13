package com.chuanphat.warranty.hr.repository;

import com.chuanphat.warranty.hr.entity.KPI;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KPIRepository extends JpaRepository<KPI, Long> {
    Optional<KPI> findByEmployeeIdAndMonthAndYear(Long employeeId, Integer month, Integer year);
    List<KPI> findByMonthAndYearOrderByEmployeeId(Integer month, Integer year);
}

package com.chuanphat.warranty.hr.repository;

import com.chuanphat.warranty.hr.entity.Payroll;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    @EntityGraph(attributePaths = "items")
    Optional<Payroll> findWithItemsById(Long id);
    Optional<Payroll> findByEmployeeIdAndMonthAndYear(Long employeeId, Integer month, Integer year);
    List<Payroll> findByMonthAndYearOrderByEmployeeId(Integer month, Integer year);
}

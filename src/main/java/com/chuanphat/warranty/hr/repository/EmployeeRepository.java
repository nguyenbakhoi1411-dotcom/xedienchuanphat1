package com.chuanphat.warranty.hr.repository;

import com.chuanphat.warranty.hr.entity.Employee;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByBranchIdOrderByFullName(Long branchId);
    List<Employee> findByStatusOrderByFullName(String status);
    Optional<Employee> findByEmployeeCodeIgnoreCase(String employeeCode);
}

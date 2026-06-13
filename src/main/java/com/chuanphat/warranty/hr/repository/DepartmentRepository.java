package com.chuanphat.warranty.hr.repository;

import com.chuanphat.warranty.hr.entity.Department;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByActiveTrueOrderByName();
}

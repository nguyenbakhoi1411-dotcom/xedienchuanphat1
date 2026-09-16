package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.EmployeeWarehouse;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeWarehouseRepository extends JpaRepository<EmployeeWarehouse, Long> {
    List<EmployeeWarehouse> findByEmployeeIdAndActiveTrue(Long employeeId);
}

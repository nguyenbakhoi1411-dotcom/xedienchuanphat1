package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.EmployeeWarehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeWarehouseRepository extends JpaRepository<EmployeeWarehouse, Long> {
    List<EmployeeWarehouse> findByUsername(String username);
}

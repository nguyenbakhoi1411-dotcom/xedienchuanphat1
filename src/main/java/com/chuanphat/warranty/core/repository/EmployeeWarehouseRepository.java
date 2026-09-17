package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.EmployeeWarehouse;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeWarehouseRepository extends JpaRepository<EmployeeWarehouse, Long> {
    Optional<EmployeeWarehouse> findByEmployeeIdAndWarehouseId(Long employeeId, Long warehouseId);
    Optional<EmployeeWarehouse> findByEmployeeIdAndWarehouseIdAndActiveTrue(Long employeeId, Long warehouseId);
    List<EmployeeWarehouse> findByEmployeeIdAndActiveTrueOrderByWarehouseWarehouseName(Long employeeId);
    List<EmployeeWarehouse> findByWarehouseIdAndActiveTrueOrderByEmployeeId(Long warehouseId);
    List<EmployeeWarehouse> findByEmployeeIdAndWarehouseBranchIdAndActiveTrue(Long employeeId, Long branchId);
}

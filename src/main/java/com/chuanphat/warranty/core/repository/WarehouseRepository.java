package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.Warehouse;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.core.enums.WarehouseType;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    boolean existsByWarehouseCodeIgnoreCase(String warehouseCode);

    Optional<Warehouse> findByBranchIdAndTypeAndStatus(Long branchId, WarehouseType type, RecordStatus status);

    Page<Warehouse> findByBranchId(Long branchId, Pageable pageable);

    Page<Warehouse> findByStatusNot(RecordStatus status, Pageable pageable);
}

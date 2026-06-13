package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.SupplierGroup;
import com.chuanphat.warranty.core.enums.RecordStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierGroupRepository extends JpaRepository<SupplierGroup, Long> {
    List<SupplierGroup> findByStatusNot(RecordStatus status);
    boolean existsByCodeIgnoreCase(String code);
}

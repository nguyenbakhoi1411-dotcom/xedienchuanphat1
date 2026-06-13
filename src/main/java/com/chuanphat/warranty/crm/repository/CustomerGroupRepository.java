package com.chuanphat.warranty.crm.repository;

import com.chuanphat.warranty.crm.entity.CustomerGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CustomerGroupRepository extends JpaRepository<CustomerGroup, Long> {
    List<CustomerGroup> findByStatus(String status);
    boolean existsByCode(String code);
}

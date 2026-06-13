package com.chuanphat.warranty.repository;

import com.chuanphat.warranty.entity.WarrantyPolicyDetail;
import com.chuanphat.warranty.enums.ComponentType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WarrantyPolicyDetailRepository extends JpaRepository<WarrantyPolicyDetail, Long> {
    List<WarrantyPolicyDetail> findByPolicyIdOrderByComponentType(Long policyId);

    List<WarrantyPolicyDetail> findByProductIdOrderByComponentType(Long productId);

    Optional<WarrantyPolicyDetail> findFirstByProductIdAndComponentType(Long productId, ComponentType componentType);
}

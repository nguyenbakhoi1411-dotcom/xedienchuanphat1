package com.chuanphat.warranty.repository;

import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.entity.WarrantyPolicy;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WarrantyPolicyRepository extends JpaRepository<WarrantyPolicy, Long> {
    Optional<WarrantyPolicy> findFirstByProductCategoryOrderByCreatedAtDesc(ProductCategory productCategory);
}

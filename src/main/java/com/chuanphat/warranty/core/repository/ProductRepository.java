package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.RecordStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsByProductCodeIgnoreCase(String productCode);

    Page<Product> findByStatusNotAndProductNameContainingIgnoreCase(RecordStatus status, String keyword, Pageable pageable);

    Page<Product> findByStatusNotAndCategoryAndProductNameContainingIgnoreCase(RecordStatus status, ProductCategory category, String keyword, Pageable pageable);
}

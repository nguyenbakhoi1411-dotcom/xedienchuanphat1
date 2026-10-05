package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.Product;
import com.chuanphat.warranty.core.enums.ProductCategory;
import com.chuanphat.warranty.core.enums.RecordStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select product from Product product where product.id = :id")
    Optional<Product> findWithLockById(@Param("id") Long id);
    boolean existsByProductCodeIgnoreCase(String productCode);

    Page<Product> findByStatusNotAndProductNameContainingIgnoreCase(RecordStatus status, String keyword, Pageable pageable);

    Page<Product> findByStatusNotAndCategoryAndProductNameContainingIgnoreCase(RecordStatus status, ProductCategory category, String keyword, Pageable pageable);
}

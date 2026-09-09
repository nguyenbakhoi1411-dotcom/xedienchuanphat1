package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.ProductBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductBatchRepository extends JpaRepository<ProductBatch, Long> {
}

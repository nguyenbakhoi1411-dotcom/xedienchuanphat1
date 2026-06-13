package com.chuanphat.warranty.pricing.repository;

import com.chuanphat.warranty.pricing.entity.ProductPriceHistory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductPriceHistoryRepository extends JpaRepository<ProductPriceHistory, Long> {
    List<ProductPriceHistory> findByProductIdOrderByChangedAtDesc(Long productId);
}

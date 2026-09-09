package com.chuanphat.warranty.marketing.repository;

import com.chuanphat.warranty.marketing.entity.PromotionUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PromotionUsageRepository extends JpaRepository<PromotionUsage, Long> {
    List<PromotionUsage> findByPromotionId(Long promotionId);
    
    @Query("SELECT COUNT(pu) FROM PromotionUsage pu WHERE pu.promotion.id = :promotionId AND pu.khachHang.id = :customerId")
    long countUsageByCustomer(Long promotionId, Long customerId);
}

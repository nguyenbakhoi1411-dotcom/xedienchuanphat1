package com.chuanphat.warranty.marketing.repository;

import com.chuanphat.warranty.marketing.entity.PriceAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PriceAdjustmentRepository extends JpaRepository<PriceAdjustment, Long> {
}

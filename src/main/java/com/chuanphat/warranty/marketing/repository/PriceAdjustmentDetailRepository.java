package com.chuanphat.warranty.marketing.repository;

import com.chuanphat.warranty.marketing.entity.PriceAdjustmentDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PriceAdjustmentDetailRepository extends JpaRepository<PriceAdjustmentDetail, Long> {
    List<PriceAdjustmentDetail> findByAdjustmentId(Long adjustmentId);
}

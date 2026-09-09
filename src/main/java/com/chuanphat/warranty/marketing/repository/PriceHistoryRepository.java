package com.chuanphat.warranty.marketing.repository;

import com.chuanphat.warranty.marketing.entity.PriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {
    List<PriceHistory> findBySanPhamIdOrderByThoiDiemThayDoiDesc(Long sanPhamId);
    
    List<PriceHistory> findBySanPhamIdAndThoiDiemThayDoiBetween(Long sanPhamId, LocalDateTime start, LocalDateTime end);
}

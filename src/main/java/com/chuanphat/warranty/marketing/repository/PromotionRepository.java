package com.chuanphat.warranty.marketing.repository;

import com.chuanphat.warranty.marketing.entity.Promotion;
import com.chuanphat.warranty.marketing.enums.PromotionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    Optional<Promotion> findByMaKhuyenMai(String maKhuyenMai);
    
    @Query("SELECT p FROM Promotion p WHERE p.trangThai = :status AND p.apDungTu <= :date AND (p.apDungDen IS NULL OR p.apDungDen >= :date) ORDER BY p.uuTien DESC")
    List<Promotion> findActivePromotions(PromotionStatus status, LocalDateTime date);
}

package com.chuanphat.warranty.marketing.repository;

import com.chuanphat.warranty.marketing.entity.PriceList;
import com.chuanphat.warranty.marketing.enums.PriceListStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PriceListRepository extends JpaRepository<PriceList, Long> {
    Optional<PriceList> findByMaBangGia(String maBangGia);
    
    Page<PriceList> findByTrangThai(PriceListStatus trangThai, Pageable pageable);
    
    List<PriceList> findByTrangThai(PriceListStatus trangThai);
    
    @Modifying
    @Query("UPDATE PriceList p SET p.laBangGiaMacDinh = false WHERE p.id != :id")
    void setAllOthersNotDefault(Long id);
    
    Optional<PriceList> findFirstByLaBangGiaMacDinhTrue();
    
    @Query("SELECT p FROM PriceList p WHERE p.trangThai = :status AND p.apDungTu <= :date AND (p.apDungDen IS NULL OR p.apDungDen >= :date)")
    List<PriceList> findActivePriceLists(PriceListStatus status, LocalDate date);
    
    @Modifying
    @Query("UPDATE PriceList p SET p.trangThai = 'INACTIVE' WHERE p.trangThai = 'ACTIVE' AND p.apDungDen < :date")
    int deactivateExpiredPriceLists(LocalDate date);
}

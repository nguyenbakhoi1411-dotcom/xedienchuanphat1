package com.chuanphat.warranty.marketing.repository;

import com.chuanphat.warranty.marketing.entity.PriceListItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PriceListItemRepository extends JpaRepository<PriceListItem, Long> {
    Page<PriceListItem> findByPriceListId(Long priceListId, Pageable pageable);
    
    List<PriceListItem> findByPriceListId(Long priceListId);
    
    Optional<PriceListItem> findByPriceListIdAndSanPhamId(Long priceListId, Long sanPhamId);
    
    boolean existsBySanPhamId(Long sanPhamId);
    
    int countByPriceListId(Long priceListId);
}

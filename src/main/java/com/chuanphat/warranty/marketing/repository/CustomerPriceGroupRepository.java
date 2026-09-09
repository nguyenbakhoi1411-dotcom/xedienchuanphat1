package com.chuanphat.warranty.marketing.repository;

import com.chuanphat.warranty.marketing.entity.CustomerPriceGroup;
import com.chuanphat.warranty.marketing.enums.CustomerGroupStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerPriceGroupRepository extends JpaRepository<CustomerPriceGroup, Long> {
    Optional<CustomerPriceGroup> findByMaNhomGia(String maNhomGia);
    
    List<CustomerPriceGroup> findByTrangThai(CustomerGroupStatus trangThai);
    
    List<CustomerPriceGroup> findByTrangThaiOrderByDieuKienMinCumDesc(CustomerGroupStatus trangThai);
}

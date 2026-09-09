package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.UnitConversion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UnitConversionRepository extends JpaRepository<UnitConversion, Long> {
    List<UnitConversion> findByProductId(Long productId);
}

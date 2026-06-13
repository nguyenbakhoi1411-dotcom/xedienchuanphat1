package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.TaxRate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TaxRateRepository extends JpaRepository<TaxRate, Long> {
    List<TaxRate> findByActiveTrue();
    Optional<TaxRate> findByCode(String code);
}

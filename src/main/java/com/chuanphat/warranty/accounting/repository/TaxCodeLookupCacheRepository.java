package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.TaxCodeLookupCache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TaxCodeLookupCacheRepository extends JpaRepository<TaxCodeLookupCache, Long> {
    Optional<TaxCodeLookupCache> findByTaxCode(String taxCode);
}

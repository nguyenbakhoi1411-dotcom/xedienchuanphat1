package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.TaxDeclarationLine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaxDeclarationLineRepository extends JpaRepository<TaxDeclarationLine, Long> {
    List<TaxDeclarationLine> findByTaxDeclarationId(Long taxDeclarationId);
}

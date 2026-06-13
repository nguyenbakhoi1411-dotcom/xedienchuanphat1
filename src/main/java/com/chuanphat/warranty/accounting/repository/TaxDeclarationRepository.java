package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.TaxDeclaration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TaxDeclarationRepository extends JpaRepository<TaxDeclaration, Long> {
    List<TaxDeclaration> findByBranchIdAndYearOrderByMonthDesc(Long branchId, Integer year);
    Optional<TaxDeclaration> findByBranchIdAndMonthAndYear(Long branchId, Integer month, Integer year);
}

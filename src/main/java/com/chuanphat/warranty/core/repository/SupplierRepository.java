package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.Supplier;
import com.chuanphat.warranty.core.enums.RecordStatus;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    boolean existsByCodeIgnoreCase(String code);

    Page<Supplier> findByStatusNotAndNameContainingIgnoreCase(RecordStatus status, String keyword, Pageable pageable);

    /** Autocomplete: tim theo ten, ma, hoac ma so thue */
    List<Supplier> findTop10ByStatusAndNameContainingIgnoreCaseOrCodeContainingIgnoreCaseOrTaxCodeContaining(
            RecordStatus status, String name, String code, String taxCode);
}

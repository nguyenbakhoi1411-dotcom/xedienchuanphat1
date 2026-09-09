package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.InvoiceInput;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceInputRepository extends JpaRepository<InvoiceInput, Long> {
    Optional<InvoiceInput> findByMaHoaDonVao(String maHoaDonVao);
}

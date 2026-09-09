package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.SalesVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SalesVoucherRepository extends JpaRepository<SalesVoucher, Long> {
    Optional<SalesVoucher> findByVoucherNo(String voucherNo);
}

package com.chuanphat.warranty.sales.repository;

import com.chuanphat.warranty.core.entity.SalesVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository("salesModuleSalesVoucherRepository")
public interface SalesVoucherRepository extends JpaRepository<SalesVoucher, Long> {
}

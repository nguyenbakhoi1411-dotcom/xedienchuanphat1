package com.chuanphat.warranty.sales.repository;

import com.chuanphat.warranty.core.entity.SalesDiscountVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository("salesModuleSalesDiscountVoucherRepository")
public interface SalesDiscountVoucherRepository extends JpaRepository<SalesDiscountVoucher, Long> {
}

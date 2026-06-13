package com.chuanphat.warranty.marketing.repository;

import com.chuanphat.warranty.marketing.entity.VoucherUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface VoucherUsageRepository extends JpaRepository<VoucherUsage, Long> {
    long countByVoucherIdAndCustomerId(Long voucherId, Long customerId);
    long countByVoucherId(Long voucherId);
    List<VoucherUsage> findByCustomerIdOrderByUsedAtDesc(Long customerId);
    List<VoucherUsage> findByVoucherIdOrderByUsedAtDesc(Long voucherId);
    boolean existsByVoucherCodeAndSalesOrderId(String voucherCode, Long salesOrderId);
}

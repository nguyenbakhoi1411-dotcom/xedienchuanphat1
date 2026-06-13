package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.SalesPayment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SalesPaymentRepository extends JpaRepository<SalesPayment, Long> {
    List<SalesPayment> findByOrder_IdOrderByPaymentDateDescIdDesc(Long orderId);

    List<SalesPayment> findByOrder_CustomerIdOrderByPaymentDateDescIdDesc(Long customerId);
}

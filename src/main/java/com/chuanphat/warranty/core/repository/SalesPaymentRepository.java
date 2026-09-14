package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.SalesPayment;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SalesPaymentRepository extends JpaRepository<SalesPayment, Long> {
    List<SalesPayment> findByOrder_IdOrderByPaymentDateDescIdDesc(Long orderId);

    List<SalesPayment> findByOrder_CustomerIdOrderByPaymentDateDescIdDesc(Long customerId);

    @Query("select coalesce(sum(payment.amount), 0) from SalesPayment payment where payment.order.id = :orderId")
    BigDecimal sumAmountByOrderId(@Param("orderId") Long orderId);
}

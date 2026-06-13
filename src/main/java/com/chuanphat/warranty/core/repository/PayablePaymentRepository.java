package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.PayablePayment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PayablePaymentRepository extends JpaRepository<PayablePayment, Long> {
    List<PayablePayment> findByPayable_IdOrderByCreatedAtDesc(Long payableId);
    List<PayablePayment> findBySupplierPaymentId(Long supplierPaymentId);
}

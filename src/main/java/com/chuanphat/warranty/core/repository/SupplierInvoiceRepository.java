package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.SupplierInvoice;
import com.chuanphat.warranty.core.enums.SupplierInvoicePaymentStatus;
import com.chuanphat.warranty.core.enums.SupplierInvoiceStatus;
import jakarta.persistence.LockModeType;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SupplierInvoiceRepository extends JpaRepository<SupplierInvoice, Long> {
    Page<SupplierInvoice> findBySupplier_Id(Long supplierId, Pageable pageable);
    Page<SupplierInvoice> findByBranchId(Long branchId, Pageable pageable);
    Optional<SupplierInvoice> findByReceiptId(Long receiptId);
    List<SupplierInvoice> findByPurchaseOrderIdAndStatusIn(Long purchaseOrderId, Collection<SupplierInvoiceStatus> statuses);
    List<SupplierInvoice> findByStatusIn(Collection<SupplierInvoiceStatus> statuses);
    List<SupplierInvoice> findByStatusInAndPaymentStatusNot(Collection<SupplierInvoiceStatus> statuses, SupplierInvoicePaymentStatus paymentStatus);
    boolean existsByInvoiceNoIgnoreCase(String invoiceNo);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from SupplierInvoice i where i.id = :id")
    Optional<SupplierInvoice> findWithLockById(@Param("id") Long id);
}

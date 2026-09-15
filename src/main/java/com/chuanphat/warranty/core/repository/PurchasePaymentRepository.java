package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.PurchasePayment;
import com.chuanphat.warranty.core.enums.PurchasePaymentEntryType;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PurchasePaymentRepository extends JpaRepository<PurchasePayment, Long> {
    List<PurchasePayment> findBySupplierInvoice_IdOrderByPaymentDateDescIdDesc(Long supplierInvoiceId);

    @Query("select coalesce(sum(p.amount), 0) from PurchasePayment p where p.supplierInvoice.id = :supplierInvoiceId")
    BigDecimal sumBySupplierInvoiceId(@Param("supplierInvoiceId") Long supplierInvoiceId);

    @Query("""
            select coalesce(sum(p.amount), 0)
            from PurchasePayment p
            where p.supplierInvoice.id = :supplierInvoiceId
              and p.entryType = :entryType
            """)
    BigDecimal sumBySupplierInvoiceIdAndEntryType(
            @Param("supplierInvoiceId") Long supplierInvoiceId,
            @Param("entryType") PurchasePaymentEntryType entryType);
}

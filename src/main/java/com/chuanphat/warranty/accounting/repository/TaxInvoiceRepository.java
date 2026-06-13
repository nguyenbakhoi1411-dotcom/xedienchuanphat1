package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.TaxInvoice;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaxInvoiceRepository extends JpaRepository<TaxInvoice, Long> {

    Page<TaxInvoice> findByInvoiceTypeAndBranchId(String invoiceType, Long branchId, Pageable pageable);

    Page<TaxInvoice> findByInvoiceTypeAndBranchIdAndStatus(String type, Long branchId, String status, Pageable pageable);

    List<TaxInvoice> findByInvoiceDateBetweenAndBranchIdAndInvoiceType(
            LocalDate from, LocalDate to, Long branchId, String invoiceType);

    Optional<TaxInvoice> findByInvoiceCode(String invoiceCode);

    @Query("SELECT COALESCE(SUM(t.vatAmount), 0) FROM TaxInvoice t " +
           "WHERE t.invoiceType = :type AND t.branchId = :branchId " +
           "AND YEAR(t.invoiceDate) = :year AND MONTH(t.invoiceDate) = :month " +
           "AND t.status != 'CANCELLED'")
    java.math.BigDecimal sumVatByTypeAndPeriod(
            @Param("type") String type,
            @Param("branchId") Long branchId,
            @Param("year") int year,
            @Param("month") int month);

    @Query("SELECT COALESCE(SUM(t.taxBaseAmount), 0) FROM TaxInvoice t " +
           "WHERE t.invoiceType = :type AND t.branchId = :branchId " +
           "AND YEAR(t.invoiceDate) = :year AND MONTH(t.invoiceDate) = :month " +
           "AND t.status != 'CANCELLED'")
    java.math.BigDecimal sumTaxBaseByTypeAndPeriod(
            @Param("type") String type,
            @Param("branchId") Long branchId,
            @Param("year") int year,
            @Param("month") int month);
}

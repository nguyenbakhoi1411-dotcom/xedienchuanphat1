package com.chuanphat.warranty.cash.repository;

import com.chuanphat.warranty.cash.entity.CashVoucher;
import com.chuanphat.warranty.cash.entity.CashVoucherStatus;
import com.chuanphat.warranty.cash.entity.CashVoucherType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

public interface CashVoucherRepository extends JpaRepository<CashVoucher, Long> {

    Page<CashVoucher> findByBranchIdAndVoucherTypeAndStatusAndVoucherDateBetween(
            Long branchId,
            CashVoucherType voucherType,
            CashVoucherStatus status,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable
    );

    Optional<CashVoucher> findTopByBranchIdOrderByVoucherNoDesc(Long branchId);

    Optional<CashVoucher> findTopByBranchIdAndVoucherTypeAndVoucherNoStartingWithOrderByVoucherNoDesc(
            Long branchId,
            CashVoucherType voucherType,
            String prefix
    );

    @Query("""
           select v from CashVoucher v
           where v.branchId = :branchId
             and (:voucherType is null or v.voucherType = :voucherType)
             and (:status is null or v.status = :status)
             and (:fromDate is null or v.voucherDate >= :fromDate)
             and (:toDate is null or v.voucherDate <= :toDate)
           """)
    Page<CashVoucher> search(
            @Param("branchId") Long branchId,
            @Param("voucherType") CashVoucherType voucherType,
            @Param("status") CashVoucherStatus status,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable
    );

    @Query("""
           select coalesce(sum(v.totalAmount), 0)
           from CashVoucher v
           where v.branchId = :branchId
             and v.voucherType = :voucherType
             and v.status = 'POSTED'
           """)
    BigDecimal sumTotalAmountByBranchAndType(
            @Param("branchId") Long branchId,
            @Param("voucherType") CashVoucherType voucherType
    );

    @Query("""
           select coalesce(sum(v.totalAmount), 0)
           from CashVoucher v
           where v.branchId = :branchId
             and v.voucherType = :voucherType
             and v.status = 'POSTED'
             and v.voucherDate = :date
           """)
    BigDecimal sumTotalAmountByBranchAndTypeAndDate(
            @Param("branchId") Long branchId,
            @Param("voucherType") CashVoucherType voucherType,
            @Param("date") LocalDate date
    );
}

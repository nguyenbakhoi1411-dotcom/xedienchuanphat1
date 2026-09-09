package com.chuanphat.warranty.cash.repository;

import com.chuanphat.warranty.cash.entity.CashPayment;
import com.chuanphat.warranty.cash.entity.PaymentType;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CashPaymentRepository extends JpaRepository<CashPayment, Long> {

    @Query("""
            select p from CashPayment p
            where (:fromDate is null or p.paymentDate >= :fromDate)
              and (:toDate   is null or p.paymentDate <= :toDate)
              and (:type     is null or p.paymentType = :type)
              and (:branchId is null or p.branchId = :branchId)
              and (:keyword  is null
                   or lower(p.voucherNo)  like lower(concat('%',:keyword,'%'))
                   or lower(p.payeeName)  like lower(concat('%',:keyword,'%')))
            order by p.paymentDate desc, p.createdAt desc
            """)
    Page<CashPayment> search(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("type") PaymentType type,
            @Param("branchId") Long branchId,
            @Param("keyword") String keyword,
            Pageable pageable);

    @Query("""
            select coalesce(sum(p.amount), 0)
            from CashPayment p
            where p.status = 'CONFIRMED'
              and p.paymentDate >= :fromDate and p.paymentDate <= :toDate
              and (:branchId is null or p.branchId = :branchId)
            """)
    BigDecimal sumConfirmed(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("branchId") Long branchId);

    @Query("select count(p) from CashPayment p where p.paymentDate = :date")
    long countByDate(@Param("date") LocalDate date);

    @Query("""
            select coalesce(sum(p.amount), 0)
            from CashPayment p
            where p.status = 'CONFIRMED'
              and (:fromDate is null or p.paymentDate >= :fromDate)
              and (:toDate   is null or p.paymentDate <= :toDate)
              and (:type     is null or p.paymentType = :type)
              and (:branchId is null or p.branchId = :branchId)
            """)
    BigDecimal sumFiltered(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("type") PaymentType type,
            @Param("branchId") Long branchId);
}

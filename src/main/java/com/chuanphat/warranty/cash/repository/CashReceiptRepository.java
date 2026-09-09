package com.chuanphat.warranty.cash.repository;

import com.chuanphat.warranty.cash.entity.CashReceipt;
import com.chuanphat.warranty.cash.entity.ReceiptType;
import com.chuanphat.warranty.cash.entity.VoucherStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CashReceiptRepository extends JpaRepository<CashReceipt, Long> {

    @Query("""
            select r from CashReceipt r
            where (:fromDate is null or r.receiptDate >= :fromDate)
              and (:toDate   is null or r.receiptDate <= :toDate)
              and (:type     is null or r.receiptType = :type)
              and (:branchId is null or r.branchId = :branchId)
              and (:keyword  is null
                   or lower(r.voucherNo)  like lower(concat('%',:keyword,'%'))
                   or lower(r.payerName)  like lower(concat('%',:keyword,'%')))
            order by r.receiptDate desc, r.createdAt desc
            """)
    Page<CashReceipt> search(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("type") ReceiptType type,
            @Param("branchId") Long branchId,
            @Param("keyword") String keyword,
            Pageable pageable);

    /** SUM phiếu thu CONFIRMED trong khoảng ngày — dùng cho tóm tắt + dashboard */
    @Query("""
            select coalesce(sum(r.amount), 0)
            from CashReceipt r
            where r.status = 'CONFIRMED'
              and r.receiptDate >= :fromDate and r.receiptDate <= :toDate
              and (:branchId is null or r.branchId = :branchId)
            """)
    BigDecimal sumConfirmed(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("branchId") Long branchId);

    /** Đếm số phiếu trong ngày để sinh mã tự động */
    @Query("select count(r) from CashReceipt r where r.receiptDate = :date")
    long countByDate(@Param("date") LocalDate date);

    /** Tổng thu CONFIRMED theo filter hiện tại (footer) */
    @Query("""
            select coalesce(sum(r.amount), 0)
            from CashReceipt r
            where r.status = 'CONFIRMED'
              and (:fromDate is null or r.receiptDate >= :fromDate)
              and (:toDate   is null or r.receiptDate <= :toDate)
              and (:type     is null or r.receiptType = :type)
              and (:branchId is null or r.branchId = :branchId)
            """)
    BigDecimal sumFiltered(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("type") ReceiptType type,
            @Param("branchId") Long branchId);

    Page<CashReceipt> findBySalesOrderIdAndStatusNot(Long salesOrderId, VoucherStatus status, Pageable pageable);
}

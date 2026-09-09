package com.chuanphat.warranty.sales.repository;

import com.chuanphat.warranty.core.entity.*;
import com.chuanphat.warranty.core.enums.SalesOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface SalesQueryRepository extends JpaRepository<SalesOrder, Long> {

    @Query("SELECT o FROM SalesOrder o WHERE o.branchId = :branchId " +
           "AND (:status IS NULL OR o.status = :status) " +
           "AND (:fromDate IS NULL OR o.orderDate >= :fromDate) " +
           "AND (:toDate IS NULL OR o.orderDate <= :toDate) " +
           "AND (:keyword IS NULL OR LOWER(o.orderNo) LIKE LOWER(CONCAT('%',:keyword,'%'))) " +
           "ORDER BY o.orderDate DESC, o.id DESC")
    Page<SalesOrder> searchOrders(
        @Param("branchId") Long branchId,
        @Param("status") SalesOrderStatus status,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate,
        @Param("keyword") String keyword,
        Pageable pageable
    );

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM SalesOrder o " +
           "WHERE o.branchId = :branchId AND o.orderDate = :date " +
           "AND o.status <> com.chuanphat.warranty.core.enums.SalesOrderStatus.CANCELLED")
    BigDecimal sumTodayRevenue(@Param("branchId") Long branchId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(o) FROM SalesOrder o WHERE o.branchId = :branchId " +
           "AND o.status IN (com.chuanphat.warranty.core.enums.SalesOrderStatus.DRAFT, " +
           "com.chuanphat.warranty.core.enums.SalesOrderStatus.CONFIRMED)")
    Long countActiveOrders(@Param("branchId") Long branchId);

    @Query("SELECT MAX(o.orderNo) FROM SalesOrder o WHERE o.branchId = :branchId")
    Optional<String> findMaxOrderNo(@Param("branchId") Long branchId);

    @Query("SELECT p.category, SUM(i.quantity * i.unitPrice) " +
           "FROM SalesOrderItem i JOIN i.product p JOIN i.order o " +
           "WHERE o.branchId = :branchId " +
           "AND o.status <> com.chuanphat.warranty.core.enums.SalesOrderStatus.CANCELLED " +
           "GROUP BY p.category")
    java.util.List<Object[]> sumRevenueByCategory(@Param("branchId") Long branchId);
}

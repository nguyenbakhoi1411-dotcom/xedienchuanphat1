package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.dto.SalesOrderListResponse;
import com.chuanphat.warranty.core.entity.SalesOrder;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {
    Page<SalesOrder> findByBranchId(Long branchId, Pageable pageable);
    
    long countByCustomerId(Long customerId);

        @Query(value = """
            select new com.chuanphat.warranty.core.dto.SalesOrderListResponse(
                so.id, so.orderNo, so.branchId, so.customerId, so.employeeId, q.id,
                so.orderDate, so.status, so.subtotal, so.discountAmount, so.voucherCode,
                so.totalAmount, so.paidAmount, so.paymentStatus, so.reservationUntil,
                so.createdAt, so.note, so.deliveryStatus, so.ecommercePlatform, so.shopName, so.storeCode, count(soi.id)
            )
            from SalesOrder so
            left join so.quotation q
            left join so.items soi
            group by so.id, so.orderNo, so.branchId, so.customerId, so.employeeId, q.id,
                so.orderDate, so.status, so.subtotal, so.discountAmount, so.voucherCode,
                so.totalAmount, so.paidAmount, so.paymentStatus, so.reservationUntil,
                so.createdAt, so.note, so.deliveryStatus, so.ecommercePlatform, so.shopName, so.storeCode
            """)
    Page<SalesOrderListResponse> findList(Pageable pageable);

    @Query(value = """
            select new com.chuanphat.warranty.core.dto.SalesOrderListResponse(
                so.id, so.orderNo, so.branchId, so.customerId, so.employeeId, q.id,
                so.orderDate, so.status, so.subtotal, so.discountAmount, so.voucherCode,
                so.totalAmount, so.paidAmount, so.paymentStatus, so.reservationUntil,
                so.createdAt, so.note, so.deliveryStatus, so.ecommercePlatform, so.shopName, so.storeCode, count(soi.id)
            )
            from SalesOrder so
            left join so.quotation q
            left join so.items soi
            where so.branchId = :branchId
            group by so.id, so.orderNo, so.branchId, so.customerId, so.employeeId, q.id,
                so.orderDate, so.status, so.subtotal, so.discountAmount, so.voucherCode,
                so.totalAmount, so.paidAmount, so.paymentStatus, so.reservationUntil,
                so.createdAt, so.note, so.deliveryStatus, so.ecommercePlatform, so.shopName, so.storeCode
            """)
    Page<SalesOrderListResponse> findListByBranchId(Long branchId, Pageable pageable);

    Optional<SalesOrder> findByOrderNo(String orderNo);

    @EntityGraph(attributePaths = {"quotation", "items", "items.product", "items.serial"})
    Optional<SalesOrder> findWithItemsById(Long id);

    List<SalesOrder> findByCustomerIdOrderByOrderDateDesc(Long customerId);
    
    List<SalesOrder> findByCustomerIdAndStatus(Long customerId, com.chuanphat.warranty.core.enums.SalesOrderStatus status);

    long countByEmployeeIdAndOrderDateBetween(Long employeeId, LocalDate from, LocalDate to);

    @Query("select coalesce(sum(so.totalAmount), 0) from SalesOrder so where so.employeeId = :employeeId and so.orderDate between :from and :to and so.status <> com.chuanphat.warranty.core.enums.SalesOrderStatus.CANCELLED")
    BigDecimal sumRevenueByEmployee(Long employeeId, LocalDate from, LocalDate to);
}

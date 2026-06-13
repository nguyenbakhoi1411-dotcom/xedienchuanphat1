package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.dto.QuotationListResponse;
import com.chuanphat.warranty.core.entity.Quotation;
import com.chuanphat.warranty.core.enums.QuotationStatus;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface QuotationRepository extends JpaRepository<Quotation, Long> {
    Page<Quotation> findByBranchId(Long branchId, Pageable pageable);

    @Query(value = """
            select new com.chuanphat.warranty.core.dto.QuotationListResponse(
                q.id, q.quotationNo, q.branchId, q.customerId, q.employeeId,
                q.quotationDate, q.validUntil, q.status, q.subtotal, q.discountAmount,
                q.voucherCode, q.totalAmount, q.note, q.createdAt, count(qi.id)
            )
            from Quotation q
            left join q.items qi
            group by q.id, q.quotationNo, q.branchId, q.customerId, q.employeeId,
                q.quotationDate, q.validUntil, q.status, q.subtotal, q.discountAmount,
                q.voucherCode, q.totalAmount, q.note, q.createdAt
            """)
    Page<QuotationListResponse> findList(Pageable pageable);

    @Query(value = """
            select new com.chuanphat.warranty.core.dto.QuotationListResponse(
                q.id, q.quotationNo, q.branchId, q.customerId, q.employeeId,
                q.quotationDate, q.validUntil, q.status, q.subtotal, q.discountAmount,
                q.voucherCode, q.totalAmount, q.note, q.createdAt, count(qi.id)
            )
            from Quotation q
            left join q.items qi
            where q.branchId = :branchId
            group by q.id, q.quotationNo, q.branchId, q.customerId, q.employeeId,
                q.quotationDate, q.validUntil, q.status, q.subtotal, q.discountAmount,
                q.voucherCode, q.totalAmount, q.note, q.createdAt
            """)
    Page<QuotationListResponse> findListByBranchId(Long branchId, Pageable pageable);

    @EntityGraph(attributePaths = {"items", "items.product", "items.serial"})
    java.util.Optional<Quotation> findWithItemsById(Long id);

    List<Quotation> findByStatusAndValidUntilBefore(QuotationStatus status, LocalDate date);

    List<Quotation> findByCustomerIdOrderByQuotationDateDesc(Long customerId);

    long countByEmployeeIdAndQuotationDateBetween(Long employeeId, LocalDate from, LocalDate to);
}

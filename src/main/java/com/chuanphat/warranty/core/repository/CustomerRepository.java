package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.Customer;
import com.chuanphat.warranty.core.enums.RecordStatus;
import com.chuanphat.warranty.crm.enums.CustomerTier;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    boolean existsByPhone(String phone);

    Optional<Customer> findByPhone(String phone);

    Page<Customer> findByStatusNotAndBranchIdAndFullNameContainingIgnoreCase(
            RecordStatus status, Long branchId, String keyword, Pageable pageable);

    Page<Customer> findByStatusNotAndFullNameContainingIgnoreCase(
            RecordStatus status, String keyword, Pageable pageable);

    long countByCreatedAtBetween(OffsetDateTime from, OffsetDateTime to);

    List<Customer> findTop10ByStatusNotOrderByCreatedAtDesc(RecordStatus status);

    List<Customer> findByTier(CustomerTier tier);

    // ── Alert-related queries ──────────────────────────────────────────

    /** Khách chưa bảo dưỡng > 180 ngày */
    List<Customer> findByLastServiceDateBeforeOrLastServiceDateIsNull(LocalDate cutoff);

    /** Khách có công nợ */
    List<Customer> findByTotalDebtGreaterThan(BigDecimal amount);

    /** Khách chưa mua > 90 ngày nhưng từng mua */
    List<Customer> findByLastPurchaseDateBeforeAndTotalPurchaseCountGreaterThan(
            LocalDate cutoff, int minCount);

    /** Khách sắp sinh nhật trong khoảng (birthday format MM-DD) */
    @Query("""
            SELECT c FROM Customer c
            WHERE c.birthday IS NOT NULL
              AND SUBSTRING(c.birthday, 1, 5) BETWEEN :from AND :to
              AND c.status <> 'DELETED'
            """)
    List<Customer> findUpcomingBirthdays(String from, String to);

    @Query("""
            select customer.source as source, count(customer) as total
            from Customer customer
            where customer.status <> :status
            group by customer.source
            """)
    List<CustomerSourceCountRow> countCustomersBySource(RecordStatus status);

    interface CustomerSourceCountRow {
        String getSource();
        long getTotal();
    }
}

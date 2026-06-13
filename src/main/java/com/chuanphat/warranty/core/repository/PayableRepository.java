package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.Payable;
import com.chuanphat.warranty.core.enums.PayableStatus;
import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository("corePayableRepository")
public interface PayableRepository extends JpaRepository<Payable, Long> {

    Page<Payable> findBySupplier_Id(Long supplierId, Pageable pageable);

    Page<Payable> findByBranchIdAndStatus(Long branchId, PayableStatus status, Pageable pageable);

    Page<Payable> findByBranchId(Long branchId, Pageable pageable);

    Page<Payable> findByStatus(PayableStatus status, Pageable pageable);

    /** Tim tat ca cong no chua tra / tra mot phan cua mot NCC (de thanh toan) */
    @Query("select p from Payable p where p.supplier.id = :supplierId and p.status in ('OPEN','PARTIAL','OVERDUE') order by p.dueDate asc nulls last")
    List<Payable> findOpenPayablesBySupplier(@Param("supplierId") Long supplierId);

    /** Cong no qua han (due_date < today and status not PAID/CANCELLED) */
    @Query("select p from Payable p where p.dueDate < :today and p.status not in ('PAID','CANCELLED')")
    List<Payable> findOverdue(@Param("today") LocalDate today);

    /** Pessimistic lock de tranh race condition khi thanh toan dong thoi */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Payable p where p.id = :id")
    Optional<Payable> findWithLockById(@Param("id") Long id);

    /** Tong cong no phai tra chua tra cua 1 NCC */
    @Query("select coalesce(sum(p.remainingAmount), 0) from Payable p where p.supplier.id = :supplierId and p.status not in ('PAID','CANCELLED')")
    java.math.BigDecimal sumRemainingBySupplier(@Param("supplierId") Long supplierId);

    /** Danh sach aging report: group theo supplier, aging bucket */
    @Query("""
        select p from Payable p
        where p.branchId = :branchId
          and p.status not in ('PAID','CANCELLED')
        order by p.supplier.id, p.dueDate asc nulls last
    """)
    List<Payable> findForAgingReport(@Param("branchId") Long branchId);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(p.payableCode, 4) AS int)), 0) FROM Payable p WHERE p.payableCode LIKE 'CN-%'")
    int findMaxPayableSeq();

    /** Cap nhat status OVERDUE hang loat */
    @Modifying
    @Query("update Payable p set p.status = 'OVERDUE' where p.dueDate < :today and p.status in ('OPEN','PARTIAL')")
    int markOverdue(@Param("today") LocalDate today);
}

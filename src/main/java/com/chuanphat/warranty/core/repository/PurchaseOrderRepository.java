package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.PurchaseOrder;
import com.chuanphat.warranty.core.enums.PurchaseOrderStatus;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    Page<PurchaseOrder> findByBranchId(Long branchId, Pageable pageable);

    Page<PurchaseOrder> findByBranchIdAndStatus(Long branchId, PurchaseOrderStatus status, Pageable pageable);

    Page<PurchaseOrder> findByStatus(PurchaseOrderStatus status, Pageable pageable);

    Page<PurchaseOrder> findBySupplier_Id(Long supplierId, Pageable pageable);

    List<PurchaseOrder> findByStatusIn(List<PurchaseOrderStatus> statuses);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select po from PurchaseOrder po where po.id = :id")
    Optional<PurchaseOrder> findWithLockById(@Param("id") Long id);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(po.purchaseOrderNo, 5) AS int)), 0) FROM PurchaseOrder po WHERE po.purchaseOrderNo LIKE 'DH-%'")
    int findMaxPoSeq();
}

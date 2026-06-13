package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.InventoryTransfer;
import com.chuanphat.warranty.core.enums.TransferStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface InventoryTransferRepository extends JpaRepository<InventoryTransfer, Long> {
    Page<InventoryTransfer> findByFromBranchIdOrToBranchId(Long fromBranchId, Long toBranchId, Pageable pageable);

    Page<InventoryTransfer> findByStatus(TransferStatus status, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select transfer from InventoryTransfer transfer where transfer.id = :id")
    Optional<InventoryTransfer> findWithLockById(Long id);
}

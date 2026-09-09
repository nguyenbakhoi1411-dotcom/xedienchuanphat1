package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.PurchaseRequest;
import com.chuanphat.warranty.core.enums.PurchaseRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PurchaseRequestRepository extends JpaRepository<PurchaseRequest, Long> {
    Page<PurchaseRequest> findByBranchId(Long branchId, Pageable pageable);
    
    Page<PurchaseRequest> findByBranchIdAndStatus(Long branchId, PurchaseRequestStatus status, Pageable pageable);
    
    Page<PurchaseRequest> findByStatus(PurchaseRequestStatus status, Pageable pageable);

    @Query("SELECT pr.prNo FROM PurchaseRequest pr WHERE pr.prNo LIKE :prefix% ORDER BY pr.prNo DESC")
    List<String> findLastPrNo(@Param("prefix") String prefix, Pageable pageable);
}

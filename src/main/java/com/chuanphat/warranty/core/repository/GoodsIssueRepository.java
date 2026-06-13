package com.chuanphat.warranty.core.repository;

import com.chuanphat.warranty.core.entity.GoodsIssue;
import com.chuanphat.warranty.core.enums.GoodsIssueType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface GoodsIssueRepository extends JpaRepository<GoodsIssue, Long> {

    Page<GoodsIssue> findByBranchId(Long branchId, Pageable pageable);

    Page<GoodsIssue> findByBranchIdAndStatus(Long branchId, String status, Pageable pageable);

    Page<GoodsIssue> findByBranchIdAndIssueType(Long branchId, GoodsIssueType issueType, Pageable pageable);

    Page<GoodsIssue> findByStatus(String status, Pageable pageable);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(g.issueNo, 4) AS int)), 0) FROM GoodsIssue g WHERE g.issueNo LIKE 'PXK%'")
    int findMaxIssueSeq();
}

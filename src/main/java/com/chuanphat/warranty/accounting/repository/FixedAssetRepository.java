package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.FixedAsset;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FixedAssetRepository extends JpaRepository<FixedAsset, Long> {

    List<FixedAsset> findByBranchIdAndStatusNot(Long branchId, String status);

    List<FixedAsset> findByStatus(String status);

    boolean existsByAssetCode(String assetCode);
}

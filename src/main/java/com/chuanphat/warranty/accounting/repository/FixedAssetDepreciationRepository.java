package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.FixedAssetDepreciation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FixedAssetDepreciationRepository extends JpaRepository<FixedAssetDepreciation, Long> {

    Optional<FixedAssetDepreciation> findByAsset_IdAndDepreciationYearAndDepreciationMonth(
            Long assetId, int year, int month);

    boolean existsByAsset_IdAndDepreciationYearAndDepreciationMonth(
            Long assetId, int year, int month);

    List<FixedAssetDepreciation> findByDepreciationYearAndDepreciationMonthOrderByCreatedAt(
            int year, int month);

    @Query("SELECT COALESCE(SUM(d.amount), 0) FROM FixedAssetDepreciation d WHERE d.asset.id = :assetId")
    java.math.BigDecimal sumTotalByAsset(@Param("assetId") Long assetId);
}

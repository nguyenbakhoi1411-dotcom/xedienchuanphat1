package com.chuanphat.warranty.accounting.repository;

import com.chuanphat.warranty.accounting.entity.ReportCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;

@Repository
public interface ReportCacheRepository extends JpaRepository<ReportCache, Long> {
    Optional<ReportCache> findByReportTypeAndCacheKey(String reportType, String cacheKey);

    @Modifying
    @Query("DELETE FROM ReportCache c WHERE c.expiresAt < :now")
    void deleteExpiredCache(OffsetDateTime now);
    
    @Modifying
    @Query("DELETE FROM ReportCache c")
    void invalidateAll();
}

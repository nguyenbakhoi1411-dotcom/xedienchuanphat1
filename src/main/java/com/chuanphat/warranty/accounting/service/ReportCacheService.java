package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.entity.ReportCache;
import com.chuanphat.warranty.accounting.repository.ReportCacheRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;

@Service
public class ReportCacheService {
    private final ReportCacheRepository cacheRepository;

    public ReportCacheService(ReportCacheRepository cacheRepository) {
        this.cacheRepository = cacheRepository;
    }

    public Optional<String> getCache(String reportType, String cacheKey) {
        Optional<ReportCache> opt = cacheRepository.findByReportTypeAndCacheKey(reportType, cacheKey);
        if (opt.isPresent()) {
            ReportCache cache = opt.get();
            if (cache.getExpiresAt().isAfter(OffsetDateTime.now())) {
                return Optional.of(cache.getResultJson());
            } else {
                cacheRepository.delete(cache);
            }
        }
        return Optional.empty();
    }

    @Transactional
    public void putCache(String reportType, String cacheKey, String resultJson, int ttlMinutes) {
        Optional<ReportCache> opt = cacheRepository.findByReportTypeAndCacheKey(reportType, cacheKey);
        ReportCache cache = opt.orElseGet(() -> {
            ReportCache c = new ReportCache();
            c.setReportType(reportType);
            c.setCacheKey(cacheKey);
            return c;
        });
        
        cache.setResultJson(resultJson);
        cache.setCreatedAt(OffsetDateTime.now());
        cache.setExpiresAt(OffsetDateTime.now().plusMinutes(ttlMinutes));
        
        cacheRepository.save(cache);
    }

    @Transactional
    public void invalidate(Integer year, Integer month) {
        // Invalidate caches that depend on journal entries, usually TrialBalance/BalanceSheet
        // In this implementation, we can just invalidate all to be safe, 
        // or invalidate specific report types if we structure keys to include year/month.
        cacheRepository.invalidateAll();
    }

    // Runs every 5 minutes to clean up expired cache
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void cleanExpiredCache() {
        cacheRepository.deleteExpiredCache(OffsetDateTime.now());
    }
}

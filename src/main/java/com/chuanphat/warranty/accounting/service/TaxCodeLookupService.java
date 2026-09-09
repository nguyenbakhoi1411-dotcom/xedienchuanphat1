package com.chuanphat.warranty.accounting.service;

import com.chuanphat.warranty.accounting.dto.TaxCodeLookupDto;
import com.chuanphat.warranty.accounting.entity.TaxCodeLookupCache;
import com.chuanphat.warranty.accounting.repository.TaxCodeLookupCacheRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Optional;

@Service
public class TaxCodeLookupService {

    private final TaxCodeLookupCacheRepository cacheRepository;

    public TaxCodeLookupService(TaxCodeLookupCacheRepository cacheRepository) {
        this.cacheRepository = cacheRepository;
    }

    public TaxCodeLookupDto lookupTaxCode(String taxCode) {
        Optional<TaxCodeLookupCache> cacheOpt = cacheRepository.findByTaxCode(taxCode);
        
        if (cacheOpt.isPresent()) {
            TaxCodeLookupCache cache = cacheOpt.get();
            // Nếu quá cũ (ví dụ 30 ngày) thì có thể gọi API Tổng cục Thuế để refresh
            // Nhưng hiện tại trả về dữ liệu cache.
            return new TaxCodeLookupDto(cache.getTaxCode(), cache.getCompanyName(), cache.getStatus(), cache.getAddress());
        }

        // Tích hợp API Tổng cục Thuế thật ở đây. Tạm thời trả về UNKNOWN và lưu cache.
        TaxCodeLookupCache newCache = new TaxCodeLookupCache();
        newCache.setTaxCode(taxCode);
        newCache.setCompanyName("Company " + taxCode);
        newCache.setStatus("UNKNOWN");
        newCache.setAddress("Unknown Address");
        newCache.setCheckedAt(OffsetDateTime.now());
        
        cacheRepository.save(newCache);
        
        return new TaxCodeLookupDto(taxCode, newCache.getCompanyName(), newCache.getStatus(), newCache.getAddress());
    }
}

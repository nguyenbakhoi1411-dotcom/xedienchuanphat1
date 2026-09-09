package com.chuanphat.warranty.sales.service;

import com.chuanphat.warranty.core.entity.SalesDiscount;
import com.chuanphat.warranty.core.repository.SalesDiscountRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SalesDiscountService {
    private final SalesDiscountRepository salesDiscountRepository;

    public SalesDiscountService(SalesDiscountRepository salesDiscountRepository) {
        this.salesDiscountRepository = salesDiscountRepository;
    }

    public Page<SalesDiscount> listDiscounts(Long branchId, Pageable pageable) {
        return salesDiscountRepository.findByBranchId(branchId, pageable);
    }

    public SalesDiscount getById(Long id) {
        return salesDiscountRepository.findById(id).orElseThrow(() -> new RuntimeException("Discount not found: " + id));
    }
}

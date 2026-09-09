package com.chuanphat.warranty.sales.service;

import com.chuanphat.warranty.core.entity.SalesVoucher;
import com.chuanphat.warranty.core.repository.CustomerRepository;
import com.chuanphat.warranty.core.repository.SalesVoucherRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SalesVoucherService {
    private final SalesVoucherRepository salesVoucherRepository;
    private final CustomerRepository customerRepository;

    public SalesVoucherService(SalesVoucherRepository salesVoucherRepository, CustomerRepository customerRepository) {
        this.salesVoucherRepository = salesVoucherRepository;
        this.customerRepository = customerRepository;
    }

    public Page<SalesVoucher> listVouchers(Long branchId, String keyword, Pageable pageable) {
        return salesVoucherRepository.findAll(pageable);
    }

    public SalesVoucher getById(Long id) {
        return salesVoucherRepository.findById(id).orElseThrow(() -> new RuntimeException("Voucher not found: " + id));
    }
}

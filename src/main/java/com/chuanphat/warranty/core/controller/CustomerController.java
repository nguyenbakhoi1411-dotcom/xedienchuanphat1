package com.chuanphat.warranty.core.controller;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.core.dto.CustomerDto;
import com.chuanphat.warranty.core.service.CustomerService;
import com.chuanphat.warranty.crm.CrmService;
import com.chuanphat.warranty.crm.dto.CrmDtos;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    private final CustomerService service;
    private final CrmService crmService;

    public CustomerController(CustomerService service, CrmService crmService) {
        this.service = service;
        this.crmService = crmService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('CUSTOMER_VIEW')")
    public PageResponse<CustomerDto> list(@RequestParam(defaultValue = "") String keyword, @RequestParam(required = false) Long branchId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int pageSize) {
        return service.list(keyword, branchId, page, pageSize);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CUSTOMER_CREATE')")
    public CustomerDto create(@Valid @RequestBody CustomerDto request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CUSTOMER_UPDATE')")
    public CustomerDto update(@PathVariable Long id, @Valid @RequestBody CustomerDto request) {
        return service.update(id, request);
    }

    @GetMapping("/{id}/360")
    @PreAuthorize("hasAuthority('CUSTOMER_VIEW')")
    public CrmDtos.Customer360Response customer360(@PathVariable Long id) {
        return crmService.customer360(id);
    }
}

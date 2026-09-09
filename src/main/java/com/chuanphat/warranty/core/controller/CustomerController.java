package com.chuanphat.warranty.core.controller;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.core.dto.CustomerDto;
import com.chuanphat.warranty.core.service.CustomerService;
import com.chuanphat.warranty.crm.CrmService;
import com.chuanphat.warranty.crm.dto.CrmDtos;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@PreAuthorize("hasAnyRole('ADMIN')")
public class CustomerController {
    private final CustomerService service;
    private final CrmService crmService;

    public CustomerController(CustomerService service, CrmService crmService) {
        this.service = service;
        this.crmService = crmService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('CUSTOMER_VIEW')")
    public ResponseEntity<PageResponse<CustomerDto>> list(@RequestParam(defaultValue = "") String keyword, @RequestParam(required = false) Long branchId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(service.list(keyword, branchId, page, pageSize));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CUSTOMER_CREATE')")
    public ResponseEntity<CustomerDto> create(@Valid @RequestBody CustomerDto request) {
        return ResponseEntity.ok(service.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CUSTOMER_UPDATE')")
    public ResponseEntity<CustomerDto> update(@PathVariable Long id, @Valid @RequestBody CustomerDto request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @GetMapping("/{id}/360")
    @PreAuthorize("hasAuthority('CUSTOMER_VIEW')")
    public ResponseEntity<CrmDtos.Customer360Response> customer360(@PathVariable Long id) {
        return ResponseEntity.ok(crmService.customer360(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CUSTOMER_DELETE')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('CUSTOMER_VIEW')")
    public ResponseEntity<java.util.List<CustomerDto>> search(@RequestParam("q") String keyword) {
        return ResponseEntity.ok(service.searchSimple(keyword));
    }
}


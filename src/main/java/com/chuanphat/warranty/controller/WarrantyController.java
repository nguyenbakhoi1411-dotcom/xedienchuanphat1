package com.chuanphat.warranty.controller;

import com.chuanphat.warranty.dto.CreateWarrantyRequest;
import com.chuanphat.warranty.dto.ServiceProfessionalDtos;
import com.chuanphat.warranty.dto.WarrantyResponse;
import com.chuanphat.warranty.service.WarrantyService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/warranties")
public class WarrantyController {
    private final WarrantyService warrantyService;

    public WarrantyController(WarrantyService warrantyService) {
        this.warrantyService = warrantyService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('WARRANTY_MANAGE')")
    public WarrantyResponse create(@Valid @RequestBody CreateWarrantyRequest request) {
        return warrantyService.create(request);
    }

    @GetMapping("/{serialNumber}")
    @PreAuthorize("hasAuthority('WARRANTY_VIEW')")
    public WarrantyResponse checkBySerial(@PathVariable String serialNumber) {
        return warrantyService.checkBySerial(serialNumber);
    }

    @GetMapping("/policies")
    @PreAuthorize("hasAuthority('WARRANTY_VIEW')")
    public List<ServiceProfessionalDtos.WarrantyPolicyResponse> policies() {
        return warrantyService.policies();
    }

    @PostMapping("/policies")
    @PreAuthorize("hasAuthority('WARRANTY_MANAGE')")
    public ServiceProfessionalDtos.WarrantyPolicyResponse createPolicy(@Valid @RequestBody ServiceProfessionalDtos.WarrantyPolicyRequest request) {
        return warrantyService.createPolicy(request);
    }
}

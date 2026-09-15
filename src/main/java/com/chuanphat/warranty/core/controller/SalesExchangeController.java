package com.chuanphat.warranty.core.controller;

import com.chuanphat.warranty.core.dto.CreateSalesExchangeRequest;
import com.chuanphat.warranty.core.dto.SalesExchangeHistoryResponse;
import com.chuanphat.warranty.core.dto.SalesExchangeResponse;
import com.chuanphat.warranty.core.service.SalesExchangeService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sales/exchanges")
public class SalesExchangeController {
    private final SalesExchangeService service;

    public SalesExchangeController(SalesExchangeService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SALES_RETURN')")
    public SalesExchangeResponse create(@Valid @RequestBody CreateSalesExchangeRequest request) {
        return service.createExchange(request);
    }

    @GetMapping("/{exchangeGroupId}")
    @PreAuthorize("hasAuthority('SALES_VIEW')")
    public SalesExchangeHistoryResponse history(@PathVariable UUID exchangeGroupId) {
        return service.history(exchangeGroupId);
    }
}

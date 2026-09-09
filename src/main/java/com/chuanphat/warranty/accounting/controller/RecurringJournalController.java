package com.chuanphat.warranty.accounting.controller;

import com.chuanphat.warranty.accounting.dto.RecurringJournalDto;
import com.chuanphat.warranty.accounting.dto.RecurringJournalRequest;
import com.chuanphat.warranty.accounting.service.RecurringJournalService;
import com.chuanphat.warranty.common.dto.PageResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/accounting/recurring-journals")
@PreAuthorize("hasAnyRole('ADMIN')")
public class RecurringJournalController {

    private final RecurringJournalService service;

    public RecurringJournalController(RecurringJournalService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ACCOUNTING_VIEW')")
    public PageResponse<RecurringJournalDto> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return service.list(keyword, page, size);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ACCOUNTING_EDIT')")
    public RecurringJournalDto create(@Valid @RequestBody RecurringJournalRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ACCOUNTING_EDIT')")
    public RecurringJournalDto update(@PathVariable Long id, @Valid @RequestBody RecurringJournalRequest req) {
        return service.update(id, req);
    }

    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasAuthority('ACCOUNTING_EDIT')")
    public RecurringJournalDto deactivate(@PathVariable Long id) {
        return service.deactivate(id);
    }

    @PostMapping("/run")
    @PreAuthorize("hasAuthority('ACCOUNTING_EDIT')")
    public void run(@RequestParam LocalDate runDate) {
        service.runRecurringJournals(runDate);
    }
}


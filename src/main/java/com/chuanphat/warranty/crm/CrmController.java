package com.chuanphat.warranty.crm;

import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.crm.dto.CrmDtos;
import com.chuanphat.warranty.crm.entity.CustomerGroup;
import com.chuanphat.warranty.crm.enums.CrmTaskStatus;
import com.chuanphat.warranty.crm.enums.LeadStatus;
import com.chuanphat.warranty.crm.enums.OpportunityStage;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/crm")
@PreAuthorize("hasAnyRole('ADMIN')")
public class CrmController {
    private final CrmService service;

    public CrmController(CrmService service) {
        this.service = service;
    }

    // ── Customer Groups ───────────────────────────────────────────

    @GetMapping("/customer-groups")
    @PreAuthorize("hasAuthority('CUSTOMER_VIEW')")
    public List<CustomerGroup> customerGroups() {
        return service.listCustomerGroups();
    }

    // ── Customers ─────────────────────────────────────────────────

    @GetMapping("/customers")
    @PreAuthorize("hasAuthority('CUSTOMER_VIEW')")
    public PageResponse<CrmDtos.CustomerSummary> customers(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) Long branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return service.listCustomers(keyword, branchId, page, size);
    }

    @GetMapping("/customers/{id}/360")
    @PreAuthorize("hasAuthority('CUSTOMER_VIEW')")
    public CrmDtos.Customer360Response customer360(@PathVariable Long id) {
        return service.customer360(id);
    }

    @PostMapping("/customers/{customerId}/notes")
    @PreAuthorize("hasAuthority('CUSTOMER_UPDATE')")
    public CrmDtos.CareNoteResponse addNote(@PathVariable Long customerId,
                                             @Valid @RequestBody CrmDtos.CareNoteRequest request) {
        return service.addCustomerNote(customerId, request);
    }

    @PostMapping("/customers/refresh-segments")
    @PreAuthorize("hasAuthority('CUSTOMER_UPDATE')")
    public void refreshSegments() {
        service.refreshCustomerSegments();
    }

    // ── Leads ─────────────────────────────────────────────────────

    @GetMapping("/leads")
    @PreAuthorize("hasAuthority('CUSTOMER_VIEW')")
    public PageResponse<CrmDtos.LeadResponse> leads(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) LeadStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return service.listLeads(keyword, status, page, pageSize);
    }

    /** Kanban pipeline view */
    @GetMapping("/leads/pipeline")
    @PreAuthorize("hasAuthority('CUSTOMER_VIEW')")
    public Map<LeadStatus, List<CrmDtos.LeadResponse>> pipeline() {
        return service.getPipeline();
    }

    @PostMapping("/leads")
    @PreAuthorize("hasAuthority('CUSTOMER_CREATE')")
    public CrmDtos.LeadResponse createLead(@Valid @RequestBody CrmDtos.LeadRequest request) {
        return service.createLead(request);
    }

    @PutMapping("/leads/{id}")
    @PreAuthorize("hasAuthority('CUSTOMER_UPDATE')")
    public CrmDtos.LeadResponse updateLead(@PathVariable Long id,
                                            @Valid @RequestBody CrmDtos.LeadRequest request) {
        return service.updateLead(id, request);
    }

    /** Advance lead to next pipeline stage */
    @PostMapping("/leads/{id}/advance")
    @PreAuthorize("hasAuthority('CUSTOMER_UPDATE')")
    public CrmDtos.LeadResponse advanceLead(@PathVariable Long id,
                                             @RequestBody CrmDtos.LeadAdvanceRequest req) {
        return service.advanceLead(id, req.targetStatus(), req.reason());
    }

    @PostMapping("/leads/{id}/convert-customer")
    @PreAuthorize("hasAuthority('CUSTOMER_CREATE')")
    public CrmDtos.Customer360Response convertLeadToCustomer(@PathVariable Long id,
                                                              @RequestBody CrmDtos.ConvertLeadRequest request) {
        return service.convertLeadToCustomer(id, request);
    }

    @PostMapping("/leads/{id}/convert-opportunity")
    @PreAuthorize("hasAuthority('SALES_CREATE')")
    public CrmDtos.OpportunityResponse convertLeadToOpportunity(@PathVariable Long id,
                                                                  @Valid @RequestBody CrmDtos.OpportunityRequest request) {
        return service.convertLeadToOpportunity(id, request);
    }

    // ── Opportunities ─────────────────────────────────────────────

    @GetMapping("/opportunities")
    @PreAuthorize("hasAuthority('SALES_VIEW')")
    public List<CrmDtos.OpportunityResponse> opportunities(@RequestParam(required = false) OpportunityStage stage) {
        return service.listOpportunities(stage);
    }

    @PostMapping("/opportunities")
    @PreAuthorize("hasAuthority('SALES_CREATE')")
    public CrmDtos.OpportunityResponse createOpportunity(@Valid @RequestBody CrmDtos.OpportunityRequest request) {
        return service.createOpportunity(request);
    }

    @PutMapping("/opportunities/{id}")
    @PreAuthorize("hasAuthority('SALES_UPDATE')")
    public CrmDtos.OpportunityResponse updateOpportunity(@PathVariable Long id,
                                                          @Valid @RequestBody CrmDtos.OpportunityRequest request) {
        return service.updateOpportunity(id, request);
    }

    // ── Tasks ─────────────────────────────────────────────────────

    @GetMapping("/tasks")
    @PreAuthorize("hasAuthority('CUSTOMER_VIEW')")
    public PageResponse<CrmDtos.CareTaskResponse> tasks(
            @RequestParam(required = false) CrmTaskStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return service.listTasks(status, page, pageSize);
    }

    @PostMapping("/tasks")
    @PreAuthorize("hasAuthority('CUSTOMER_UPDATE')")
    public CrmDtos.CareTaskResponse createTask(@Valid @RequestBody CrmDtos.CareTaskRequest request) {
        return service.createTask(request);
    }

    @PatchMapping("/tasks/{id}/status")
    @PreAuthorize("hasAuthority('CUSTOMER_UPDATE')")
    public CrmDtos.CareTaskResponse updateTaskStatus(@PathVariable Long id,
                                                      @Valid @RequestBody CrmDtos.TaskStatusRequest request) {
        return service.updateTaskStatus(id, request);
    }

    // ── Alerts ────────────────────────────────────────────────────

    @GetMapping("/alerts")
    @PreAuthorize("hasAuthority('CUSTOMER_VIEW')")
    public List<CrmDtos.AlertResponse> alerts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return service.getAlerts(page, size);
    }

    @PostMapping("/alerts/{id}/dismiss")
    @PreAuthorize("hasAuthority('CUSTOMER_UPDATE')")
    public void dismissAlert(@PathVariable Long id,
                              @RequestParam(defaultValue = "CURRENT_USER") String by) {
        service.dismissAlert(id, by);
    }

    // ── Reports ───────────────────────────────────────────────────

    @GetMapping("/reports")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public CrmDtos.CrmReportResponse reports() {
        return service.reports();
    }
}


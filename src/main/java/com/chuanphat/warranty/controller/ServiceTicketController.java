package com.chuanphat.warranty.controller;

import com.chuanphat.warranty.dto.AddServiceTicketItemRequest;
import com.chuanphat.warranty.dto.AssignTechnicianRequest;
import com.chuanphat.warranty.dto.CreateServiceTicketRequest;
import com.chuanphat.warranty.dto.RepairCostResponse;
import com.chuanphat.warranty.dto.ServiceTicketResponse;
import com.chuanphat.warranty.dto.ServiceProfessionalDtos;
import com.chuanphat.warranty.dto.UpdateTicketStatusRequest;
import com.chuanphat.warranty.common.dto.PageResponse;
import com.chuanphat.warranty.enums.ServiceTicketStatus;
import com.chuanphat.warranty.service.ServiceTicketService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/service-tickets")
@PreAuthorize("hasAnyRole('ADMIN')")
public class ServiceTicketController {
    private final ServiceTicketService serviceTicketService;

    public ServiceTicketController(ServiceTicketService serviceTicketService) {
        this.serviceTicketService = serviceTicketService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('WARRANTY_VIEW')")
    public PageResponse<ServiceTicketResponse> list(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(required = false) ServiceTicketStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        return serviceTicketService.list(keyword, status, page, pageSize);
    }

    @GetMapping("/{ticketId}")
    @PreAuthorize("hasAuthority('WARRANTY_VIEW')")
    public ServiceTicketResponse detail(@PathVariable Long ticketId) {
        return serviceTicketService.detail(ticketId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('WARRANTY_MANAGE')")
    public ServiceTicketResponse create(@Valid @RequestBody CreateServiceTicketRequest request) {
        return serviceTicketService.create(request);
    }

    @PatchMapping("/{ticketId}/status")
    @PreAuthorize("hasAuthority('WARRANTY_MANAGE')")
    public ServiceTicketResponse updateStatus(
            @PathVariable Long ticketId,
            @Valid @RequestBody UpdateTicketStatusRequest request
    ) {
        return serviceTicketService.updateStatus(ticketId, request);
    }

    @PatchMapping("/{ticketId}/technician")
    @PreAuthorize("hasAuthority('WARRANTY_MANAGE')")
    public ServiceTicketResponse assignTechnician(
            @PathVariable Long ticketId,
            @Valid @RequestBody AssignTechnicianRequest request
    ) {
        return serviceTicketService.assignTechnician(ticketId, request);
    }

    @PostMapping("/{ticketId}/items")
    @PreAuthorize("hasAuthority('WARRANTY_MANAGE')")
    public ServiceTicketResponse addItem(
            @PathVariable Long ticketId,
            @Valid @RequestBody AddServiceTicketItemRequest request
    ) {
        return serviceTicketService.addItem(ticketId, request);
    }

    @PatchMapping("/{ticketId}/diagnosis")
    @PreAuthorize("hasAuthority('WARRANTY_MANAGE')")
    public ServiceTicketResponse updateDiagnosis(@PathVariable Long ticketId, @RequestBody ServiceProfessionalDtos.DiagnosisRequest request) {
        return serviceTicketService.updateDiagnosis(ticketId, request);
    }

    @PostMapping("/{ticketId}/quotation")
    @PreAuthorize("hasAuthority('WARRANTY_MANAGE')")
    public ServiceProfessionalDtos.RepairQuotationResponse createQuotation(@PathVariable Long ticketId, @RequestBody ServiceProfessionalDtos.RepairQuotationRequest request) {
        return serviceTicketService.createQuotation(ticketId, request);
    }

    @PostMapping("/{ticketId}/quotation/approve")
    @PreAuthorize("hasAuthority('WARRANTY_MANAGE')")
    public ServiceProfessionalDtos.RepairQuotationResponse approveQuotation(@PathVariable Long ticketId) {
        return serviceTicketService.approveQuotation(ticketId);
    }

    @PostMapping("/{ticketId}/invoice")
    @PreAuthorize("hasAuthority('WARRANTY_MANAGE')")
    public ServiceProfessionalDtos.ServiceInvoiceResponse createInvoice(@PathVariable Long ticketId) {
        return serviceTicketService.createServiceInvoice(ticketId);
    }

    @GetMapping("/{ticketId}/timeline")
    @PreAuthorize("hasAuthority('WARRANTY_VIEW')")
    public List<ServiceProfessionalDtos.TimelineResponse> timeline(@PathVariable Long ticketId) {
        return serviceTicketService.timeline(ticketId);
    }

    @GetMapping("/reports")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ServiceProfessionalDtos.ServiceReportResponse reports() {
        return serviceTicketService.report();
    }

    @GetMapping("/{ticketId}/cost")
    @PreAuthorize("hasAuthority('WARRANTY_VIEW')")
    public RepairCostResponse calculateCost(@PathVariable Long ticketId) {
        return serviceTicketService.calculateCost(ticketId);
    }

    @GetMapping("/{ticketId}/pdf")
    @PreAuthorize("hasAuthority('INVOICE_EXPORT')")
    public ResponseEntity<byte[]> serviceTicketPdf(@PathVariable Long ticketId) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=service-ticket-" + ticketId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(serviceTicketService.serviceTicketPdf(ticketId));
    }

    @GetMapping("/vehicles/{vehicleId}/history")
    @PreAuthorize("hasAuthority('WARRANTY_VIEW')")
    public List<ServiceTicketResponse> historyByVehicle(@PathVariable Long vehicleId) {
        return serviceTicketService.historyByVehicle(vehicleId);
    }
}

